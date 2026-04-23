import io
from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class BiasScore(BaseModel):
    category: str
    score: float
    status: str
    details: str

class AuditResponse(BaseModel):
    overall_fairness_score: float
    categories: list[BiasScore]
    summary: str

class HistoryEntry(BaseModel):
    id: int
    datasetName: str
    domain: str
    originalScore: float
    mitigation: str
    newScore: float
    date: str

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Universal AI Fairness & Bias Detection API is running. Use the /audit endpoint via POST to validate datasets."}

@app.get("/history", response_model=list[HistoryEntry])
def get_history():
    return [
        { "id": 1, "datasetName": "Patient Admissions 2023", "domain": "Healthcare", "originalScore": 62.5, "mitigation": "Threshold Adjustment", "newScore": 88.2, "date": "2024-03-15" },
        { "id": 2, "datasetName": "Loan Applications Q1", "domain": "Finance", "originalScore": 58.0, "mitigation": "Data Reweighting", "newScore": 91.5, "date": "2024-04-02" },
        { "id": 3, "datasetName": "Tech Resume Screening", "domain": "Hiring", "originalScore": 45.3, "mitigation": "Adversarial Debiasing", "newScore": 85.7, "date": "2024-04-18" },
        { "id": 4, "datasetName": "Credit Scoring Model v2", "domain": "Finance", "originalScore": 72.1, "mitigation": "Fairness Constraint", "newScore": 94.0, "date": "2024-04-20" }
    ]

@app.post("/audit", response_model=AuditResponse)
async def audit_dataset(file: UploadFile = File(...), domain: str = Form("Universal")):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")
    
    content = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(content))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid CSV file format.")

    columns_lower = [col.lower() for col in df.columns]
    
    if domain == "Healthcare":
        keywords = ['diagnosis', 'patient', 'treatment', 'age']
        if not any(kw in col for kw in keywords for col in columns_lower):
            raise HTTPException(status_code=400, detail="Domain Mismatch: Non-Healthcare dataset detected in Healthcare context")
    elif domain == "Finance":
        keywords = ['credit', 'loan', 'income', 'amount']
        if not any(kw in col for kw in keywords for col in columns_lower):
            raise HTTPException(status_code=400, detail="Domain Mismatch: Non-Finance dataset detected in Finance context")
    elif domain == "Hiring":
        keywords = ['candidate', 'resume', 'role', 'interview', 'salary', 'ethnicity']
        if not any(kw in col for kw in keywords for col in columns_lower):
            raise HTTPException(status_code=400, detail="Domain Mismatch: Non-Hiring dataset detected in Hiring context")

    target_col = None
    if "Actual Amount" in df.columns:
        target_col = "Actual Amount"
    else:
        num_cols = df.select_dtypes(include=[np.number]).columns
        if len(num_cols) > 0:
            target_col = num_cols[0]
            
    if not target_col:
        raise HTTPException(status_code=400, detail="Please specify the target column and bias-sensitive columns.")

    cat_cols = df.select_dtypes(include=['object', 'category']).columns
    if len(cat_cols) == 0:
        raise HTTPException(status_code=400, detail="Please specify the target column and bias-sensitive columns.")

    bias_columns = ["Department", "Gender", "Race", "Ethnicity"]
    analysis_col = None
    for col in bias_columns:
        if col in cat_cols:
            analysis_col = col
            break
            
    if not analysis_col:
        analysis_col = cat_cols[0]

    grouped = df.groupby(analysis_col)[target_col].mean()
    max_val = grouped.max()
    
    if max_val == 0 or pd.isna(max_val):
        raise HTTPException(status_code=400, detail="Target metric values are zero or null.")

    categories = []
    total_score = 0
    count = 0

    for cat, val in grouped.items():
        ratio = val / max_val
        score = float(ratio * 100)
        
        status = "Pass"
        if score < 80:
            status = "Fail"
        elif score < 90:
            status = "Warning"
            
        details = f"Mean {target_col}: {val:.2f} ({score:.1f}% of highest group)"
        
        categories.append(BiasScore(
            category=str(cat),
            score=score,
            status=status,
            details=details
        ))
        
        total_score += score
        count += 1

    overall_score = total_score / count if count > 0 else 0

    summary = f"Analyzed {analysis_col} against {target_col}. "
    failures = [c.category for c in categories if c.status == "Fail"]
    if failures:
        summary += f"Significant disparate impact detected in: {', '.join(failures)}."
    else:
        summary += "No critical biases found across groups."

    return AuditResponse(
        overall_fairness_score=overall_score,
        categories=categories,
        summary=summary
    )
