# UNIBEN Compass AI

UNIBEN Compass AI is an AI-powered university inquiry assistant created for the University of Benin community. It helps prospective students, admitted students, current students, parents, staff, and members of the public find clear answers to questions about admissions, academic programmes, Post-UTME, postgraduate studies, clearance, fees, campuses, student services, and other university-related topics.

Unlike a general-purpose chatbot, UNIBEN Compass AI uses retrieval-augmented generation (RAG) to search a dedicated University of Benin knowledge base before generating an answer. Relevant passages are retrieved from Supabase using vector similarity search and supplied to the language model as supporting context. The application also displays the retrieved sources so users can see which knowledge-base documents informed an answer.

> **Project status:** Active development. Information produced by the assistant should be confirmed through official University of Benin channels before it is used for admission, payment, registration, or other important decisions.

## Key Features

- AI-assisted answers to University of Benin inquiries
- Retrieval-augmented generation using a custom knowledge base
- Semantic search with OpenAI embeddings and Supabase pgvector
- Source attribution for retrieved knowledge
- Audience-aware responses for different categories of users
- Conversation history and chat persistence
- Responsive interface for desktop and mobile devices
- FastAPI REST API with automatic interactive documentation
- Support for OpenAI or OpenRouter as the chat-model provider
- Separate frontend and backend applications for independent deployment

## Technology Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase JavaScript client
- Lucide React icons

### Backend

- Python 3.11
- FastAPI
- Uvicorn
- Pydantic
- OpenAI Python SDK
- Supabase Python client

### Data and AI

- Supabase PostgreSQL
- pgvector
- OpenAI embeddings
- OpenAI or OpenRouter chat models
- Retrieval-augmented generation

### Deployment

- GitHub for source control
- Render for the FastAPI backend
- Vercel for the Next.js frontend
- Supabase for the hosted database and vector store

## How It Works

When a user submits a question, the application follows this sequence:

1. The Next.js frontend sends the question, audience, chat ID, and recent conversation history to the FastAPI backend.
2. The backend creates an embedding for the question using the configured OpenAI embedding model.
3. Supabase pgvector compares the question embedding with stored knowledge chunks.
4. The most relevant chunks are returned by the `match_knowledge_chunks` database function.
5. The retrieved content is formatted and added to the language model's context.
6. The configured OpenAI or OpenRouter model generates an answer grounded in that context.
7. The answer and retrieved sources are returned to the frontend.
8. The conversation is saved in Supabase.

```text
User question
     |
     v
Next.js frontend
     |
     v
FastAPI /api/chat
     |
     +--> OpenAI embedding
     |
     +--> Supabase pgvector search
     |
     +--> Relevant knowledge chunks
     |
     +--> OpenAI/OpenRouter chat model
     |
     v
Answer + sources
```

## Repository Structure

```text
uniben-compass-ai/
|-- backend/
|   |-- app/
|   |   |-- routes/
|   |   |   |-- chat.py
|   |   |   |-- health.py
|   |   |   `-- ingest.py
|   |   |-- ai.py
|   |   |-- config.py
|   |   |-- database.py
|   |   |-- main.py
|   |   |-- models.py
|   |   `-- rag.py
|   |-- knowledge_base/
|   |   `-- seed/
|   |       `-- uniben_starter_faq.md
|   |-- scripts/
|   |   `-- ingest_knowledge.py
|   |-- tests/
|   |   `-- test_health.py
|   |-- .env.example
|   |-- requirements.txt
|   `-- README.md
|-- frontend/
|   |-- app/
|   |-- components/
|   |-- lib/
|   |-- .env.local.example
|   |-- package.json
|   `-- README.md
|-- supabase/
|   `-- schema.sql
|-- .gitignore
`-- README.md
```

## Prerequisites

Install or create the following before running the project:

- Git
- Git Bash
- Python 3.11
- Node.js and npm
- A Supabase project
- An OpenAI API key for embeddings
- An OpenAI or OpenRouter API key for chat completion

Even when OpenRouter is selected for chat generation, an OpenAI API key is currently required for knowledge-base embeddings.

