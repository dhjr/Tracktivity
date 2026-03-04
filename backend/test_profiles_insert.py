import os
import asyncio
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

supabase: Client = create_client(url, key)

async def test():
    try:
        users = supabase.auth.admin.list_users()
        if not users:
            print("No users found to test profile insert.")
            return
            
        first_user = users[0]
        
        # Test direct insertion
        payload = {
            "id": first_user.id,
            "email": first_user.email,
            "name": first_user.user_metadata.get("name", "Unknown"),
            "role": first_user.user_metadata.get("role", "student")
        }
        print("Inserting:", payload)
        
        try:
            res = supabase.table("profiles").insert(payload).execute()
            print("Direct Insert Success:", res)
        except Exception as insert_err:
            print("Direct Insert Error:", insert_err)

    except Exception as e:
        print("Error:", e)

asyncio.run(test())
