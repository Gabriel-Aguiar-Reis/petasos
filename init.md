# INIT.MD — petasos (android only)

## 1. Project Overview

Codename: **RoadLedger**

A mobile-first, offline-first financial and operational management system designed for ride-hailing drivers. The app enables drivers to track earnings, costs, working hours, scheduled rides, and performance metrics across multiple ride platforms.

Primary goal: **maximize driver profitability and visibility over real income**.

---

## 2. Tech Stack (Modern & Opinionated)

* **Frontend:** React Native (Expo)
* **Language:** TypeScript (strict mode)
* **UI System:** shadcn/ui (React Native Reusables)
* **State Management:** Zustand + React Query (TanStack Query)
* **Database (local):** SQLite via Expo + Drizzle ORM
* **Sync Strategy:** Offline-first with optional cloud sync (future)
* **Notifications:** Expo Notifications
* **Background Tasks:** Expo Task Manager + Background Fetch
* **Charts:** Victory Native
* **File Export:** XLSX (SheetJS) + JSON
* **Location:** Expo Location (GPS tracking)
* **Architecture:** Clean Architecture, DDD and SDD

---

## 3. Core Principles

* Offline-first (no internet required)
* Driver-centric UX (fast input, minimal friction)
* Multi-platform agnostic (Uber, 99, InDrive, etc.)
* Data ownership (easy export)
* Automation-first (notifications parsing, auto tracking)

---

## 4. Core Features

### 4.1 Financial Tracking

#### Earnings

* Manual entry
* Auto-detected from notifications
* Linked to trips

#### Costs

* Fuel
* Maintenance
* Food
* Parking/Tolls
* Custom categories

#### Derived Metrics

* Daily profit
* Weekly/monthly profit
* Profit per hour
* Profit per km

---

### 4.2 Dashboard (Analytics)

* Revenue vs Costs chart
* Profit over time
* Fuel efficiency trends
* Earnings per app
* Heatmap of work hours

---

### 4.3 Trip Management

* Manual trip creation
* Auto-created from notification parsing
* Fields:

  * Origin
  * Destination
  * Distance (km)
  * Duration
  * Earnings
  * Platform (Uber, 99, etc.)

---

### 4.4 Scheduled Rides

* Create scheduled trips
* Source: manual or imported
* Configurable reminders
* Notification triggers

---

### 4.5 Time Tracking ("Clock In/Out")

* Start/stop work session
* Track active hours
* Idle vs driving estimation

---

### 4.6 Goals System

* Daily earnings goal
* Weekly goal
* Monthly goal
* Visual progress tracking

---

### 4.7 Fuel Tracking

* Fuel fill logs
* Price per liter
* Distance since last fill
* Automatic consumption calculation

Derived:

* km/L
* cost per km

---

### 4.8 GPS Integration

* Track distance traveled
* Estimate route efficiency
* Background tracking (optional)

---

### 4.9 Notification Parsing (Advanced)

* Read incoming notifications from ride apps
* Extract:

  * price
  * distance
  * pickup/dropoff
* Auto-create trips

NOTE: Requires Android-specific permissions (Notification Listener Service)

---

### 4.10 Data Export

* Export to:

  * XLSX
  * JSON
* Filters:

  * date range
  * platform

---

## 5. Advanced Features (Differentials)

### 5.1 Smart Insights

* "Best hours to drive"
* "Most profitable app"
* "Fuel inefficiency alert"

---

### 5.2 Predictive Earnings

* Estimate end-of-day profit based on current pace

---

### 5.3 Maintenance Alerts

* Oil change reminders
* Tire check
* Custom intervals

---

### 5.4 Multi-Vehicle Support

* Track multiple cars

---

### 5.5 Backup & Sync (Future)

* Optional cloud sync
* Google Drive / iCloud

---

## 6. Data Modeling (Drizzle)

### Tables

#### users

* id
* name

#### vehicles

* id
* name
* plate

#### trips

* id
* date
* earnings
* distance
* duration
* platform
* origin
* destination

#### costs

* id
* date
* amount
* category

#### fuel_logs

* id
* liters
* total_price
* odometer

#### work_sessions

* id
* start_time
* end_time

#### goals

* id
* type (daily, weekly, monthly)
* target_amount

---

## 7. Offline-First Strategy

* All writes go to local SQLite
* Sync queue (future)
* Conflict resolution: last-write-wins (initial)

---

## 8. App Architecture

* Clean Architecture
* Domain-Driven Design
* Spec-Driven Development

---

## 9. UX Guidelines

* One-hand usage
* Large tap targets
* Fast input (<= 3 taps for key actions)
* Dark mode first

---

## 10. MVP Scope (First Version)

* Manual earnings & costs
* Basic dashboard
* Trip logging
* Fuel tracking
* Export JSON

---

## 11. Post-MVP

* Notification parsing
* GPS tracking
* Smart insights
* XLSX export

---

## 12. Risks & Constraints

* Notification parsing limitations (iOS restrictions)
* Background GPS battery usage
* Data consistency across manual + auto entries

---

## 13. Success Metrics

* Daily active usage
* Data completeness
* Profit visibility improvement

---

## 14. Future Vision

Turn into a **full financial OS for drivers**, including:

* Tax estimation
* Expense optimization
* Marketplace integrations

---

## 15. SpecKit Generation Notes

* Generate screens first (Dashboard, Trips, Costs, Goals)
* Then generate hooks and services
* Then integrate database (Drizzle)
* Then add background tasks

---