## Local Setup with Git Bash

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/uniben-compass-ai.git
cd uniben-compass-ai
```

If the project already exists locally, open Git Bash and enter:

```bash
cd ~/Desktop/FULL-STACK-AI/uniben-compass-ai
```

### 2. Configure Supabase

1. Create a project in Supabase.
2. Open the Supabase SQL Editor.
3. Copy the contents of `supabase/schema.sql`.
4. Run the SQL script.

The schema creates:

- `chats`
- `messages`
- `knowledge_documents`
- `knowledge_chunks`
- The pgvector extension
- A vector similarity index
- The `match_knowledge_chunks` search function

### 3. Set up the backend

```bash
cd ~/Desktop/FULL-STACK-AI/uniben-compass-ai/backend
py -3 -m venv .venv
source .venv/Scripts/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
cp .env.example .env
```

Open the environment file:

```bash
notepad .env
```

Example configuration using OpenRouter for chat:

```env
APP_NAME=UNIBEN Compass AI
APP_ENV=development
FRONTEND_ORIGIN=http://localhost:3005

AI_PROVIDER=openrouter

OPENAI_API_KEY=your_openai_api_key
OPENAI_CHAT_MODEL=gpt-4.1-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=openai/gpt-4.1-mini
OPENROUTER_SITE_URL=http://localhost:3005
OPENROUTER_SITE_NAME=UNIBEN Compass AI

SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

To use OpenAI for chat instead:

```env
AI_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key
OPENAI_CHAT_MODEL=gpt-4.1-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

Never commit `.env`, API keys, or the Supabase service-role key to GitHub.

Start the backend:

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8005
```

Backend addresses:

- API root: `http://localhost:8005`
- Health check: `http://localhost:8005/health`
- Interactive API documentation: `http://localhost:8005/docs`

### 4. Set up the frontend

Open a second Git Bash window:

```bash
cd ~/Desktop/FULL-STACK-AI/uniben-compass-ai/frontend
npm install
cp .env.local.example .env.local
```

The local frontend environment file should contain:

```env
NEXT_PUBLIC_API_URL=http://localhost:8005
```

Start the frontend:

```bash
npm run dev
```

Open `http://localhost:3005` in a browser.

## Knowledge-Base Ingestion

Place Markdown knowledge documents in:

```text
backend/knowledge_base/seed/
```

Then run:

```bash
cd ~/Desktop/FULL-STACK-AI/uniben-compass-ai/backend
source .venv/Scripts/activate
python scripts/ingest_knowledge.py
```

The script:

1. Finds every `.md` file in the seed directory.
2. Reads and normalizes its content.
3. Splits the content into overlapping chunks.
4. Creates an embedding for every chunk.
5. Inserts the document and its chunks into Supabase.

### Ingestion warning

The current ingestion script does not perform duplicate detection. Running it repeatedly inserts additional copies of existing documents and chunks. Check the Supabase tables before re-ingesting an unchanged knowledge base.

## Testing RAG Retrieval

A strong RAG test uses a unique phrase that a general language model would not already know.

1. Create a temporary Markdown file in `backend/knowledge_base/seed/`.
2. Add a unique verification phrase.
3. Run the ingestion script.
4. Ask the chatbot for the phrase.
5. Confirm that the answer includes the phrase and lists the temporary file as a source.
6. Delete the temporary document from Supabase and ask again.

If the chatbot knows the phrase only while the document is stored in Supabase, retrieval is working correctly.

You can also test the API directly:

```bash
curl -s -X POST http://localhost:8005/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "When was the University of Benin established?",
    "chat_id": null,
    "history": [],
    "audience": "general"
  }'
```

The response contains:

```json
{
  "chat_id": "generated-chat-id",
  "answer": "Generated answer",
  "sources": [
    {
      "title": "Knowledge document title",
      "url": null,
      "content": "Retrieved supporting passage"
    }
  ]
}
```

A non-empty and relevant `sources` array confirms that semantic retrieval returned supporting knowledge.

## API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/` | Confirms that the backend is running |
| `GET` | `/health` | Returns application health information |
| `POST` | `/api/chat` | Searches the knowledge base and generates an answer |
| `POST` | `/api/knowledge/ingest` | Inserts supplied knowledge into the vector store |
| `GET` | `/docs` | Opens FastAPI's interactive API documentation |

## Running Tests

From the backend directory:

```bash
source .venv/Scripts/activate
pytest
```

Run frontend checks:

```bash
cd ~/Desktop/FULL-STACK-AI/uniben-compass-ai/frontend
npm run build
```

## Deployment

### Deploy the backend to Render

Create a Render Web Service connected to the GitHub repository.

Use these settings:

```text
Branch: main or your active production branch
Root Directory: backend
Language: Python 3
Build Command: pip install -r requirements.txt
Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
Health Check Path: /health
```

