# Setup Guide: NLP Contract Extractor

Welcome! This guide will take you from zero to a fully running full-stack application on your local machine using Docker. You do not need to install Python or Node.js locally.

## Prerequisites
Before you begin, ensure you have the following installed on your machine:
* **Docker:** [Install Docker Desktop](https://www.docker.com/products/docker-desktop/) (Version 24.0 or higher recommended).
* **Git:** To clone this repository.

## API Key Setup
This application requires a Gemini API key to run the NLP extraction pipeline. 
1. In the root directory of this project, you will see a file named `.env.example`.
2. Duplicate this file and rename the copy to `.env` using your terminal:
   `cp .env.example .env`
3. Open the `.env` file and replace the placeholder with your actual Gemini API key:
   `GEMINI_API_KEY=your_real_key_here`

*(Note: The `.env` file is ignored by Git to keep your credentials secure.)*

## Running the Application
To bring up the entire stack (Backend and Frontend), open your terminal in the root folder of this project and run:

`docker-compose up --build`

Once the terminal shows that both services are running, open your web browser and go to:
* **Frontend UI:** http://localhost:5173
* **Backend API:** http://localhost:8000

## Stopping the Application
To shut down the application cleanly, press `CTRL + C` in the terminal where it is running. 
To fully remove the containers, run this command in a new terminal window at the project root:

`docker-compose down`

## Troubleshooting
* **Error: Port already in use:** Another app is using port 5173 or 8000. Find and kill that process, or restart your machine.
* **Error: GEMINI_API_KEY missing:** Ensure you have correctly named your `.env` file (not `.env.txt`) and placed it in the root directory.
* **Container Exits immediately:** Run `docker-compose logs server` or `docker-compose logs client` to see the exact error message.