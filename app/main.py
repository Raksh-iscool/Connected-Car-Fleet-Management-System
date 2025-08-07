from fastapi import FastAPI, HTTPException, Query
from typing import List, Dict, Optional
from uuid import uuid4
from datetime import datetime, timedelta

from fastapi.responses import RedirectResponse

from app.models import Vehicle, TelemetryReading, Alert, AlertType
from app.storage import vehicles, telemetry_log, alerts

app = FastAPI(title="Connected Car Fleet Management")

# --- Configuration ---
GLOBAL_SPEED_LIMIT = 100.0  # km/h
LOW_FUEL_THRESHOLD = 15.0   # %

def normalize_datetime(dt: datetime) -> datetime:
    """Normalize datetime to UTC timezone for consistent comparison"""
    from datetime import timezone
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)

# --- Vehicle CRUD ---
@app.get("/", include_in_schema=False)
async def root():
    return RedirectResponse(url="/docs")

@app.post("/vehicles", response_model=Vehicle)
def create_vehicle(vehicle: Vehicle):
    if vehicle.vin in vehicles:
        raise HTTPException(400, "Vehicle already exists")
    vehicles[vehicle.vin] = vehicle
    telemetry_log[vehicle.vin] = []
    return vehicle

@app.get("/vehicles", response_model=List[Vehicle])
def list_vehicles():
    return list(vehicles.values())

@app.get("/vehicles/{vin}", response_model=Vehicle)
def get_vehicle(vin: str):
    if vin not in vehicles:
        raise HTTPException(404, "Vehicle not found")
    return vehicles[vin]

@app.delete("/vehicles/{vin}", status_code=204)
def delete_vehicle(vin: str):
    if vin not in vehicles:
        raise HTTPException(404, "Vehicle not found")
    del vehicles[vin]
    telemetry_log.pop(vin, None)


# --- Telemetry Ingestion & Retrieval ---
def _generate_alerts(reading: TelemetryReading):
    # Speed violation
    if reading.speed > GLOBAL_SPEED_LIMIT:
        alert = Alert(
            id=str(uuid4()),
            vin=reading.vin,
            timestamp=reading.timestamp,
            alert_type=AlertType.SpeedViolation,
            message=f"Speed violation: {reading.speed} km/h > {GLOBAL_SPEED_LIMIT}",
            severity="HIGH",
        )
        alerts[alert.id] = alert

    # Low fuel/battery
    if reading.fuel_level < LOW_FUEL_THRESHOLD:
        alert = Alert(
            id=str(uuid4()),
            vin=reading.vin,
            timestamp=reading.timestamp,
            alert_type=AlertType.LowFuel,
            message=f"Low fuel/battery: {reading.fuel_level}%",
            severity="CRITICAL",
        )
        alerts[alert.id] = alert


@app.post("/vehicles/{vin}/telemetry", response_model=TelemetryReading)
def ingest_telemetry(vin: str, reading: TelemetryReading):
    if vin not in vehicles:
        raise HTTPException(404, "Vehicle not found")
    # Override any mismatched VIN
    reading.vin = vin
    # Normalize timestamp to UTC
    reading.timestamp = normalize_datetime(reading.timestamp)
    telemetry_log[vin].append(reading)
    _generate_alerts(reading)
    return reading

@app.post("/telemetry/batch", response_model=List[TelemetryReading])
def ingest_batch(readings: List[TelemetryReading]):
    stored = []
    for r in readings:
        if r.vin not in vehicles:
            continue
        # Normalize timestamp to UTC
        r.timestamp = normalize_datetime(r.timestamp)
        telemetry_log[r.vin].append(r)
        _generate_alerts(r)
        stored.append(r)
    return stored

@app.get("/vehicles/{vin}/telemetry/latest", response_model=TelemetryReading)
def get_latest_telemetry(vin: str):
    if vin not in telemetry_log or not telemetry_log[vin]:
        raise HTTPException(404, "No telemetry found for this vehicle")
    return max(telemetry_log[vin], key=lambda t: t.timestamp)

