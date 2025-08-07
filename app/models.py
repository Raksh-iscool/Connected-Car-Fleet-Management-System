from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum
from typing import List

class RegistrationStatus(str, Enum):
    Active = "Active"
    Maintenance = "Maintenance"
    Decommissioned = "Decommissioned"

class Vehicle(BaseModel):
    vin: str = Field(..., description="Vehicle Identification Number")
    manufacturer: str
    model: str
    fleet_id: str
    owner: str
    registration_status: RegistrationStatus

class TelemetryReading(BaseModel):
    vin: str
    timestamp: datetime
    latitude: float
    longitude: float
    speed: float  # km/h
    engine_status: str
    fuel_level: float  # %
    odometer: float  # km
    diagnostic_codes: List[str] = []

class AlertType(str, Enum):
    SpeedViolation = "SpeedViolation"
    LowFuel = "LowFuel"

class Alert(BaseModel):
    id: str
    vin: str
    timestamp: datetime
    alert_type: AlertType
    message: str
    severity: str