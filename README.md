# Telugu Multimodal Chatbot Application

A fully functional multimodal chatbot designed for preserving and interacting with Telugu cultural data. This application enables conversational querying (via Local LLM using RAG), direct audio transmission, dataset collection for future LLM training, and an admin verification dashboard.

## Tech Stack
- **Frontend**: Next.js (App Router), React, TailwindCSS
- **Backend**: Python, FastAPI, SQLAlchemy, SQLite (configurable to PostgreSQL)
- **Vector Database**: ChromaDB (via LangChain)
- **Audio Processing**: HuggingFace Embeddings, Local ASR (stubs ready for Whisper), and `gTTS` for Text-to-Speech

## Setup Instructions

### 1. Backend Setup
The backend requires Python 3.10+ and a local installation of Ollama.
1. Install [Ollama](https://ollama.com/) and download your preferred model:
   ```bash
   ollama run llama3
   ```
2. Navigate to the `backend` directory and activate the environment:
   ```cmd
   cd backend
   python -m venv venv
   .\venv\Scripts\activate
   pip install -r requirements.txt
   ```
3. Run the Backend:
   ```cmd
   .\run_backend.bat
   ```
   *The API will start at http://localhost:8000. On first start, it will create `teluguchat.db` automatically.*

### 2. Frontend Setup
The frontend uses Next.js 15.
1. Navigate to the `frontend` directory:
   ```cmd
   cd frontend
   ```
2. Run the development server (dependencies should already be installed):
   ```cmd
   .\run_frontend.bat
   ```
   *The web UI will start at http://localhost:3000.*

## Features
- **Interactive Chat (/page.tsx)**: Speak (using the mic button) or type in Telugu to ask questions about culture. The AI replies via text and audio!
- **Data Collection (/collect/page.tsx)**: Interviewers can easily set speaker metadata (e.g. topic, age, gender) and upload speech directly to the server to be transcribed and stored.
- **Admin Validation (/admin/page.tsx)**: Moderators can review transcripts, listen to original recordings, and 'Approve/Reject' samples to export clean datasets for upcoming Telugu LLM finetuning.

---

## Live Deployment (GitHub)

To host your Telugu Multimodal Chatbot live for others to use, you should decouple the frontend and backend hosting.

### 1. Pushing to GitHub
First, initialize your project and push it to a new GitHub repository:
```cmd
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/telugu-chatbot.git
git push -u origin main
```

### 2. Live Frontend Hosting (Vercel)
The easiest way to host a Next.js frontend is [Vercel](https://vercel.com).
1. Go to Vercel and create a new project.
2. Select your newly created GitHub repository.
3. Set the **Root Directory** to `frontend`.
4. In the "Environment Variables" section, add a new variable: 
   - **Name:** `NEXT_PUBLIC_API_URL`
   - **Value:** *(The exact live URL of your backend, e.g. `https://my-telugu-backend.onrender.com`)*
5. Click **Deploy**. Your UI is now live!

### 3. Live Backend Hosting (Render or Railway)
Because the FastApi backend uses Python, ML libraries, and Vector databases, standard static hosting won't work. We recommend [Render](https://render.com) or [Railway](https://railway.app).
1. Go to Render and create a new **Web Service**.
2. Connect your GitHub repository.
3. Set the **Root Directory** setting to `backend` (or leave it blank, but make sure the start command is correct).
4. Set the **Start Command** to: `uvicorn main:app --host 0.0.0.0 --port 10000`
5. *Note on local LLMs/Ollama*: Free-tier cloud providers usually don't have GPUs. To run this live, you will most likely need to configure LangChain to use an external API (like Groq, TogetherAI, or OpenAI) rather than a local Ollama instance running `llama3`.
