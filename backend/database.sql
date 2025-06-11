-- TravelEase MySQL Database Schema
-- Run this script to create the complete database structure

-- Create Database
CREATE DATABASE IF NOT EXISTS travelease CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE travelease;

-- Users table (Required for Registration - 5 marks)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_active (is_active)
);

-- Travel packages table
CREATE TABLE travel_packages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    duration VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    description TEXT NOT NULL,
    image VARCHAR(500),
    category ENUM('domestic', 'international') NOT NULL,
    rating DECIMAL(3,2) DEFAULT 0,
    available BOOLEAN DEFAULT TRUE,
    discount_percentage INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_available (available),
    INDEX idx_rating (rating)
);

-- Package inclusions table
CREATE TABLE package_inclusions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    package_id INT NOT NULL,
    inclusion VARCHAR(200) NOT NULL,
    FOREIGN KEY (package_id) REFERENCES travel_packages(id) ON DELETE CASCADE,
    INDEX idx_package (package_id)
);

-- Bookings table (Required for Purchase Management - 10 marks)
CREATE TABLE bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    booking_reference VARCHAR(50) UNIQUE NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'confirmed',
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    shipping_cost DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    promo_code VARCHAR(20),
    special_requests TEXT,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    travel_date DATE,
    last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_booking_date (booking_date)
);

-- Booking items table (for CRUD operations - required)
CREATE TABLE booking_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    package_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    special_requests TEXT,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (package_id) REFERENCES travel_packages(id),
    INDEX idx_booking (booking_id),
    INDEX idx_package (package_id)
);

-- User sessions table (for JWT token management)
CREATE TABLE user_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_expires (expires_at)
);

