import os
import asyncio
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv("../frontend/.env.local")
url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
anon_key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

supabase_anon: Client = create_client(url, anon_key)

async def test():
    try:
        user_metadata = {
            "name": "Test Anon User",
            "role": "student",
            "ktuId": "TEST9999"
        }
        res = supabase_anon.auth.sign_up({
            "email": "test_anon@example.com",
            "password": "password123",
            "options": {
                "data": user_metadata
            }
        })
        print("Success:", res)
    except Exception as e:
        print("Error:", e)
        print("Type:", type(e))

asyncio.run(test())
