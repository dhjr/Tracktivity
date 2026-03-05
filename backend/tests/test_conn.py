import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in .env file.")
    exit(1)

print(f"Attempting to connect to: {url}")

try:
    supabase: Client = create_client(url, key)
    print("Supabase client initialized.")
    
    # We'll try to get the server version or similar via a simple query
    # If we get any response (even a 404/PGRST error), it means we successfully hit the API
    print("Sending heartbeat query...")
    try:
        # Trying to select from a non-existent table is a reliable way to check authentication 
        # without assuming any specific schema existence.
        response = supabase.table("_health_check_").select("*").limit(1).execute()
        print("Successfully connected to Supabase.")
    except Exception as query_error:
        # PGRST205 means table not found, but it confirms the request was authenticated and processed.
        if "PGRST205" in str(query_error) or "404" in str(query_error):
            print("Connection verified: Successfully reached Supabase API (Authenticated).")
        else:
            print(f"Potential connection issue: {query_error}")
        
except Exception as e:
    print(f"Failed to connect: {e}")
