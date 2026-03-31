
import httpx
import asyncio
import json

async def test_login():
    url = "http://localhost:8000/api/v1/auth/login"
    payload = {
        "email": "admin@HQC System.com",
        "password": "Admin@2025"
    }
    
    print(f"Testing login at {url}...")
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload)
            print(f"Status: {response.status_code}")
            print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_login())

