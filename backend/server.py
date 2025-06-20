from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import aiohttp
import os
from dotenv import load_dotenv
from models import NEO

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

NASA_API_KEY = os.getenv("NASA_API_KEY")
NASA_BASE_URL = "https://api.nasa.gov"

@app.get("/api/dashboard/summary")
async def dashboard_summary():
    async with aiohttp.ClientSession() as session:
        neo_url = f"{NASA_BASE_URL}/neo/rest/v1/feed?api_key={NASA_API_KEY}"
        mars_url = f"{NASA_BASE_URL}/mars-photos/api/v1/rovers/perseverance/latest_photos?api_key={NASA_API_KEY}"
        apod_url = f"{NASA_BASE_URL}/planetary/apod?api_key={NASA_API_KEY}"

        async with session.get(neo_url) as neo_resp, session.get(mars_url) as mars_resp, session.get(apod_url) as apod_resp:
            neo_data = await neo_resp.json()
            mars_data = await mars_resp.json()
            apod_data = await apod_resp.json()

            return {
                "neo_count": neo_data.get("element_count", 0),
                "alerts_count": len(neo_data.get("near_earth_objects", [])),
                "mars_photos_count": len(mars_data.get("latest_photos", [])),
                "apod_title": apod_data.get("title", "N/A")
            }

@app.get("/api/neo/feed")
async def neo_feed():
    try:
        async with aiohttp.ClientSession() as session:
            url = f"{NASA_BASE_URL}/neo/rest/v1/feed?api_key={NASA_API_KEY}"
            async with session.get(url) as response:
                data = await response.json()
                objects = []
                for date_objs in data.get("near_earth_objects", {}).values():
                    for obj in date_objs:
                        neo = NEO.from_api(obj)
                        objects.append(neo.dict())
                return {"near_earth_objects": objects, "alerts": objects[:3]}
    except Exception as e:
        print("Error fetching NEO feed:", e)
        return {"near_earth_objects": [], "alerts": []}

@app.get("/api/neo/stats")
async def neo_stats():
    async with aiohttp.ClientSession() as session:
        url = f"{NASA_BASE_URL}/neo/rest/v1/stats?api_key={NASA_API_KEY}"
        async with session.get(url) as response:
            return await response.json()

@app.get("/api/mars/rovers")
async def mars_rovers():
    async with aiohttp.ClientSession() as session:
        url = f"{NASA_BASE_URL}/mars-photos/api/v1/rovers?api_key={NASA_API_KEY}"
        async with session.get(url) as response:
            return await response.json()

@app.get("/api/mars/rovers/{rover}/photos")
async def mars_rover_photos(rover: str, sol: int = None, camera: str = None, earth_date: str = None):
    async with aiohttp.ClientSession() as session:
        params = {"api_key": NASA_API_KEY}
        if sol: params["sol"] = sol
        if earth_date: params["earth_date"] = earth_date
        if camera: params["camera"] = camera

        query = "&".join([f"{k}={v}" for k, v in params.items()])
        url = f"{NASA_BASE_URL}/mars-photos/api/v1/rovers/{rover}/photos?{query}"
        async with session.get(url) as response:
            return await response.json()

@app.get("/api/mars/rovers/{rover}/latest_photos")
async def latest_rover_photos(rover: str):
    async with aiohttp.ClientSession() as session:
        url = f"{NASA_BASE_URL}/mars-photos/api/v1/rovers/{rover}/latest_photos?api_key={NASA_API_KEY}"
        async with session.get(url) as response:
            return await response.json()

@app.get("/api/apod")
async def get_apod(date: str = None):
    async with aiohttp.ClientSession() as session:
        params = {"api_key": NASA_API_KEY}
        if date:
            params["date"] = date
        url = f"{NASA_BASE_URL}/planetary/apod"
        async with session.get(url, params=params) as response:
            return await response.json()

@app.get("/api/apod/random")
async def get_random_apod(count: int = 1):
    async with aiohttp.ClientSession() as session:
        url = f"{NASA_BASE_URL}/planetary/apod?api_key={NASA_API_KEY}&count={count}"
        async with session.get(url) as response:
            return await response.json()
