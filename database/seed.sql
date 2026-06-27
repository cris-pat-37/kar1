-- Database Seed for Goods Distribution Warehouse Stock Register

-- Seed Users (Password: admin123 for all users)
INSERT INTO users (username, password, email, role) VALUES 
('admin', '$2a$10$qfME6Go166Itze9YbcQSJe/Qqmy3v6FlaZGZiDBc6k7jgi1BkRZwW', 'admin@warehouse.com', 'admin'),
('manager', '$2a$10$qfME6Go166Itze9YbcQSJe/Qqmy3v6FlaZGZiDBc6k7jgi1BkRZwW', 'manager@warehouse.com', 'manager'),
('operator', '$2a$10$qfME6Go166Itze9YbcQSJe/Qqmy3v6FlaZGZiDBc6k7jgi1BkRZwW', 'operator@warehouse.com', 'operator'),
('test', '$2b$10$BizJiLZzFSL2ALu4I4D3Iud3/nye5ygG8TdrlWAfkjXiW2Tx/zy0y', 'test@warehouse.com', 'admin');

-- Seed Vendors
INSERT INTO vendors (name, contact_person, email, phone, address) VALUES
('Global Electronics Corp', 'John Doe', 'john@globalelectronics.com', '+1-555-0199', '100 Tech Blvd, Silicon Valley, CA'),
('Mega Logistics Products', 'Sarah Jenkins', 'sarah.j@megalogistics.com', '+1-555-0245', '45 Depot Rd, Chicago, IL'),
('Apex Packaging Supply', 'Robert Chen', 'sales@apexpack.com', '+1-555-0322', '12 Industrial Way, Austin, TX');

-- Seed Products
INSERT INTO products (name, sku, description, category, price, min_stock_level) VALUES
('Wireless Bluetooth Earbuds', 'sku001', 'High fidelity wireless sound with noise cancelling.', 'Electronics', 49.99, 15),
('Ergonomic Office Chair', 'sku002', 'Mesh back office chair with lumbar support.', 'Furniture', 189.99, 5),
('USB-C Hub Multiport Adapter', 'sku003', '7-in-1 USB-C hub with HDMI, card reader, and USB-A ports.', 'Electronics', 29.99, 20),
('Self-Cleaning Water Bottle', 'sku004', 'Insulated stainless steel bottle with UV-C purification.', 'Lifestyle', 59.99, 10),
('Dual Band Wi-Fi 6 Router', 'sku005', 'Gigabit wireless router with coverage up to 2000 sq ft.', 'Electronics', 119.99, 8),
('Cardboard Shipping Boxes (25 Pack)', 'sku006', 'Medium size heavy duty corrugated cardboard boxes.', 'Packaging', 34.99, 30);

-- Seed Stock
INSERT INTO stock (product_id, vendor_id, quantity, location, unit, status) VALUES
(1, 1, 50, 'Aisle 3, Shelf B', 'pcs', 'available'),
(2, 2, 8, 'Aisle 12, Shelf A', 'pcs', 'available'),
(3, 1, 100, 'Aisle 3, Shelf D', 'pcs', 'available'),
(4, 2, 4, 'Aisle 7, Shelf C', 'pcs', 'available'), -- Low stock (min is 10)
(5, 1, 15, 'Aisle 4, Shelf A', 'pcs', 'available'),
(6, 3, 45, 'Aisle 15, Shelf E', 'packs', 'available');

-- Seed Stock History
INSERT INTO stock_history (product_id, transaction_type, quantity, previous_quantity, new_quantity, user_id, notes) VALUES
(1, 'stock_in', 50, 0, 50, 1, 'Initial inventory load'),
(2, 'stock_in', 8, 0, 8, 1, 'Initial inventory load'),
(3, 'stock_in', 100, 0, 100, 1, 'Initial inventory load'),
(4, 'stock_in', 4, 0, 4, 1, 'Initial inventory load'),
(5, 'stock_in', 15, 0, 15, 1, 'Initial inventory load'),
(6, 'stock_in', 45, 0, 45, 1, 'Initial inventory load');
