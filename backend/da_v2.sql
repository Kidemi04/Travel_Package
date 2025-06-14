-- Create Database
CREATE DATABASE IF NOT EXISTS travelease CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE travelease;

-- Users table
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

-- Bookings table
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

-- Booking items table
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

-- User sessions table
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
-- Domestic packages (Malaysian destinations)
('Kuala Lumpur City Break', 'Kuala Lumpur, Malaysia', '4 days', 599.00, 749.00, 'Explore Malaysia\'s capital city with its iconic Petronas Twin Towers and vibrant street food scene.', 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=400&h=300&fit=crop', 'domestic', 4.7, 20),
('Penang Heritage Tour', 'Penang, Malaysia', '3 days', 459.00, 569.00, 'Discover Georgetown\'s UNESCO World Heritage sites and famous street art.', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop', 'domestic', 4.5, 19),
('Langkawi Island Getaway', 'Langkawi, Malaysia', '5 days', 899.00, 1099.00, 'Relax on pristine beaches and enjoy duty-free shopping on this tropical island.', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop', 'domestic', 4.8, 18),
('Sabah Wildlife Adventure', 'Kota Kinabalu, Malaysia', '6 days', 1299.00, 1599.00, 'Experience Mount Kinabalu and encounter orangutans in their natural habitat.', 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=300&fit=crop', 'domestic', 4.6, 19),
('Cameron Highlands Retreat', 'Cameron Highlands, Malaysia', '3 days', 399.00, 489.00, 'Escape to the cool highlands with tea plantations and strawberry farms.', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop', 'domestic', 4.4, 18),

-- International packages
('London & Scotland Explorer', 'London & Edinburgh, UK', '10 days', 4299.00, 5399.00, 'Discover the best of England and Scotland with historic castles and vibrant cities.', 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=300&fit=crop', 'international', 4.9, 20),
('Ireland Discovery Tour', 'Dublin & Galway, Ireland', '8 days', 3799.00, 4699.00, 'Experience the Emerald Isle with its stunning landscapes and rich cultural heritage.', 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=300&fit=crop', 'international', 4.7, 19),
('Germany & Austria Adventure', 'Munich & Vienna', '9 days', 3999.00, 4899.00, 'Explore Bavarian culture and Austrian elegance with historic cities and beautiful landscapes.', 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=400&h=300&fit=crop', 'international', 4.8, 18),
('Paris & Provence Romance', 'Paris & Lyon, France', '7 days', 3499.00, 4299.00, 'Fall in love with French culture, from the Eiffel Tower to Provence lavender fields.', 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400&h=300&fit=crop', 'international', 4.8, 19),
('Canadian Rockies & Vancouver', 'Calgary & Vancouver, Canada', '11 days', 4899.00, 5999.00, 'Experience the majestic Canadian Rockies and cosmopolitan Vancouver.', 'https://images.unsplash.com/photo-1503614472-8c93d56cd848?w=400&h=300&fit=crop', 'international', 4.9, 18),
('Tokyo & Kyoto Cultural Journey', 'Tokyo & Kyoto, Japan', '10 days', 4299.00, 5399.00, 'Immerse yourself in Japan\'s rich culture, from modern Tokyo to ancient Kyoto.', 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop', 'international', 4.9, 20),
('Singapore City & Gardens', 'Singapore', '4 days', 1899.00, 2299.00, 'Explore the Lion City with its stunning skyline and world-famous gardens.', 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400&h=300&fit=crop', 'international', 4.7, 17);

-- Insert package inclusions
INSERT INTO package_inclusions (package_id, inclusion) VALUES
-- Kuala Lumpur City Break
(1, 'Hotel accommodation'),
(1, 'Petronas Twin Towers visit'),
(1, 'Food tour'),
(1, 'Airport transfers'),

-- Penang Heritage Tour
(2, 'Heritage hotel'),
(2, 'Georgetown walking tour'),
(2, 'Street art tour'),
(2, 'Local cuisine tasting'),

-- Langkawi Island Getaway
(3, 'Beach resort accommodation'),
(3, 'Island hopping tour'),
(3, 'Cable car ride'),
(3, 'Duty-free shopping'),

-- Sabah Wildlife Adventure
(4, 'Eco-lodge accommodation'),
(4, 'Mount Kinabalu tour'),
(4, 'Orangutan sanctuary visit'),
(4, 'Nature guide'),

-- Cameron Highlands Retreat
(5, 'Hill resort accommodation'),
(5, 'Tea plantation tour'),
(5, 'Strawberry farm visit'),
(5, 'Nature walks'),

-- London & Scotland Explorer
(6, 'International flights'),
(6, 'Hotel accommodation'),
(6, 'Train to Edinburgh'),
(6, 'Castle tours'),
(6, 'City tours'),

-- Ireland Discovery Tour
(7, 'International flights'),
(7, 'Hotel accommodation'),
(7, 'Cliffs of Moher tour'),
(7, 'Traditional Irish music'),

-- Germany & Austria Adventure
(8, 'International flights'),
(8, 'Hotel accommodation'),
(8, 'Neuschwanstein Castle'),
(8, 'Vienna city tour'),

-- Paris & Provence Romance
(9, 'International flights'),
(9, 'Hotel accommodation'),
(9, 'Eiffel Tower visit'),
(9, 'Provence day trip'),

-- Canadian Rockies & Vancouver
(10, 'International flights'),
(10, 'Hotel accommodation'),
(10, 'Banff National Park'),
(10, 'Vancouver city tour'),

-- Tokyo & Kyoto Cultural Journey
(11, 'International flights'),
(11, 'Traditional ryokan'),
(11, 'JR Rail Pass'),
(11, 'Cultural workshops'),

-- Singapore City & Gardens
(12, 'International flights'),
(12, 'Hotel accommodation'),
(12, 'Gardens by the Bay'),
(12, 'Marina Bay Sands');

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

-- Show database summary
SELECT 'Database Setup Complete' as Status;
SELECT COUNT(*) as 'Total Packages' FROM travel_packages;