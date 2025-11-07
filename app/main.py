from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import RedirectResponse
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from uuid import uuid4

from app.models import (
    Vehicle, TelemetryReading, Alert, AlertType, Severity,
    Driver, Trip, Fleet, Owner, MaintenanceRecord
)
from app.database import (
    vehicle_collection, telemetry_collection, alert_collection,
    driver_collection, trip_collection, fleet_collection,
    owner_collection, maintenance_collection, init_db
)

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Connected Car Fleet Management")

# CORS configuration
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://127.0.0.1",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- Startup ----------------
@app.on_event("startup")
async def startup_event():
    await init_db()

@app.get("/", include_in_schema=False)
async def root():
    return RedirectResponse(url="/docs")

# ---------------- Vehicle CRUD ----------------
@app.post("/vehicles", response_model=Vehicle)
async def create_vehicle(vehicle: Vehicle):
    # Check if vehicle with same VIN already exists
    exists = await vehicle_collection.find_one({"vin": vehicle.vin})
    if exists:
        raise HTTPException(400, "Vehicle with this VIN already exists")
    
    # Convert to dict and remove None values
    vehicle_dict = vehicle.dict(exclude_none=True)
    await vehicle_collection.insert_one(vehicle_dict)
    return vehicle

@app.get("/vehicles", response_model=List[Vehicle])
async def list_vehicles():
    vehicles = await vehicle_collection.find().to_list(100)
    return vehicles

@app.get("/vehicles/{vin}", response_model=Vehicle)
async def get_vehicle(vin: str):
    vehicle = await vehicle_collection.find_one({"vin": vin})
    if not vehicle:
        raise HTTPException(404, "Vehicle not found")
    return vehicle

@app.put("/vehicles/{vin}", response_model=Vehicle)
async def update_vehicle(vin: str, vehicle: Vehicle):
    result = await vehicle_collection.find_one_and_update(
        {"vin": vin}, 
        {"$set": vehicle.dict(exclude_none=True)}, 
        return_document=True
    )
    if not result:
        raise HTTPException(404, "Vehicle not found")
    return result

@app.delete("/vehicles/{vin}", status_code=204)
async def delete_vehicle(vin: str):
    result = await vehicle_collection.delete_one({"vin": vin})
    if result.deleted_count == 0:
        raise HTTPException(404, "Vehicle not found")

# ---------------- Telemetry ----------------
@app.post("/vehicles/{vin}/telemetry", response_model=TelemetryReading)
async def ingest_telemetry(vin: str, reading: TelemetryReading):
    # Check if vehicle exists
    vehicle = await vehicle_collection.find_one({"vin": vin})
    if not vehicle:
        raise HTTPException(404, "Vehicle not found")
    
    # Set the VIN and insert telemetry
    reading.vin = vin
    telemetry_dict = reading.dict(exclude_none=True)
    await telemetry_collection.insert_one(telemetry_dict)

    # Generate alerts based on telemetry
    if reading.speed > 100:
        alert = Alert(
            vin=vin,
            timestamp=reading.timestamp,
            alert_type=AlertType.SpeedViolation,
            message=f"Speed violation: {reading.speed} km/h > 100",
            severity=Severity.HIGH
        )
        await alert_collection.insert_one(alert.dict(exclude_none=True))
    
    if reading.fuel_level < 20:
        alert = Alert(
            vin=vin,
            timestamp=reading.timestamp,
            alert_type=AlertType.LowFuel,
            message=f"Low fuel level: {reading.fuel_level}%",
            severity=Severity.MEDIUM
        )
        await alert_collection.insert_one(alert.dict(exclude_none=True))

    return reading

@app.get("/vehicles/{vin}/telemetry", response_model=List[TelemetryReading])
async def get_vehicle_telemetry(
    vin: str, 
    limit: int = Query(50, ge=1, le=100)
):
    telemetry = await telemetry_collection.find(
        {"vin": vin}
    ).sort("timestamp", -1).limit(limit).to_list(limit)
    return telemetry

@app.get("/telemetry", response_model=List[TelemetryReading])
async def list_telemetry(limit: int = Query(50, ge=1, le=100)):
    telemetry = await telemetry_collection.find().sort("timestamp", -1).limit(limit).to_list(limit)
    return telemetry

# ---------------- Alerts ----------------
@app.get("/alerts", response_model=List[Alert])
async def list_alerts(limit: int = Query(50, ge=1, le=100)):
    alerts = await alert_collection.find().sort("timestamp", -1).limit(limit).to_list(limit)
    return alerts

@app.get("/alerts/{alert_id}", response_model=Alert)
async def get_alert(alert_id: str):
    alert = await alert_collection.find_one({"_id": alert_id})
    if not alert:
        raise HTTPException(404, "Alert not found")
    return alert

