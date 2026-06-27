# Goods Distribution Warehouse Stock Register

A modern, high-aesthetic web application for managing stock registration, inventory levels, vendors, dispatches, returns, and damages. Built with React (Vite) + Express + SQLite, styled using premium dark-theme glassmorphism CSS.

## Features

- **Auth Controls**: JWT-based session security with role-based routing (Admin, Manager, Operator).
- **Core Logistics Operations**:
  - Stock Incoming Entry (Receipt log from vendors)
  - Shipments Dispatch Outward (checks stock balances, captures destination/tracking)
  - Returns processing (Inspected/Restocked vs Quarantined)
  - Damaged items filing (deducts available stock, updates quarantine hold)
- **Real-Time Thresholds & Alerts**: Proactive alert tray showing low stock items and items in quarantine.
- **Reporting & Downloads**: Direct official downloads for spreadsheets (CSV) or printable files (PDF).
- **Analytics Charts**: Visualizations for inventory valuations, monthly movements, and category share.

---

## Folder Structure

```plaintext
goods-distribution-warehouse-stock-register/
├── frontend/        # React + Vite application (runs on port 3000)
├── backend/         # Express + Node.js API server (runs on port 5000)
├── database/        # SQL files (schema, seed, and sqlite DB)
├── docs/            # Project documentation files
```

---

## Setup & Running Guide

### 1. Database Setup
The SQLite database is auto-compiled and seeded when the backend starts for the first time. No manual command is needed!

### 2. Run Backend API
Navigate to the `backend/` folder, install dependencies, and start the development server:
```bash
cd backend
npm install
npm run dev
```

### 3. Run Frontend
Navigate to the `frontend/` folder, install dependencies, and start the Vite dev server:
```bash
cd frontend
npm install
npm run dev
```

The application will be accessible at: `http://localhost:3000/`

---

## Credentials

The database is pre-seeded with three accounts (all share the same password for ease of evaluation):

- **Administrator**: `admin` / `admin123` (Full system configuration & operator creation)
- **Logistics Manager**: `manager` / `admin123` (Manage products catalog & suppliers)
- **Operator**: `operator` / `admin123` (Perform stock-ins, dispatches, returns, and damage reports)
