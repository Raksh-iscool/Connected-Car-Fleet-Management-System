# Connected Car Fleet Management System

## Overview

This is a FastAPI-based backend system for managing connected car fleets with real-time telemetry monitoring, alert generation, and fleet analytics. The system provides RESTful APIs for vehicle management, telemetry ingestion, alert handling, and fleet analytics.

## Progress Analysis

### **Phase 1: Core Implementation - COMPLETED**

#### **What Has Been Implemented:**

1. **Vehicle Management System**
   - Vehicle CRUD operations (Create, Read, Delete)
   - Vehicle registration with VIN, manufacturer, model, fleet_id, owner, and status
   - Support for multiple registration statuses (Active, Maintenance, Decommissioned)

2. **Telemetry Data Management**
   - Real-time telemetry ingestion for individual vehicles
   - Batch telemetry ingestion for multiple vehicles
   - Telemetry history retrieval with time-based filtering
   - Latest telemetry retrieval per vehicle
   - Multi-vehicle telemetry querying

3. **Alert System**
   - Automatic alert generation based on telemetry data
   - Speed violation detection (configurable threshold)
   - Low fuel/battery level alerts
   - Alert severity classification (HIGH, CRITICAL)
   - Alert retrieval and listing

4. **Fleet Analytics**
   - Fleet-level analytics with active/inactive vehicle counts
   - Average fuel level calculations
   - Distance tracking (last 24 hours)
   - Alert summary by type and severity
   - Real-time fleet status monitoring

5. **API Infrastructure**
   - RESTful API design with proper HTTP status codes
   - Input validation using Pydantic models
   - Error handling with descriptive messages
   - API documentation with automatic OpenAPI/Swagger generation

### **What's Left to Implement:**

1. **Database Integration**
   - Persistent storage (currently using in-memory storage)
   - Database migrations and schema management
   - Data persistence across application restarts

2. **Authentication & Authorization**
   - User authentication system
   - Role-based access control
   - API key management for fleet operators

3. **Advanced Features**
   - Real-time WebSocket connections for live updates
   - Geofencing capabilities
   - Predictive maintenance alerts
   - Advanced analytics and reporting

4. **Frontend Interface**
   - Web dashboard for fleet management
   - Real-time vehicle tracking interface
   - Alert management UI
   - Analytics visualization

## **Architecture & Design Decisions**

### **1. Technology Stack Choices**

**Why FastAPI?**
- **Performance**: FastAPI is built on Starlette and Pydantic, offering near-native performance
- **Type Safety**: Built-in Pydantic integration provides automatic request/response validation
- **Documentation**: Automatic OpenAPI/Swagger documentation generation
- **Modern Python**: Uses Python 3.7+ features like type hints and async/await
- **Developer Experience**: Excellent IDE support and clear error messages

**Why Pydantic Models?**
- **Data Validation**: Automatic validation of incoming requests
- **Type Safety**: Ensures data integrity throughout the application
- **Serialization**: Automatic JSON serialization/deserialization
- **Documentation**: Models automatically appear in API documentation

### **2. Storage Architecture**

**Current Implementation: In-Memory Storage**
```python
# Simple dictionary-based storage
vehicles: Dict[str, Vehicle] = {}
telemetry_log: Dict[str, List[TelemetryReading]] = {}
alerts: Dict[str, Alert] = {}
```

**Why This Approach?**
- **Simplicity**: Easy to implement and understand for Phase 1
- **Performance**: Fast read/write operations for development
- **Prototyping**: Allows quick iteration and testing
- **Stateless**: No external dependencies for initial development

**Trade-offs:**
- Data loss on application restart
- No persistence across deployments
- Memory limitations for large datasets
- No concurrent access handling

**Future Migration Path:**
- PostgreSQL for relational data (vehicles, alerts)
- Redis for real-time telemetry caching
- TimescaleDB for time-series telemetry data

### **3. Data Model Design**

**Vehicle Model:**
```python
class Vehicle(BaseModel):
    vin: str                    # Unique identifier
    manufacturer: str           # Car manufacturer
    model: str                 # Car model
    fleet_id: str              # Fleet grouping
    owner: str                 # Vehicle owner
    registration_status: RegistrationStatus  # Current status
```

**Telemetry Model:**
```python
class TelemetryReading(BaseModel):
    vin: str                   # Vehicle identifier
    timestamp: datetime        # Reading timestamp
    latitude: float           # GPS coordinates
    longitude: float
    speed: float              # Speed in km/h
    engine_status: str        # Engine state
    fuel_level: float         # Fuel/battery percentage
    odometer: float           # Distance traveled
    diagnostic_codes: List[str] = []  # Error codes
```

**Why This Structure?**
- **Comprehensive**: Captures all essential vehicle data
- **Extensible**: Easy to add new fields
- **Real-time Ready**: Supports live monitoring
- **Analytics Friendly**: Structured for easy querying

### **4. Alert System Design**

**Alert Types:**
- **SpeedViolation**: When vehicle exceeds speed limit
- **LowFuel**: When fuel/battery level drops below threshold

**Alert Structure:**
```python
class Alert(BaseModel):
    id: str                   # Unique alert identifier
    vin: str                  # Associated vehicle
    timestamp: datetime       # When alert was generated
    alert_type: AlertType     # Type of alert
    message: str              # Human-readable message
    severity: str             # Alert severity level
```

