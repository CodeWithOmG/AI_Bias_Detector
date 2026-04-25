# Deployment Instructions for FairMIND

This project consists of a **Next.js Frontend** and a **FastAPI Backend**.

## Option 1: Docker (Recommended for VPS)

1. Ensure Docker and Docker Compose are installed.
2. Run:
   ```bash
   docker-compose up --build
   ```
3. Access the app at `http://localhost:3000`.

## Option 2: Cloud Hosting (Vercel + Render)

### 1. Deploy the Backend (FastAPI) on Render
- Connect your GitHub repository to [Render](https://render.com).
- Create a new **Web Service**.
- Select the `backend/` directory as the root.
- Use the following settings:
  - **Runtime**: `Python 3`
  - **Build Command**: `pip install -r requirements.txt`
  - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Once deployed, copy your Render service URL (e.g., `https://fairmind-backend.onrender.com`).

### 2. Deploy the Frontend (Next.js) on Vercel
- Connect your GitHub repository to [Vercel](https://vercel.com).
- Vercel will automatically detect the Next.js project.
- In the **Environment Variables** section, add:
  - `NEXT_PUBLIC_API_URL`: [Your Render Backend URL]
- Click **Deploy**.

## Option 3: Manual Deployment
If running manually on a server:
- **Backend**: `cd backend && pip install -r requirements.txt && uvicorn main:app`
- **Frontend**: `npm install && npm run build && npm start`
