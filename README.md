# 🚗 Connected Car Fleet Management System

This is a full-stack, containerized application designed to monitor and manage a fleet of connected vehicles. The system handles real-time data, provides historical analysis, and supports operational management through a comprehensive dashboard.

## ✨ Project Overview

This system is built around a modern microservices architecture orchestrated by Docker Compose.

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Backend API** | **FastAPI** (Python) | Handles core business logic, API endpoints, and data processing. |
| **Frontend UI** | **React/Next.js** | Provides the dashboard, visualizations, and user interfaces. |
| **Primary Database** | **MongoDB Atlas** | Cloud database for persistent storage (vehicle data, trip logs, etc.). |
| **Caching** | **Redis** | High-speed cache layer for frequent data retrieval and session management. |
| **Deployment** | **Docker Compose** | Orchestration for simple, portable deployment across all services. |


---


## 🚀 Getting Started

Follow these steps to get the entire multi-service application running locally in a single command.

### 1. Clone the Repository

```bash
git clone [https://github.com/Raksh-iscool/Connected-Car-Fleet-Management-System.git](https://github.com/Raksh-iscool/Connected-Car-Fleet-Management-System.git)
cd Connected-Car-Fleet-Management-System
```
### 2. Configure Environment Variables
Create a file named .env in the root directory of the project to store your environment variables securely.

Code snippet
```bash
# This is the connection string for the primary database.
MONGO_URI="mongodb+srv://<REPLACE WITH YOUR LINK>.mongodb.net/"
# 'redis_cache' is the service name used in docker-compose.yml
REDIS_HOST=redis_cache
REDIS_PORT=6379
```
### 3. Build and Run All Services
Build the Docker images and start all containers (backend, frontend, and Redis) using:
```bash

docker compose up --build -d
#This will:
#Build FastAPI and Next.js Docker images
#Start the Redis caching service
#Link all containers via a shared Docker network
```
### 4. Access the Application

Once the containers are running successfully, access your application using the following URLs:

#### Frontend (React/Next.js)	Fleet Management Dashboard	http://localhost:3000

#### Backend (FastAPI)	Interactive API Docs (Swagger UI)	http://localhost:8000/docs

#### Redis	Cache service	Accessible internally as redis_cache:6379

### 5. Verify the Setup

Check the status of running containers:
```bash
docker compose ps
```
View live logs:
```bash
docker compose logs -f
```

If everything is configured correctly, you should see:

✅ FastAPI connected to MongoDB Atlas

✅ Redis initialized successfully

✅ Next.js frontend running at port 3000

### 6. Stop and Cleanup

To stop and remove all running containers, networks, and temporary volumes:
```bash
docker compose down
```

If you also want to remove all built images (for a clean rebuild):
```bash
docker compose down --rmi all
```

## 📂 Repository Structure

```bash
.
├── .env                     # Environment variables (ignored by Git)
├── .dockerignore            # Files/folders excluded from Docker build context
├── .gitignore               # Files/folders excluded from Git repository
├── docker-compose.yml       # Defines and links all services (FastAPI, Next.js, Redis)
├── Dockerfile.backend       # FastAPI backend image build file
├── Dockerfile.frontend      # Next.js frontend image build file
├── requirements.txt         # Python dependencies
├── main.py, models.py, ...  # Core FastAPI backend files
└── frontend/                # Next.js frontend source code
    ├── package.json
    ├── pages/
    ├── components/
    └── public/
```
Output images
## 📊 Fleet Dashboard

![Fleet Dashboard](./images/dashboard.png)

## 🚨 Alerts and Telemetry View

![Telemetry View](./images/telemetry.png)
