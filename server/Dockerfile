# server/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend code
COPY . .

# Expose the port your backend runs on (usually 8000 for FastAPI or 5000 for Flask/App)
EXPOSE 8000 

# Run the main file (Adjust if you use uvicorn, e.g., CMD ["uvicorn", "main:app", "--host", "0.0.0.0"])
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]