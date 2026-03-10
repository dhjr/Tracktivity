from fastapi import FastAPI
from datetime import date
import uuid
import uvicorn
from routes import student
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, batch, faculty

 
app = FastAPI(title="Tractivity")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(batch.router)
app.include_router(faculty.router)
app.include_router(student.app)



@app.get("/")
def read_root():
      return "welcome to Tractivity"



if __name__ =="__main__":
      uvicorn.run("main:app",host="127.0.0.1",port=8000,reload=True)