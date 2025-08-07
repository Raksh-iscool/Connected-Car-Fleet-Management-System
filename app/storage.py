from typing import Dict, List
from app.models import Vehicle, TelemetryReading, Alert

# In-memory stores
vehicles: Dict[str, Vehicle] = {}
telemetry_log: Dict[str, List[TelemetryReading]] = {}
alerts: Dict[str, Alert] = {}