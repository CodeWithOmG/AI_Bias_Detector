import io
import os
import zipfile
import tempfile
import shutil
import re
from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel

app = FastAPI()

class CodeBiasIssue(BaseModel):
    file: str
    line: int
    snippet: str
    reason: str

@app.post("/api/audit-code")
async def audit_code(file: UploadFile = File(...)):
    if not file.filename.endswith(".zip"):
        raise HTTPException(status_code=400, detail="Only ZIP files are supported.")
    
    content = await file.read()
    temp_dir = tempfile.mkdtemp()
    zip_path = os.path.join(temp_dir, "upload.zip")
    
    with open(zip_path, "wb") as f:
        f.write(content)
    
    extract_dir = os.path.join(temp_dir, "extracted")
    os.makedirs(extract_dir)
    
    try:
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_dir)
    except Exception:
        shutil.rmtree(temp_dir)
        raise HTTPException(status_code=400, detail="Invalid ZIP file.")

    issues = []
    sensitive_keywords = ["gender", "race", "ethnicity", "religion", "age", "disability", "sexual_orientation", "nationality", "marital_status", "pregnancy"]
    patterns = [
        re.compile(rf"\b(if|elif|else if|case|switch|return)\b.*?\b({'|'.join(sensitive_keywords)})\b", re.IGNORECASE),
        re.compile(rf"\b({'|'.join(sensitive_keywords)})\b.*?[=<>!]+", re.IGNORECASE)
    ]

    for root, _, files in os.walk(extract_dir):
        for filename in files:
            if filename.endswith(('.py', '.js', '.jsx', '.ts', '.tsx', '.java', '.cpp', '.c', '.cs', '.php', '.rb', '.go')):
                file_path = os.path.join(root, filename)
                rel_path = os.path.relpath(file_path, extract_dir)
                
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        lines = f.readlines()
                        for i, line in enumerate(lines):
                            line_content = line.strip()
                            if not line_content or line_content.startswith(('#', '//', '/*', '*')):
                                continue
                            
                            for pattern in patterns:
                                if pattern.search(line_content):
                                    issues.append(CodeBiasIssue(
                                        file=rel_path,
                                        line=i + 1,
                                        snippet=line_content,
                                        reason=f"Potential bias detected: logic depends on sensitive attribute '{pattern.search(line_content).group(2)}'."
                                    ))
                                    break
                except Exception:
                    continue

    shutil.rmtree(temp_dir)
    return issues
