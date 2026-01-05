# AI Task Dashboard Demo

A proof-of-concept application demonstrating a dynamic dashboard where widgets are created via natural language prompts, powered by an in-browser Small Language Model (SLM).

## Features

- **Backend:** FastAPI server providing mock task data with filtering capabilities.
- **Frontend:** React + Vite application with Tailwind CSS.
- **AI Integration:** Runs `FunctionGemma` (or `Qwen` fallback) directly in the browser using `@huggingface/transformers` via WebGPU/WASM.
- **Dynamic Widgets:** User prompts generate JSON configurations to render:
  - Tables
  - Bar Charts
  - Pie Charts

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 18+

### 1. Backend Setup

Navigate to the `backend` directory:

```bash
cd backend
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the server:

```bash
python -m uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.

### 2. Frontend Setup

Open a new terminal and navigate to the `frontend` directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open your browser at `http://localhost:5173`.

## Usage

1. **Wait for Model Load:** On the first load, the browser will download the LLM weights (approx. 300MB - 1GB depending on the model). Check the console for "Model loaded!"
2. **Enter a Prompt:** In the input box, type a request.
   - *Examples:*
     - "Show me a table of high priority tasks"
     - "I want a pie chart of tasks by status"
     - "Bar chart of done tasks"
3. **View Widget:** The system will parse your intent and add the appropriate widget to the dashboard.