-- Insert sample travel packages data
INSERT INTO travel_packages (name, destination, duration, price, original_price, description, image, category, rating, discount_percentage) VALUES
('Bali Paradise Getaway', 'Bali, Indonesia', '7 days', 1299.00, 1599.00, 'Experience the magic of Bali with pristine beaches, ancient temples, and vibrant culture.', 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=300&fit=crop', 'international', 4.8, 19),
('Sydney Harbour Explorer', 'Sydney, Australia', '5 days', 899.00, 1099.00, 'Discover Sydney\'s iconic landmarks, from the Opera House to Bondi Beach.', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop', 'domestic', 4.6, 18),
('Tokyo Cultural Journey', 'Tokyo, Japan', '10 days', 2299.00, 2899.00, 'Immerse yourself in Japan\'s rich culture, from ancient temples to modern technology.', 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop', 'international', 4.9, 21),
('Great Barrier Reef Adventure', 'Cairns, Australia', '6 days', 1199.00, 1399.00, 'Dive into the world\'s largest coral reef system with guided snorkeling and diving.', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop', 'domestic', 4.7, 14),
('European Grand Tour', 'Paris, Rome, London', '14 days', 3499.00, 4299.00, 'Experience three iconic European capitals in one unforgettable journey.', 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400&h=300&fit=crop', 'international', 4.8, 19),
('Melbourne Food & Wine Tour', 'Melbourne, Australia', '4 days', 699.00, 849.00, 'Explore Melbourne\'s famous food scene and nearby wine regions.', 'https://images.unsplash.com/photo-1514395462725-fb4566210144?w=400&h=300&fit=crop', 'domestic', 4.5, 18),
('Uluru Spiritual Journey', 'Uluru, Australia', '3 days', 599.00, 749.00, 'Connect with ancient Aboriginal culture at Australia\'s spiritual heart.', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop', 'domestic', 4.4, 20),
('Thailand Island Hopping', 'Phuket & Koh Phi Phi, Thailand', '8 days', 1599.00, 1999.00, 'Explore pristine beaches and crystal-clear waters in tropical paradise.', 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=300&fit=crop', 'international', 4.7, 20);

-- Insert package inclusions
INSERT INTO package_inclusions (package_id, inclusion) VALUES
-- Bali Paradise Getaway
(1, 'Round-trip flights'),
(1, '5-star resort accommodation'),
(1, 'Daily breakfast'),
(1, 'Temple tours'),
(1, 'Spa treatment'),

-- Sydney Harbour Explorer
(2, 'Hotel accommodation'),
(2, 'Harbour cruise'),
(2, 'Opera House tour'),
(2, 'Bondi Beach access'),

-- Tokyo Cultural Journey
(3, 'International flights'),
(3, 'Traditional ryokan'),
(3, 'JR Rail Pass'),
(3, 'Cultural workshops'),
(3, 'Guided tours'),

-- Great Barrier Reef Adventure
(4, 'Resort accommodation'),
(4, 'Reef tours'),
(4, 'Snorkeling gear'),
(4, 'Marine biologist guide'),

-- European Grand Tour
(5, 'International flights'),
(5, 'Hotel accommodation'),
(5, 'City tours'),
(5, 'Museum passes'),
(5, 'High-speed train tickets'),

-- Melbourne Food & Wine Tour
(6, 'Boutique hotel'),
(6, 'Food tours'),
(6, 'Wine tastings'),
(6, 'Cooking classes'),

-- Uluru Spiritual Journey
(7, 'Resort accommodation'),
(7, 'Cultural guide'),
(7, 'Sunrise/sunset tours'),
(7, 'Traditional meals'),

-- Thailand Island Hopping
(8, 'Round-trip flights'),
(8, 'Beach resort accommodation'),
(8, 'Island hopping tours'),
(8, 'Snorkeling equipment'),
(8, 'Beachside dining');

-- Create a demo user account (password: demo123)
-- Password hash for 'demo123' using bcrypt with salt rounds 10
INSERT INTO users (firstName, lastName, email, password, phone, address) VALUES
('Demo', 'User', 'demo@travelease.com', '$2b$10$rOvmO4jXh4yRJ4TE2cAJOO7LX0kV4b5sZkH5tN0m6P3qR8sU1vY2e', '+61 400 123 456', '123 Collins Street, Melbourne VIC 3000'),
('Jane', 'Smith', 'jane@example.com', '$2b$10$rOvmO4jXh4yRJ4TE2cAJOO7LX0kV4b5sZkH5tN0m6P3qR8sU1vY2e', '+61 400 987 654', '456 Queen Street, Sydney NSW 2000');

-- Create some sample bookings
INSERT INTO bookings (user_id, booking_reference, subtotal, tax_amount, shipping_cost, total_amount, promo_code) VALUES
(1, 'TRV1703123456', 2598.00, 259.80, 0, 2857.80, 'SAVE10'),
(2, 'TRV1703123457', 899.00, 89.90, 50.00, 1038.90, NULL);

-- Insert sample booking items
INSERT INTO booking_items (booking_id, package_id, quantity, unit_price, total_price) VALUES
(1, 1, 2, 1299.00, 2598.00),
(2, 2, 1, 899.00, 899.00);

-- Create views for common queries
CREATE VIEW active_packages AS
SELECT 
    p.*,
    GROUP_CONCAT(pi.inclusion) as inclusions
FROM travel_packages p 
LEFT JOIN package_inclusions pi ON p.id = pi.package_id
WHERE p.available = TRUE 
GROUP BY p.id
ORDER BY p.rating DESC, p.created_at DESC;

CREATE VIEW user_booking_summary AS
SELECT 
    u.id as user_id,
    u.firstName,
    u.lastName,
    u.email,
    COUNT(b.id) as total_bookings,
    COALESCE(SUM(b.total_amount), 0) as total_spent,
    MAX(b.booking_date) as last_booking_date
FROM users u
LEFT JOIN bookings b ON u.id = b.user_id AND b.status != 'cancelled'
GROUP BY u.id, u.firstName, u.lastName, u.email;

-- Create stored procedures for common operations
DELIMITER //

CREATE PROCEDURE GetUserBookings(IN userId INT)
BEGIN
    SELECT 
        b.*,
        JSON_ARRAYAGG(
            JSON_OBJECT(
                'id', bi.id,
                'package_id', bi.package_id,
                'package_name', tp.name,
                'destination', tp.destination,
                'duration', tp.duration,
                'quantity', bi.quantity,
                'unit_price', bi.unit_price,
                'total_price', bi.total_price,
                'special_requests', bi.special_requests
            )
        ) as items
    FROM bookings b
    LEFT JOIN booking_items bi ON b.id = bi.booking_id
    LEFT JOIN travel_packages tp ON bi.package_id = tp.id
    WHERE b.user_id = userId
    GROUP BY b.id
    ORDER BY b.booking_date DESC;
END //

CREATE PROCEDURE SearchPackages(IN searchTerm VARCHAR(255))
BEGIN
    SELECT 
        p.*,
        GROUP_CONCAT(pi.inclusion) as inclusions
    FROM travel_packages p 
    LEFT JOIN package_inclusions pi ON p.id = pi.package_id
    WHERE p.available = TRUE 
    AND (p.name LIKE CONCAT('%', searchTerm, '%') 
         OR p.destination LIKE CONCAT('%', searchTerm, '%') 
         OR p.description LIKE CONCAT('%', searchTerm, '%'))
    GROUP BY p.id
    ORDER BY p.rating DESC;
END //

DELIMITER ;

-- Performance optimization indexes
CREATE INDEX idx_packages_search ON travel_packages(name, destination);
CREATE INDEX idx_bookings_user_status ON bookings(user_id, status);
CREATE INDEX idx_booking_items_composite ON booking_items(booking_id, package_id);

-- Insert additional test data for demo purposes
INSERT INTO bookings (user_id, booking_reference, subtotal, tax_amount, total_amount, status) VALUES
(1, 'TRV1703123458', 1199.00, 119.90, 1318.90, 'confirmed'),
(1, 'TRV1703123459', 699.00, 69.90, 768.90, 'completed');

INSERT INTO booking_items (booking_id, package_id, quantity, unit_price, total_price) VALUES
(3, 4, 1, 1199.00, 1199.00),
(4, 6, 1, 699.00, 699.00);

-- Show database summary
SELECT 'Database Setup Complete' as Status;
SELECT COUNT(*) as 'Total Users' FROM users;
SELECT COUNT(*) as 'Total Packages' FROM travel_packages;
SELECT COUNT(*) as 'Total Bookings' FROM bookings;

-- Display sample data
SELECT 'Sample Travel Packages:' as Info;
SELECT id, name, destination, price, category FROM travel_packages LIMIT 5;

SELECT 'Sample Users:' as Info;
SELECT id, firstName, lastName, email FROM users;

SELECT 'Sample Bookings:' as Info;
SELECT id, booking_reference, total_amount, status FROM bookings;