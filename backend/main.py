from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from pydantic import BaseModel
import random

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for the demo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Task(BaseModel):
    id: int
    title: str
    status: str
    priority: str
    due_date: str

# Mock Data
STATUSES = ["todo", "in_progress", "done"]
PRIORITIES = ["low", "medium", "high"]

tasks_db: List[Task] = []

def generate_mock_data():
    for i in range(1, 51):
        tasks_db.append(Task(
            id=i,
            title=f"Task {i} - {random.choice(['Fix bug', 'Implement feature', 'Write docs', 'Refactor'])}",
            status=random.choice(STATUSES),
            priority=random.choice(PRIORITIES),
            due_date=f"2023-10-{random.randint(10, 30)}"
        ))

generate_mock_data()

@app.get("/tasks", response_model=List[Task])
def get_tasks(
    status: Optional[str] = Query(None, description="Filter by status (todo, in_progress, done)"),
    priority: Optional[str] = Query(None, description="Filter by priority (low, medium, high)")
):
    filtered_tasks = tasks_db
    if status:
        filtered_tasks = [t for t in filtered_tasks if t.status == status]
    if priority:
        filtered_tasks = [t for t in filtered_tasks if t.priority == priority]

    return filtered_tasks