Add the backend environment variables through the Render dashboard. Do not upload the local `.env` file.

Recommended production variables include:

```env
APP_ENV=production
FRONTEND_ORIGIN=https://your-frontend.vercel.app
AI_PROVIDER=openrouter
OPENAI_API_KEY=your_secret
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
OPENROUTER_API_KEY=your_secret
OPENROUTER_MODEL=openai/gpt-4.1-mini
OPENROUTER_SITE_URL=https://your-frontend.vercel.app
OPENROUTER_SITE_NAME=UNIBEN Compass AI
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_secret
PYTHON_VERSION=3.11.11
```

After deployment, test:

```text
https://your-render-service.onrender.com/health
```

### Deploy the frontend to Vercel

Import the same GitHub repository into Vercel and configure:

```text
Framework Preset: Next.js
Root Directory: frontend
```

Add:

```env
NEXT_PUBLIC_API_URL=https://your-render-service.onrender.com
```

Deploy the project and copy its production URL.

Return to Render and make sure these variables exactly match the Vercel production address:

```env
FRONTEND_ORIGIN=https://your-frontend.vercel.app
OPENROUTER_SITE_URL=https://your-frontend.vercel.app
```

Restart or redeploy the backend after updating them.

## Production Security

Before making the application publicly available:

- Keep all API keys in platform environment variables.
- Never expose the Supabase service-role key in frontend code.
- Protect or disable `/api/knowledge/ingest` in production.
- Add authentication for administrative operations.
- Add rate limiting to `/api/chat`.
- Add request-size and usage limits.
- Use a generic public error message instead of exposing exception details.
- Validate knowledge documents before ingestion.
- Verify official dates, fees, requirements, contacts, and policies.
- Add a similarity threshold to reduce unrelated retrieval results.
- Monitor OpenAI, OpenRouter, Supabase, Render, and Vercel usage.

## Troubleshooting

### The chatbot displays a generic error

Check the Git Bash window running Uvicorn and the browser Network panel. Common causes include:

- Missing or invalid API keys
- Insufficient OpenAI or OpenRouter credit
- Incorrect Supabase credentials
- Missing Supabase vector function
- A model name that is unavailable to the configured provider
- An incorrect frontend/backend URL
- A CORS origin mismatch

### The chatbot answers without sources

- Confirm `knowledge_chunks` contains rows.
- Confirm the selected audience matches the stored document audience.
- Confirm the OpenAI embedding key is configured.
- Run a direct `/api/chat` test and inspect the `sources` array.

### The same source appears multiple times

The same Markdown file was probably ingested more than once. Remove duplicate `knowledge_documents` rows in Supabase; associated chunks are deleted automatically through the foreign-key cascade.

### Git Bash cannot find the ingestion script

Run it from the backend directory:

```bash
cd ~/Desktop/FULL-STACK-AI/uniben-compass-ai/backend
source .venv/Scripts/activate
python scripts/ingest_knowledge.py
```

## Planned Improvements

- Duplicate-safe and incremental ingestion
- Authenticated administration dashboard
- Protected knowledge-management endpoints
- User authentication
- Conversation management
- Improved citations and official source links
- Retrieval similarity thresholds
- Hybrid keyword and vector search
- Automated knowledge refresh workflows
- Rate limiting and usage analytics
- Expanded automated testing
- Production monitoring and error reporting

## Responsible Use

UNIBEN Compass AI is an independent information-assistance project. It should not be treated as a replacement for official University of Benin announcements, portals, offices, or authorized representatives.

Users should confirm important information through the official University of Benin website and the appropriate university office, especially information involving:

- Admission eligibility
- Application and screening deadlines
- Fees and payments
- Clearance and registration
- Academic regulations
- Results and transcripts
- Accommodation
- Official contact details

The quality of answers depends on the accuracy and freshness of the ingested knowledge documents.

## Contributing

Contributions that improve accuracy, retrieval quality, accessibility, security, documentation, or test coverage are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make and test the changes.
4. Commit with a descriptive message.
5. Push the branch.
6. Open a pull request.

Do not include credentials, personal student information, copyrighted private documents, or unverified official claims.

## License

No open-source license has been selected yet. Until a license is added, the repository's contents remain subject to the owner's default copyright rights.

## Author

Developed as a full-stack AI and retrieval-augmented generation project for improving access to University of Benin information.
