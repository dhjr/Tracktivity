import asyncio
from app.db.supabase_client import supabase

async def test():
    try:
        user_metadata = {
            "name": "Admin Create User",
            "role": "student",
            "ktuId": "TEST12344"
        }
        res = supabase.auth.admin.create_user({
            "email": "test_admin@example.com",
            "password": "password123",
            "user_metadata": user_metadata,
            "email_confirm": True
        })
        print("Success:", res)
    except Exception as e:
        print("Error:", e)
        print("Type:", type(e))

asyncio.run(test())
