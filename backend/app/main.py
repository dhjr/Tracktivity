from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth
from datetime import date
import uuid
import uvicorn
from app.routes import student

 
app = FastAPI(title="Tractivity")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)

@app.get("/")
def read_root():
      return "welcome to Tractivity"



app.include_router(student.app)

if __name__ =="__main__":
      uvicorn.run("main:app",host="127.0.0.1",port=8000,reload=True)