@app.get("/vehicles/{vin}/telemetry/history", response_model=List[TelemetryReading])
def get_telemetry_history(
    vin: str,
    start_time: Optional[datetime] = Query(None),
    end_time: Optional[datetime] = Query(None),
):
    if vin not in telemetry_log:
        raise HTTPException(404, "Vehicle not found")
    records = telemetry_log[vin]
    if start_time:
        records = [r for r in records if r.timestamp >= start_time]
    if end_time:
        records = [r for r in records if r.timestamp <= end_time]
    return records

@app.get("/telemetry", response_model=Dict[str, List[TelemetryReading]])
def get_multi_telemetry(
    vins: Optional[str] = Query(None, description="Comma-separated VINs"),
    start_time: Optional[datetime] = Query(None),
    end_time: Optional[datetime] = Query(None),
):
    vin_list = vins.split(",") if vins else list(telemetry_log.keys())
    result: Dict[str, List[TelemetryReading]] = {}
    for vin in vin_list:
        recs = telemetry_log.get(vin, [])
        if start_time:
            recs = [r for r in recs if r.timestamp >= start_time]
        if end_time:
            recs = [r for r in recs if r.timestamp <= end_time]
        result[vin] = recs
    return result


# --- Alert Endpoints ---
@app.get("/alerts", response_model=List[Alert])
def list_alerts():
    return list(alerts.values())

@app.get("/alerts/{alert_id}", response_model=Alert)
def get_alert(alert_id: str):
    if alert_id not in alerts:
        raise HTTPException(404, "Alert not found")
    return alerts[alert_id]


# --- Fleet Analytics ---
@app.get("/fleets/{fleet_id}/analytics")
def fleet_analytics(fleet_id: str):
    try:
        print(f"DEBUG: Processing fleet analytics for fleet_id: {fleet_id}")
        print(f"DEBUG: Total vehicles in system: {len(vehicles)}")
        
        # Filter vehicles in this fleet
        fleet_vins = [v.vin for v in vehicles.values() if v.fleet_id == fleet_id]
        print(f"DEBUG: Found {len(fleet_vins)} vehicles in fleet {fleet_id}")
        print(f"DEBUG: Fleet VINs: {fleet_vins}")
        
        if not fleet_vins:
            raise HTTPException(404, "Fleet not found")

        now = datetime.now()
        active, inactive = 0, 0
        fuel_levels = []
        distance = 0.0
        alert_summary: Dict[str, Dict[str, int]] = {}

        # Alerts in last 24h - ensure timezone consistency
        now = normalize_datetime(now)
        cut = now - timedelta(hours=24)
        for alert in alerts.values():
            if alert.vin in fleet_vins and normalize_datetime(alert.timestamp) >= cut:
                alert_summary.setdefault(alert.alert_type.value, {})
                alert_summary[alert.alert_type.value][alert.severity] = (
                    alert_summary[alert.alert_type.value].get(alert.severity, 0) + 1
                )

        for vin in fleet_vins:
            recs = telemetry_log.get(vin, [])
            if not recs:
                inactive += 1
                continue

            # Get the latest telemetry record
            try:
                last = max(recs, key=lambda r: r.timestamp)
                if normalize_datetime(last.timestamp) >= cut:
                    active += 1
                else:
                    inactive += 1

                # collect fuel/battery (always add the latest fuel level)
                fuel_levels.append(last.fuel_level)
            except ValueError as e:
                print(f"Error processing vehicle {vin}: {e}")
                inactive += 1
                continue

            # distance in last 24h
            recent = [r for r in recs if normalize_datetime(r.timestamp) >= cut]
            if len(recent) >= 2:
                odos = [r.odometer for r in recent]
                distance += max(odos) - min(odos)

        avg_fuel = round(sum(fuel_levels) / len(fuel_levels), 2) if fuel_levels else 0.0

        return {
            "fleet_id": fleet_id,
            "active_vehicles": active,
            "inactive_vehicles": inactive,
            "average_fuel_level": avg_fuel,
            "distance_last_24h": round(distance, 2),
            "alert_summary": alert_summary,
        }
    except Exception as e:
        # Log the error for debugging
        print(f"Error in fleet_analytics for fleet {fleet_id}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(500, f"Internal server error: {str(e)}")