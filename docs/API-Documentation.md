# API Documentation - Aether Logistics Stock Register

Base URL: `http://localhost:5000/api`

## Authentication

### 1. Login User
- **URL**: `/auth/login`
- **Method**: `POST`
- **Body**: `{ "username": "admin", "password": "admin123" }`
- **Response**: `200 OK` with token and user profile.

### 2. Register Operator
- **URL**: `/auth/register`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>` (Admin Only)
- **Body**: `{ "username": "operator1", "email": "op1@w.com", "password": "password123", "role": "operator" }`

---

## Products Catalog

### 1. List Products
- **URL**: `/products`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`

### 2. Define Product
- **URL**: `/products`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>` (Admin/Manager Only)
- **Body**: `{ "sku": "ELE-EAR-WRL", "name": "Bluetooth Earbuds", "category": "Electronics", "price": 49.99, "min_stock_level": 15 }`

---

## Stock & Inventory

### 1. Current Stock Levels
- **URL**: `/stock`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`

### 2. Stock Incoming Entry
- **URL**: `/stock/entry`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>` (Admin/Manager/Operator)
- **Body**: `{ "product_id": 1, "vendor_id": 1, "quantity": 50, "location": "Aisle 3, Shelf B", "unit": "pcs", "notes": "PO 8976" }`

---

## Shipments Outward

### 1. Dispatch Stock
- **URL**: `/dispatches`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>` (Admin/Manager/Operator)
- **Body**: `{ "product_id": 1, "quantity": 20, "destination": "Retail Outlet #5", "tracking_number": "UPS-12345" }`
