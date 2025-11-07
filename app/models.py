from pydantic import BaseModel, Field, EmailStr, constr, validator
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

# -------------------- ENUMS --------------------

class RegistrationStatus(str, Enum):
    Active = "Active"
    Inactive = "Inactive"
    Maintenance = "Maintenance"
    Suspended = "Suspended"

class AlertType(str, Enum):
    SpeedViolation = "SpeedViolation"
    LowFuel = "LowFuel"
    Maintenance = "Maintenance"
    Engine = "Engine"
    Geofence = "Geofence"

class Severity(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class EngineStatus(str, Enum):
    running = "running"
    stopped = "stopped"
    idle = "idle"

class ServiceType(str, Enum):
    Oil_Change = "Oil Change"
    repair = "repair"
    inspection = "inspection"
    tire_rotation = "tire_rotation"

# -------------------- CORE MODELS --------------------

class Vehicle(BaseModel):
    id: Optional[str] = Field(None, description="Vehicle ID (can be null)")
    vin: str = Field(..., description="Vehicle Identification Number")
    manufacturer: str = Field(..., description="Vehicle manufacturer")
    model: str = Field(..., description="Vehicle model")
    fleet_id: Optional[str] = Field(None, description="Fleet identifier")
    owner_id: Optional[str] = Field(None, description="Owner identifier")
    registration_status: RegistrationStatus = Field(RegistrationStatus.Active, description="Registration status")

    class Config:
        allow_population_by_field_name = True
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}
        schema_extra = {
            "example": {
                "id": "102",
                "vin": "1009",
                "manufacturer": "hyundai",
                "model": "baleno",
                "fleet_id": "102",
                "owner_id": "sahana",
                "registration_status": "Active"
            }
        }

class TelemetryReading(BaseModel):
    vin: str = Field(..., description="Vehicle Identification Number")
    timestamp: datetime = Field(..., description="Timestamp of the reading")
    latitude: float = Field(..., description="Latitude coordinate")
    longitude: float = Field(..., description="Longitude coordinate")
    speed: float = Field(..., description="Speed in km/h")
    engine_status: EngineStatus = Field(..., description="Engine status")
    fuel_level: float = Field(..., description="Fuel level percentage")
    odometer: float = Field(..., description="Odometer reading in km")
    diagnostic_codes: List[str] = Field(default=[], description="Diagnostic trouble codes")

    class Config:
        allow_population_by_field_name = True
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}
        schema_extra = {
            "example": {
                "vin": "1008",
                "timestamp": "2025-09-03T10:59:00.000+00:00",
                "latitude": 37.7749,
                "longitude": -122.4194,
                "speed": 500,
                "engine_status": "stopped",
                "fuel_level": 100,
                "odometer": 600,
                "diagnostic_codes": []
            }
        }

class Alert(BaseModel):
    vin: str = Field(..., description="Vehicle Identification Number")
    timestamp: datetime = Field(..., description="Timestamp of the alert")
    alert_type: AlertType = Field(..., description="Type of alert")
    message: str = Field(..., description="Alert message")
    severity: Severity = Field(..., description="Alert severity level")

    class Config:
        allow_population_by_field_name = True
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}
        schema_extra = {
            "example": {
                "vin": "1008",
                "timestamp": "2025-09-03T10:59:00.000+00:00",
                "alert_type": "SpeedViolation",
                "message": "Speed violation: 500.0 km/h > 100",
                "severity": "HIGH"
            }
        }

class Driver(BaseModel):
    driver_id: str = Field(..., description="Unique driver identifier")
    name: str = Field(..., description="Driver's full name")
    license_number: str = Field(..., description="Driver's license number")
    phone: str = Field(..., description="Driver's phone number")
    email: EmailStr = Field(..., description="Driver's email address")
    assigned_vehicle: str = Field(..., description="VIN of the vehicle currently assigned")

    class Config:
        allow_population_by_field_name = True
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}
        schema_extra = {
            "example": {
                "driver_id": "drv1001",
                "name": "jogn doe",
                "license_number": "dl12345",
                "phone": "7673686832",
                "email": "john@example.com",
                "assigned_vehicle": "1008"
            }
        }

class Trip(BaseModel):
    trip_id: str = Field(..., description="Unique trip identifier")
    vin: str = Field(..., description="Vehicle Identification Number")
    driver_id: Optional[str] = Field(None, description="Driver identifier")
    start_time: datetime = Field(..., description="Trip start time")
    end_time: datetime = Field(..., description="Trip end time")
    start_location: str = Field(..., description="Starting location")
    end_location: str = Field(..., description="Ending location")
    distance: float = Field(..., description="Trip distance in km")
    metadata: Optional[Dict[str, Any]] = Field(default={}, description="Additional trip metadata")

    class Config:
        allow_population_by_field_name = True
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}
        schema_extra = {
            "example": {
                "trip_id": "tp1",
                "vin": "1009",
                "driver_id": "1011",
                "start_time": "2025-09-03T11:48:00.000+00:00",
                "end_time": "2025-09-04T17:19:00.000+00:00",
                "start_location": "vit",
                "end_location": "guindy",
                "distance": 500,
                "metadata": {}
            }
        }

class Fleet(BaseModel):
    fleet_id: str = Field(..., description="Unique fleet identifier")
    name: str = Field(..., description="Fleet name")
    owner_id: str = Field(..., description="Owner identifier")
    vehicles: List[str] = Field(default=[], description="List of vehicle VINs in this fleet")
    metadata: Optional[Dict[str, Any]] = Field(default={}, description="Additional fleet metadata")

    class Config:
        allow_population_by_field_name = True
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}
        schema_extra = {
            "example": {
                "fleet_id": "100002",
                "name": "east coast",
                "owner_id": "1010",
                "vehicles": ["1008", "1009", "2010"],
                "metadata": {}
            }
        }

class Owner(BaseModel):
    owner_id: str = Field(..., description="Unique owner identifier")
    name: str = Field(..., description="Owner's name")
    email: EmailStr = Field(..., description="Owner's email address")
    phone: str = Field(..., description="Owner's phone number")

    class Config:
        allow_population_by_field_name = True
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}
        schema_extra = {
            "example": {
                "owner_id": "o2",
                "name": "unisys",
                "email": "unisys.b@gmail.com",
                "phone": "9748878443"
            }
        }

class MaintenanceRecord(BaseModel):
    record_id: str = Field(..., description="Unique maintenance record identifier")
    vin: str = Field(..., description="Vehicle Identification Number")
    service_date: datetime = Field(..., description="Date of service")
    service_type: ServiceType = Field(..., description="Type of service performed")
    description: str = Field(..., description="Service description")
    cost: float = Field(..., description="Service cost")
    service_center: Optional[str] = Field(None, description="Service center name")
    metadata: Optional[Dict[str, Any]] = Field(default={}, description="Additional maintenance metadata")

    class Config:
        allow_population_by_field_name = True
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}
        schema_extra = {
            "example": {
                "record_id": "101",
                "vin": "1009",
                "service_date": "2025-09-03T15:42:34.554+00:00",
                "service_type": "repair",
                "description": "for 10days in maintenance",
                "cost": 10,
                "service_center": "chennai",
                "metadata": {}
            }
        }
