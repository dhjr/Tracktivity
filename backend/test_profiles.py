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
            print("No users found.")
            return
            
        first_user = users[0]
        print(f"User ID: {first_user.id}")
        print(f"Metadata: {first_user.user_metadata}")
        
        profiles = supabase.table("profiles").select("*").limit(1).execute()
        print(f"Profiles Schema Data: {profiles.data}")

    except Exception as e:
        print("Error:", e)

asyncio.run(test())
