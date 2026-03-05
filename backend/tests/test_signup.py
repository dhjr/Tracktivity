import asyncio
from app.db.supabase_client import supabase

async def test():
    try:
        user_metadata = {
            "name": "Test User",
            "role": "student",
            "ktuId": "TEST1234"
        }
        res = supabase.auth.sign_up({
            "email": "test_db_err@example.com",
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
