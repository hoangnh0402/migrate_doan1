# CityLens Backend Migration Plan (Python FastAPI -> Java Spring Boot)

## 1. Current Progress Status (as of 2026-03-30)
- **Completed (Batch 1-3):**
    - Multi-module Maven Infrastructure (Hexagonal Architecture)
    - Security (JWT + Spring Security)
    - Authentication (Admin & Mobile)
    - Entities/Realtime/Dashboard (PostgreSQL JSONB + JPA)
    - Reports & Statistics (MongoDB + MapReduce logic)
    - Comments (MongoDB CRUD)
    - User Management (CRUD + Stats + Toggle Status)
- **Currently Implementing (Final Batch):**
    - Geographic Service (PostGIS Spatial Queries) - *Done*
    - NGSI-LD Context Broker (Context API) - *Done*
    - App Alerts (Mobile Alerts via MongoDB) - *Done*
    - Notification System (In-app notifications) - *Done*
    - Media Service (File/Image Upload Management) - *Done*

## 2. Upcoming Roadmap

### Phase 10: Notification System
- Port `NotificationEntity` and `NotificationRepository` (Postgres)
- Implement `NotificationController` with badge count and mark-read logic
- Integrate with existing user flows

### Phase 11: Media & File Management
- Implement `MediaController` for multipart file uploads
- Strategy for local/cloud storage (matching Python's `media_service`)
- Image processing (thumbnails/metadata) logic

### Phase 12: Integration & Stability
- Full circular dependency check across 11 modules
- Validation of NGSI-LD compliance (ETSI GS CIM 009)
- Fine-tuning HikariCP and MongoDB connection pools

### Phase 13: Testing & Frontend Handover
- Unit tests for Core Domain logic
- Integration tests for JPA/Mongo adapters
- Cross-origin (CORS) check for Web-App (Expo) and Mobile-App integration

## 3. Technical Debt / Refinement
- Resolve Lombok-free domain model constraints (ensure no framework leaks)
- Optimize spatial queries in `GeographicController`
- Swagger/OpenAPI documentation for all 40+ endpoints

---
*Created by Antigravity AI Assistant*