**Why This Design?**
- **Immediate**: Alerts generated in real-time during telemetry ingestion
- **Categorized**: Different alert types for different handling
- **Severity Levels**: Allows prioritization of alerts
- **Audit Trail**: Complete history of all alerts

### **5. API Design Philosophy**

**RESTful Principles:**
- **Resource-based URLs**: `/vehicles/{vin}`, `/vehicles/{vin}/telemetry`
- **HTTP Methods**: GET, POST, DELETE for different operations
- **Status Codes**: Proper HTTP status codes (200, 201, 400, 404, 500)
- **Consistent Response Format**: Standardized JSON responses

**Why RESTful?**
- **Standard**: Widely understood and adopted
- **Stateless**: Each request contains all necessary information
- **Cacheable**: Responses can be cached appropriately
- **Client-Server**: Clear separation of concerns

## **API Endpoints**

### **Vehicle Management**

#### `POST /vehicles`
**Purpose**: Register a new vehicle in the system
**Request Body**: Vehicle object with VIN, manufacturer, model, fleet_id, owner, status
**Response**: Created vehicle object
**Status Codes**: 201 (Created), 400 (Vehicle already exists)

#### `GET /vehicles`
**Purpose**: List all registered vehicles
**Response**: Array of vehicle objects
**Status Codes**: 200 (OK)

#### `GET /vehicles/{vin}`
**Purpose**: Get specific vehicle details
**Parameters**: `vin` - Vehicle Identification Number
**Response**: Vehicle object
**Status Codes**: 200 (OK), 404 (Vehicle not found)

#### `DELETE /vehicles/{vin}`
**Purpose**: Remove vehicle from system
**Parameters**: `vin` - Vehicle Identification Number
**Status Codes**: 204 (No Content), 404 (Vehicle not found)

### **Telemetry Management**

#### `POST /vehicles/{vin}/telemetry`
**Purpose**: Ingest telemetry data for a specific vehicle
**Parameters**: `vin` - Vehicle Identification Number
**Request Body**: TelemetryReading object
**Response**: Ingested telemetry reading
**Status Codes**: 200 (OK), 404 (Vehicle not found)

#### `POST /telemetry/batch`
**Purpose**: Ingest multiple telemetry readings at once
**Request Body**: Array of TelemetryReading objects
**Response**: Array of successfully ingested readings
**Status Codes**: 200 (OK)

#### `GET /vehicles/{vin}/telemetry/latest`
**Purpose**: Get the most recent telemetry reading for a vehicle
**Parameters**: `vin` - Vehicle Identification Number
**Response**: Latest TelemetryReading object
**Status Codes**: 200 (OK), 404 (No telemetry found)

#### `GET /vehicles/{vin}/telemetry/history`
**Purpose**: Get telemetry history with optional time filtering
**Parameters**: 
- `vin` - Vehicle Identification Number
- `start_time` (optional) - Filter start time
- `end_time` (optional) - Filter end time
**Response**: Array of TelemetryReading objects
**Status Codes**: 200 (OK), 404 (Vehicle not found)

#### `GET /telemetry`
**Purpose**: Get telemetry data for multiple vehicles
**Query Parameters**:
- `vins` (optional) - Comma-separated list of VINs
- `start_time` (optional) - Filter start time
- `end_time` (optional) - Filter end time
**Response**: Dictionary mapping VINs to telemetry arrays
**Status Codes**: 200 (OK)

### **Alert Management**

#### `GET /alerts`
**Purpose**: List all generated alerts
**Response**: Array of Alert objects
**Status Codes**: 200 (OK)

#### `GET /alerts/{alert_id}`
**Purpose**: Get specific alert details
**Parameters**: `alert_id` - Unique alert identifier
**Response**: Alert object
**Status Codes**: 200 (OK), 404 (Alert not found)

### **Fleet Analytics**

#### `GET /fleets/{fleet_id}/analytics`
**Purpose**: Get comprehensive analytics for a fleet
**Parameters**: `fleet_id` - Fleet identifier
**Response**: Fleet analytics object containing:
- Active/inactive vehicle counts
- Average fuel level
- Distance traveled in last 24 hours
- Alert summary by type and severity
**Status Codes**: 200 (OK), 404 (Fleet not found)


### **Run**
```bash
cd motorqq/motorq
python3 -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### **Global Settings**
```python
GLOBAL_SPEED_LIMIT = 100.0 
LOW_FUEL_THRESHOLD = 15.0
```

### **Sample Data**
```json
// create vehicle
POST /vehicles
{
  "vin": "1HGBH41JXMN109186",
  "manufacturer": "Honda",
  "model": "Civic",
  "fleet_id": "fleet_001",
  "owner": "John Doe",
  "registration_status": "Active"
}

// ingest telemetry
POST /vehicles/1HGBH41JXMN109186/telemetry
{
  "vin": "1HGBH41JXMN109186",
  "timestamp": "2024-01-15T10:30:00Z",
  "latitude": 37.7749,
  "longitude": -122.4194,
  "speed": 65.0,
  "engine_status": "running",
  "fuel_level": 75.0,
  "odometer": 15000.0,
  "diagnostic_codes": []
}
```
