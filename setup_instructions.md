# Setup Instructions – LecturaGenie

## 1. Clone the Repository

Download the project from GitHub.

git clone https://github.com/Sunkara-Harshitha09/LecturaGenie.git

Navigate to the project folder:

cd LecturaGenie

## 2. Install Python Dependencies (Backend)

Install all required Python libraries.

pip install -r Requirements.txt

## 3. Run the Backend Server

Start the backend server using FastAPI.

uvicorn main:app --reload

Backend will run at:

http://127.0.0.1:8000

## 4. Install Frontend Dependencies

Navigate to the frontend project folder.

npm install

## 5. Run the Frontend

Start the React development server.

npm run dev

## 6. Open the Application

Open your browser and go to:

http://localhost:5173

## 7. How to Use the Application

1. Paste a YouTube lecture video URL in the input field.
2. Click the "Analyze" or "Generate Summary" button.
3. The system extracts the transcript of the video.
4. The AI model processes the text and generates a concise summary and key points.

## 8. Technologies Used

Frontend:
React.js, HTML, CSS, JavaScript, Vite

Backend:
Python, FastAPI, Uvicorn

AI/NLP:
BERT / FLAN-T5 using HuggingFace Transformers

Tools:
YouTube Transcript API, GitHub, VS Code
