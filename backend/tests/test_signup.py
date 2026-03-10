import requests
import uuid

# generate a unique email and ktu id
unique_id = str(uuid.uuid4())[:8]
email = f"test_{unique_id}@example.com"
ktu_id = f"KTE23CS{unique_id[:3]}"

url = "http://localhost:8000/auth/signup"
payload = {
    "email": email,
    "password": "password123",
    "name": "Test User",
    "role": "student",
    "department": "Computer Science",
    "studentCategory": "Lateral Entry",
    "ktuId": ktu_id
}

print(f"Testing signup with payload: {payload}")

try:
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.json()}")
except Exception as e:
    print(f"Error: {e}")