@app.delete("/alerts/{alert_id}", status_code=204)
async def delete_alert(alert_id: str):
    result = await alert_collection.delete_one({"_id": alert_id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Alert not found")

# ---------------- Drivers ----------------
@app.post("/drivers", response_model=Driver)
async def create_driver(driver: Driver):
    # Check if driver with same ID already exists
    exists = await driver_collection.find_one({"driver_id": driver.driver_id})
    if exists:
        raise HTTPException(400, "Driver with this ID already exists")
    
    driver_dict = driver.dict(exclude_none=True)
    await driver_collection.insert_one(driver_dict)
    return driver

@app.get("/drivers", response_model=List[Driver])
async def list_drivers():
    drivers = await driver_collection.find().to_list(100)
    return drivers

@app.get("/drivers/{driver_id}", response_model=Driver)
async def get_driver(driver_id: str):
    driver = await driver_collection.find_one({"driver_id": driver_id})
    if not driver:
        raise HTTPException(404, "Driver not found")
    return driver

@app.put("/drivers/{driver_id}", response_model=Driver)
async def update_driver(driver_id: str, driver: Driver):
    result = await driver_collection.find_one_and_update(
        {"driver_id": driver_id}, 
        {"$set": driver.dict(exclude_none=True)}, 
        return_document=True
    )
    if not result:
        raise HTTPException(404, "Driver not found")
    return result

@app.delete("/drivers/{driver_id}", status_code=204)
async def delete_driver(driver_id: str):
    result = await driver_collection.delete_one({"driver_id": driver_id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Driver not found")

# ---------------- Trips ----------------
@app.post("/trips", response_model=Trip)
async def create_trip(trip: Trip):
    # Check if trip with same ID already exists
    exists = await trip_collection.find_one({"trip_id": trip.trip_id})
    if exists:
        raise HTTPException(400, "Trip with this ID already exists")
    
    trip_dict = trip.dict(exclude_none=True)
    await trip_collection.insert_one(trip_dict)
    return trip

@app.get("/trips", response_model=List[Trip])
async def list_trips():
    trips = await trip_collection.find().to_list(100)
    return trips

@app.get("/trips/{trip_id}", response_model=Trip)
async def get_trip(trip_id: str):
    trip = await trip_collection.find_one({"trip_id": trip_id})
    if not trip:
        raise HTTPException(404, "Trip not found")
    return trip

@app.put("/trips/{trip_id}", response_model=Trip)
async def update_trip(trip_id: str, trip: Trip):
    result = await trip_collection.find_one_and_update(
        {"trip_id": trip_id}, 
        {"$set": trip.dict(exclude_none=True)}, 
        return_document=True
    )
    if not result:
        raise HTTPException(404, "Trip not found")
    return result

@app.delete("/trips/{trip_id}", status_code=204)
async def delete_trip(trip_id: str):
    result = await trip_collection.delete_one({"trip_id": trip_id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Trip not found")

# ---------------- Fleets ----------------
@app.post("/fleets", response_model=Fleet)
async def create_fleet(fleet: Fleet):
    # Check if fleet with same ID already exists
    exists = await fleet_collection.find_one({"fleet_id": fleet.fleet_id})
    if exists:
        raise HTTPException(400, "Fleet with this ID already exists")
    
    fleet_dict = fleet.dict(exclude_none=True)
    await fleet_collection.insert_one(fleet_dict)
    return fleet

@app.get("/fleets", response_model=List[Fleet])
async def list_fleets():
    fleets = await fleet_collection.find().to_list(100)
    return fleets

@app.get("/fleets/{fleet_id}", response_model=Fleet)
async def get_fleet(fleet_id: str):
    fleet = await fleet_collection.find_one({"fleet_id": fleet_id})
    if not fleet:
        raise HTTPException(404, "Fleet not found")
    return fleet

@app.put("/fleets/{fleet_id}", response_model=Fleet)
async def update_fleet(fleet_id: str, fleet: Fleet):
    result = await fleet_collection.find_one_and_update(
        {"fleet_id": fleet_id}, 
        {"$set": fleet.dict(exclude_none=True)}, 
        return_document=True
    )
    if not result:
        raise HTTPException(404, "Fleet not found")
    return result

@app.delete("/fleets/{fleet_id}", status_code=204)
async def delete_fleet(fleet_id: str):
    result = await fleet_collection.delete_one({"fleet_id": fleet_id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Fleet not found")

# ---------------- Owners ----------------
@app.post("/owners", response_model=Owner)
async def create_owner(owner: Owner):
    # Check if owner with same ID already exists
    exists = await owner_collection.find_one({"owner_id": owner.owner_id})
    if exists:
        raise HTTPException(400, "Owner with this ID already exists")
    
    owner_dict = owner.dict(exclude_none=True)
    await owner_collection.insert_one(owner_dict)
    return owner

@app.get("/owners", response_model=List[Owner])
async def list_owners():
    owners = await owner_collection.find().to_list(100)
    return owners

@app.get("/owners/{owner_id}", response_model=Owner)
async def get_owner(owner_id: str):
    owner = await owner_collection.find_one({"owner_id": owner_id})
    if not owner:
        raise HTTPException(404, "Owner not found")
    return owner

@app.put("/owners/{owner_id}", response_model=Owner)
async def update_owner(owner_id: str, owner: Owner):
    result = await owner_collection.find_one_and_update(
        {"owner_id": owner_id}, 
        {"$set": owner.dict(exclude_none=True)}, 
        return_document=True
    )
    if not result:
        raise HTTPException(404, "Owner not found")
    return result

@app.delete("/owners/{owner_id}", status_code=204)
async def delete_owner(owner_id: str):
    result = await owner_collection.delete_one({"owner_id": owner_id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Owner not found")

# ---------------- Maintenance ----------------
@app.post("/maintenance", response_model=MaintenanceRecord)
async def create_maintenance(maintenance: MaintenanceRecord):
    # Check if maintenance record with same ID already exists
    exists = await maintenance_collection.find_one({"record_id": maintenance.record_id})
    if exists:
        raise HTTPException(400, "Maintenance record with this ID already exists")
    
    maintenance_dict = maintenance.dict(exclude_none=True)
    await maintenance_collection.insert_one(maintenance_dict)
    return maintenance

@app.get("/maintenance", response_model=List[MaintenanceRecord])
async def list_maintenance():
    maintenance = await maintenance_collection.find().to_list(100)
    return maintenance

@app.get("/maintenance/{record_id}", response_model=MaintenanceRecord)
async def get_maintenance(record_id: str):
    maintenance = await maintenance_collection.find_one({"record_id": record_id})
    if not maintenance:
        raise HTTPException(404, "Maintenance record not found")
    return maintenance

@app.put("/maintenance/{record_id}", response_model=MaintenanceRecord)
async def update_maintenance(record_id: str, maintenance: MaintenanceRecord):
    result = await maintenance_collection.find_one_and_update(
        {"record_id": record_id}, 
        {"$set": maintenance.dict(exclude_none=True)}, 
        return_document=True
    )
    if not result:
        raise HTTPException(404, "Maintenance record not found")
    return result

@app.delete("/maintenance/{record_id}", status_code=204)
async def delete_maintenance(record_id: str):
    result = await maintenance_collection.delete_one({"record_id": record_id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Maintenance record not found")

# ---------------- Analytics & Dashboard ----------------
@app.get("/dashboard/stats")
async def get_dashboard_stats():
    """Get dashboard statistics"""
    try:
        # Get counts
        total_vehicles = await vehicle_collection.count_documents({})
        total_drivers = await driver_collection.count_documents({})
        total_fleets = await fleet_collection.count_documents({})
        total_owners = await owner_collection.count_documents({})
        total_trips = await trip_collection.count_documents({})
        total_maintenance = await maintenance_collection.count_documents({})
        total_alerts = await alert_collection.count_documents({})
        
        # Get active vehicles (with Active status)
        active_vehicles = await vehicle_collection.count_documents({"registration_status": "Active"})
        
        # Get recent alerts (last 24 hours)
        yesterday = datetime.utcnow() - timedelta(days=1)
        recent_alerts = await alert_collection.count_documents({"timestamp": {"$gte": yesterday}})
        
        # Calculate average fuel level from recent telemetry
        recent_telemetry = await telemetry_collection.find(
            {"timestamp": {"$gte": yesterday}}
        ).to_list(100)
        
        avg_fuel = 0
        if recent_telemetry:
            total_fuel = sum(t.get("fuel_level", 0) for t in recent_telemetry)
            avg_fuel = round(total_fuel / len(recent_telemetry), 1)
        
        return {
            "totalVehicles": total_vehicles,
            "totalDrivers": total_drivers,
            "totalFleets": total_fleets,
            "totalOwners": total_owners,
            "totalTrips": total_trips,
            "totalMaintenance": total_maintenance,
            "recentAlerts": recent_alerts,
            "activeVehicles": active_vehicles,
            "avgFuel": avg_fuel
        }
    except Exception as e:
        raise HTTPException(500, f"Failed to get dashboard stats: {str(e)}")

# ---------------- Health Check ----------------
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}
