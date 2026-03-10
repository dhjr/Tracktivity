import requests
import uuid

# generate a unique batch code
unique_id = str(uuid.uuid4())[:8]
batch_code = f"BATCH-{unique_id}"

# Note: this created_by MUST be a valid profile ID in the database.
# In a real app the token gives us the ID, but here we just pass one.
# We will use the python supabase sdk to find any valid user ID first
import os
from supabase import create_client, Client

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    with open(".env") as f:
        for line in f:
            if line.startswith("SUPABASE_URL="):
                url = line.strip().split("=")[1]
            if line.startswith("SUPABASE_SERVICE_ROLE_KEY="):
                key = line.strip().split("=")[1]

supabase: Client = create_client(url, key)

response = supabase.table("profiles").select("id").limit(1).execute()
if response.data:
    valid_id = response.data[0]["id"]
    print(f"Using valid profile ID: {valid_id}")
else:
    print("Error: No profiles found in the database. Create a user first.")
    exit(1)


api_url = "http://localhost:8000/batches/"
payload = {
    "name": f"Computer Science {unique_id}",
    "batch_code": batch_code,
    "created_by": valid_id
}

print(f"Testing batch creation with payload: {payload}")

try:
    api_res = requests.post(api_url, json=payload)
    print(f"Status Code: {api_res.status_code}")
    print(f"Response Body: {api_res.json()}")

    # Test duplicate batch code error handling
    print("\nTesting duplicate batch code error handling...")
    api_res2 = requests.post(api_url, json=payload)
    print(f"Status Code: {api_res2.status_code}")
    print(f"Response Body: {api_res2.json()}")

except Exception as e:
    print(f"Error: {e}")
