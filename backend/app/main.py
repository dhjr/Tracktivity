from fastapi import FastAPI
 
app = FastAPI(title="Tractivity")

@app.get("/")
def read_root():
      return "welcome to Tractivity"

