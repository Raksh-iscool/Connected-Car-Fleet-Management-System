# app/database.py
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING
import os

MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://rakshanav2023_db_user:fbzjoQIYwLQtRVXY@cluster0.h6glgd5.mongodb.net/")

client = AsyncIOMotorClient(MONGO_URI)
db = client["fleetdb"]


# Collections
vehicle_collection = db["vehicles"]
telemetry_collection = db["telemetry"]
alert_collection = db["alerts"]
driver_collection = db["drivers"]
trip_collection = db["trips"]
fleet_collection = db["fleets"]
owner_collection = db["owners"]
maintenance_collection = db["maintenance"]

# Indexes (optional, improves query performance)
async def init_db():
    await vehicle_collection.create_index([("vin", ASCENDING)], unique=True)
    await telemetry_collection.create_index([("vin", ASCENDING), ("timestamp", ASCENDING)])
    await alert_collection.create_index([("vin", ASCENDING), ("timestamp", ASCENDING)])
    await driver_collection.create_index([("driver_id", ASCENDING)], unique=True)
    await trip_collection.create_index([("trip_id", ASCENDING)], unique=True)
    await fleet_collection.create_index([("fleet_id", ASCENDING)], unique=True)
    await owner_collection.create_index([("owner_id", ASCENDING)], unique=True)
    await maintenance_collection.create_index([("record_id", ASCENDING)], unique=True)



