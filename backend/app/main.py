from fastapi import FastAPI
from datetime import date
import uuid
import uvicorn
from routes import student

 
app = FastAPI(title="Tractivity")

@app.get("/")
def read_root():
      return "welcome to Tractivity"


app.include_router(student.app)

if __name__ =="__main__":
      uvicorn.run("main:app",host="127.0.0.1",port=8000,reload=True)





