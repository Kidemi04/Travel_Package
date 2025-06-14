const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? [
            'https://kidemi04.github.io',
            'https://travelpackage-production.up.railway.app'
          ] 
        : [
            'http://localhost:3000',
            'http://127.0.0.1:5500'
          ],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Database configuration ──────────────────────────────
let pool;
 if (process.env.DATABASE_URL) {
     // Cloud / Railway: 单行 URI + TLS
     pool = mysql.createPool({
         uri: process.env.DATABASE_URL,
         ssl: { rejectUnauthorized: false }
     });
     console.log('🔗 Using DATABASE_URL →', process.env.DATABASE_URL);
 } else {
     // 本地开发回退到分字段
     const dbConfig = {
         host: process.env.DB_HOST || 'localhost',
         user: process.env.DB_USER || 'root',
         password: process.env.DB_PASSWORD || '',
         database: process.env.DB_NAME || 'travelease',
         port: process.env.DB_PORT || 3306
     };
     pool = mysql.createPool(dbConfig);
     console.log('🔗 Using local DB_* vars');
}

// Test database connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
}

// JWT middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Enhanced Health check with Railway and Local support
app.get('/', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'TravelEase API is running',
        environment: process.env.NODE_ENV || 'development',
        platform: process.env.RAILWAY_ENVIRONMENT ? 'Railway' : 'Local',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/health', async (req, res) => {
    try {
        const dbConnected = await testConnection();
        const healthData = {
            status: 'OK', 
            message: 'TravelEase API is running',
            environment: process.env.NODE_ENV || 'development',
            platform: process.env.RAILWAY_ENVIRONMENT ? 'Railway' : 'Local',
            database: dbConnected ? 'Connected' : 'Disconnected',
            timestamp: new Date().toISOString(),
            server: {
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                version: process.version
            }
        };

        // Railway specific checks
        if (process.env.RAILWAY_ENVIRONMENT) {
            healthData.railway = {
                environment: process.env.RAILWAY_ENVIRONMENT,
                deployment_id: process.env.RAILWAY_DEPLOYMENT_ID,
                service_id: process.env.RAILWAY_SERVICE_ID
            };
        }

        // Local specific checks
        if (!process.env.RAILWAY_ENVIRONMENT) {
            healthData.local = {
                hostname: require('os').hostname(),
                platform: require('os').platform(),
                arch: require('os').arch()
            };
        }

        res.json(healthData);
    } catch (error) {
        res.status(500).json({ 
            status: 'ERROR', 
            message: 'API health check failed',
            error: error.message,
            environment: process.env.NODE_ENV || 'development',
            platform: process.env.RAILWAY_ENVIRONMENT ? 'Railway' : 'Local',
            timestamp: new Date().toISOString()
        });
    }
});

app.get('/api/init-full-database', async (req, res) => {
    const startTime = Date.now();
    const logs = [];
    
    try {
        logs.push('🔄 Starting COMPLETE database setup...');
        console.log('🔄 Starting COMPLETE database setup...');
        
        // Environment info
        const environment = {
            platform: process.env.RAILWAY_ENVIRONMENT ? 'Railway' : 'Local',
            node_env: process.env.NODE_ENV || 'development',
            database_host: process.env.DB_HOST || 'localhost',
            timestamp: new Date().toISOString()
        };
        
        logs.push(`📍 Environment: ${environment.platform} (${environment.node_env})`);
        console.log(`📍 Environment: ${environment.platform} (${environment.node_env})`);

        // STEP 1: CREATE TABLES
        logs.push('🏗️ Creating database tables...');
        console.log('🏗️ Creating database tables...');

        // Create users table
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS users (
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
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        logs.push('✅ Users table created');

        // Create travel_packages table
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS travel_packages (
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
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        logs.push('✅ Travel packages table created');

        // Create package_inclusions table
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS package_inclusions (
                id INT PRIMARY KEY AUTO_INCREMENT,
                package_id INT NOT NULL,
                inclusion VARCHAR(200) NOT NULL,
                FOREIGN KEY (package_id) REFERENCES travel_packages(id) ON DELETE CASCADE,
                INDEX idx_package (package_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        logs.push('✅ Package inclusions table created');

        // Create bookings table
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS bookings (
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
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        logs.push('✅ Bookings table created');

        // Create booking_items table
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS booking_items (
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
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        logs.push('✅ Booking items table created');

        // Create user_sessions table
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS user_sessions (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                token_hash VARCHAR(255) NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_user (user_id),
                INDEX idx_expires (expires_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        logs.push('✅ User sessions table created');

        // STEP 2: CHECK IF DATA EXISTS
        logs.push('🔍 Checking existing data...');
        console.log('🔍 Checking existing data...');
        
        const [existingPackages] = await pool.execute('SELECT COUNT(*) as count FROM travel_packages');
        
        if (existingPackages[0].count > 0) {
            return res.json({ 
                success: true, 
                message: `Database tables created successfully! Already has ${existingPackages[0].count} packages. No data insertion needed.`,
                environment,
                execution_time: `${Date.now() - startTime}ms`,
                logs
            });
        }

        // STEP 3: INSERT SAMPLE DATA
        logs.push('📦 Inserting travel packages...');
        console.log('📦 Inserting travel packages...');
        
        const packagesSQL = `INSERT INTO travel_packages (name, destination, duration, price, original_price, description, image, category, rating, discount_percentage) VALUES
            ('Kuala Lumpur City Break', 'Kuala Lumpur, Malaysia', '4 days', 599.00, 749.00, 'Explore Malaysia\\'s capital city with its iconic Petronas Twin Towers and vibrant street food scene.', 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=400&h=300&fit=crop', 'domestic', 4.7, 20),
            ('Penang Heritage Tour', 'Penang, Malaysia', '3 days', 459.00, 569.00, 'Discover Georgetown\\'s UNESCO World Heritage sites and famous street art.', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop', 'domestic', 4.5, 19),
            ('Langkawi Island Getaway', 'Langkawi, Malaysia', '5 days', 899.00, 1099.00, 'Relax on pristine beaches and enjoy duty-free shopping on this tropical island.', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop', 'domestic', 4.8, 18),
            ('Sabah Wildlife Adventure', 'Kota Kinabalu, Malaysia', '6 days', 1299.00, 1599.00, 'Experience Mount Kinabalu and encounter orangutans in their natural habitat.', 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=300&fit=crop', 'domestic', 4.6, 19),
            ('Cameron Highlands Retreat', 'Cameron Highlands, Malaysia', '3 days', 399.00, 489.00, 'Escape to the cool highlands with tea plantations and strawberry farms.', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop', 'domestic', 4.4, 18),
            ('London & Scotland Explorer', 'London & Edinburgh, UK', '10 days', 4299.00, 5399.00, 'Discover the best of England and Scotland with historic castles and vibrant cities.', 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=300&fit=crop', 'international', 4.9, 20),
            ('Ireland Discovery Tour', 'Dublin & Galway, Ireland', '8 days', 3799.00, 4699.00, 'Experience the Emerald Isle with its stunning landscapes and rich cultural heritage.', 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=300&fit=crop', 'international', 4.7, 19),
            ('Germany & Austria Adventure', 'Munich & Vienna', '9 days', 3999.00, 4899.00, 'Explore Bavarian culture and Austrian elegance with historic cities and beautiful landscapes.', 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=400&h=300&fit=crop', 'international', 4.8, 18),
            ('Paris & Provence Romance', 'Paris & Lyon, France', '7 days', 3499.00, 4299.00, 'Fall in love with French culture, from the Eiffel Tower to Provence lavender fields.', 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400&h=300&fit=crop', 'international', 4.8, 19),
            ('Canadian Rockies & Vancouver', 'Calgary & Vancouver, Canada', '11 days', 4899.00, 5999.00, 'Experience the majestic Canadian Rockies and cosmopolitan Vancouver.', 'https://images.unsplash.com/photo-1503614472-8c93d56cd848?w=400&h=300&fit=crop', 'international', 4.9, 18),
            ('Tokyo & Kyoto Cultural Journey', 'Tokyo & Kyoto, Japan', '10 days', 4299.00, 5399.00, 'Immerse yourself in Japan\\'s rich culture, from modern Tokyo to ancient Kyoto.', 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop', 'international', 4.9, 20),
            ('Singapore City & Gardens', 'Singapore', '4 days', 1899.00, 2299.00, 'Explore the Lion City with its stunning skyline and world-famous gardens.', 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400&h=300&fit=crop', 'international', 4.7, 17)`;

        await pool.execute(packagesSQL);
        logs.push('✅ Travel packages inserted successfully');

        // STEP 4: INSERT PACKAGE INCLUSIONS
        logs.push('🎯 Inserting package inclusions...');
        console.log('🎯 Inserting package inclusions...');
        
        const inclusionsData = [
            [1, 'Hotel accommodation'], [1, 'Petronas Twin Towers visit'], [1, 'Food tour'], [1, 'Airport transfers'],
            [2, 'Heritage hotel'], [2, 'Georgetown walking tour'], [2, 'Street art tour'], [2, 'Local cuisine tasting'],
            [3, 'Beach resort accommodation'], [3, 'Island hopping tour'], [3, 'Cable car ride'], [3, 'Duty-free shopping'],
            [4, 'Eco-lodge accommodation'], [4, 'Mount Kinabalu tour'], [4, 'Orangutan sanctuary visit'], [4, 'Nature guide'],
            [5, 'Hill resort accommodation'], [5, 'Tea plantation tour'], [5, 'Strawberry farm visit'], [5, 'Nature walks'],
            [6, 'International flights'], [6, 'Hotel accommodation'], [6, 'Train to Edinburgh'], [6, 'Castle tours'], [6, 'City tours'],
            [7, 'International flights'], [7, 'Hotel accommodation'], [7, 'Cliffs of Moher tour'], [7, 'Traditional Irish music'],
            [8, 'International flights'], [8, 'Hotel accommodation'], [8, 'Neuschwanstein Castle'], [8, 'Vienna city tour'],
            [9, 'International flights'], [9, 'Hotel accommodation'], [9, 'Eiffel Tower visit'], [9, 'Provence day trip'],
            [10, 'International flights'], [10, 'Hotel accommodation'], [10, 'Banff National Park'], [10, 'Vancouver city tour'],
            [11, 'International flights'], [11, 'Traditional ryokan'], [11, 'JR Rail Pass'], [11, 'Cultural workshops'],
            [12, 'International flights'], [12, 'Hotel accommodation'], [12, 'Gardens by the Bay'], [12, 'Marina Bay Sands']
        ];

        for (const inclusion of inclusionsData) {
            await pool.execute(
                'INSERT INTO package_inclusions (package_id, inclusion) VALUES (?, ?)',
                inclusion
            );
        }
        logs.push('✅ Package inclusions inserted successfully');

        // STEP 5: CREATE PERFORMANCE INDEXES
        logs.push('🔍 Creating performance indexes...');
        console.log('🔍 Creating performance indexes...');
        
        try {
            await pool.execute('CREATE INDEX idx_packages_search ON travel_packages(name, destination)');
            logs.push('✅ Search index created');
        } catch (error) {
            logs.push('⚠️ Search index already exists');
        }

        try {
            await pool.execute('CREATE INDEX idx_bookings_user_status ON bookings(user_id, status)');
            logs.push('✅ Booking index created');
        } catch (error) {
            logs.push('⚠️ Booking index already exists');
        }

        // STEP 6: FINAL VERIFICATION
        logs.push('🔍 Verifying setup...');
        console.log('🔍 Verifying setup...');
        
        const [finalPackages] = await pool.execute('SELECT COUNT(*) as count FROM travel_packages');
        const [finalInclusions] = await pool.execute('SELECT COUNT(*) as count FROM package_inclusions');

        const executionTime = Date.now() - startTime;
        logs.push(`🎉 Complete database setup finished in ${executionTime}ms`);
        console.log(`🎉 Complete database setup finished in ${executionTime}ms`);

        res.json({ 
            success: true, 
            message: `🎉 Complete database setup completed successfully!`,
            environment,
            execution_time: `${executionTime}ms`,
            details: {
                tables_created: ['users', 'travel_packages', 'package_inclusions', 'bookings', 'booking_items', 'user_sessions'],
                packages_inserted: finalPackages[0].count,
                inclusions_inserted: finalInclusions[0].count,
                indexes_created: ['idx_packages_search', 'idx_bookings_user_status']
            },
            logs
        });

    } catch (error) {
        const executionTime = Date.now() - startTime;
        logs.push(`❌ Error: ${error.message}`);
        console.error('Complete database setup error:', error);
        
        res.status(500).json({ 
            success: false, 
            error: error.message,
            environment: {
                platform: process.env.RAILWAY_ENVIRONMENT ? 'Railway' : 'Local',
                node_env: process.env.NODE_ENV || 'development'
            },
            execution_time: `${executionTime}ms`,
            logs
        });
    }
});

// Get all packages
app.get('/api/packages', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT 
                p.*,
                GROUP_CONCAT(pi.inclusion) as inclusions
            FROM travel_packages p 
            LEFT JOIN package_inclusions pi ON p.id = pi.package_id
            WHERE p.available = TRUE
            GROUP BY p.id
            ORDER BY p.rating DESC
        `);
        
        const packages = rows.map(pkg => ({
            ...pkg,
            inclusions: pkg.inclusions ? pkg.inclusions.split(',') : []
        }));
        
        res.json({
            success: true,
            packages: packages
        });
        
    } catch (error) {
        console.error('Error fetching packages:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch packages'
        });
    }
});

// Get single package
app.get('/api/packages/:id', async (req, res) => {
    try {
        const packageId = parseInt(req.params.id);
        
        const [packageRows] = await pool.execute(
            'SELECT * FROM travel_packages WHERE id = ? AND available = TRUE', 
            [packageId]
        );
        
        if (packageRows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                error: 'Package not found' 
            });
        }
        
        const [inclusionRows] = await pool.execute(
            'SELECT inclusion FROM package_inclusions WHERE package_id = ?', 
            [packageId]
        );
        
        const packageData = {
            ...packageRows[0],
            inclusions: inclusionRows.map(row => row.inclusion)
        };
        
        res.json({
            success: true,
            package: packageData
        });
        
    } catch (error) {
        console.error('Error fetching package:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch package'
        });
    }
});

// User registration
app.post('/api/auth/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password, phone, address } = req.body;
        
        if (!firstName || !lastName || !email || !password || !phone || !address) {
            return res.status(400).json({ 
                success: false, 
                error: 'All fields are required' 
            });
        }
        
        const [existingUsers] = await pool.execute(
            'SELECT id FROM users WHERE email = ?', 
            [email]
        );
        
        if (existingUsers.length > 0) {
            return res.status(409).json({ 
                success: false, 
                error: 'User already exists' 
            });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const [result] = await pool.execute(
            `INSERT INTO users (firstName, lastName, email, password, phone, address) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [firstName, lastName, email, hashedPassword, phone, address]
        );
        
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            userId: result.insertId
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Registration failed'
        });
    }
});

// User login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                error: 'Email and password required' 
            });
        }
        
        const [users] = await pool.execute(
            'SELECT * FROM users WHERE email = ? AND is_active = TRUE', 
            [email]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid credentials' 
            });
        }
        
        const user = users[0];
        
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid credentials' 
            });
        }
        
        const token = jwt.sign(
            { 
                userId: user.id, 
                email: user.email,
                name: `${user.firstName} ${user.lastName}`
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        const { password: _, ...userWithoutPassword } = user;
        
        res.json({
            success: true,
            message: 'Login successful',
            token: token,
            user: userWithoutPassword
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Login failed'
        });
    }
});

// Get user profile
app.get('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const [users] = await pool.execute(
            'SELECT id, firstName, lastName, email, phone, address, created_at FROM users WHERE id = ?',
            [req.user.userId]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ 
                success: false, 
                error: 'User not found' 
            });
        }
        
        res.json({
            success: true,
            user: users[0]
        });
        
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch profile'
        });
    }
});

// Update user profile
app.put('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const { firstName, lastName, phone, address } = req.body;
        
        await pool.execute(
            'UPDATE users SET firstName = ?, lastName = ?, phone = ?, address = ? WHERE id = ?',
            [firstName, lastName, phone, address, req.user.userId]
        );
        
        res.json({
            success: true,
            message: 'Profile updated successfully'
        });
        
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to update profile'
        });
    }
});

// Get user bookings
app.get('/api/bookings', authenticateToken, async (req, res) => {
    try {
        const [bookings] = await pool.execute(`
            SELECT 
                b.*,
                GROUP_CONCAT(
                    CONCAT(tp.name, '|', tp.destination, '|', bi.quantity, '|', bi.total_price)
                    SEPARATOR ';'
                ) as booking_details
            FROM bookings b
            LEFT JOIN booking_items bi ON b.id = bi.booking_id
            LEFT JOIN travel_packages tp ON bi.package_id = tp.id
            WHERE b.user_id = ?
            GROUP BY b.id
            ORDER BY b.booking_date DESC
        `, [req.user.userId]);
        
        res.json({
            success: true,
            bookings: bookings
        });
        
    } catch (error) {
        console.error('Bookings error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch bookings'
        });
    }
});

// Create booking
app.post('/api/bookings', authenticateToken, async (req, res) => {
    try {
        const { items } = req.body;
        
        if (!items || items.length === 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'Items required' 
            });
        }
        
        let subtotal = 0;
        for (const item of items) {
            const [packages] = await pool.execute(
                'SELECT price FROM travel_packages WHERE id = ?',
                [item.packageId]
            );
            
            if (packages.length > 0) {
                subtotal += packages[0].price * (item.quantity || 1);
            }
        }
        
        const taxAmount = subtotal * 0.10;
        const totalAmount = subtotal + taxAmount;
        
        const bookingRef = 'TRV' + Date.now().toString().slice(-8);
        
        const [result] = await pool.execute(
            `INSERT INTO bookings 
             (user_id, booking_reference, subtotal, tax_amount, total_amount) 
             VALUES (?, ?, ?, ?, ?)`,
            [req.user.userId, bookingRef, subtotal, taxAmount, totalAmount]
        );
        
        res.status(201).json({
            success: true,
            message: 'Booking created',
            bookingId: result.insertId,
            reference: bookingRef
        });
        
    } catch (error) {
        console.error('Booking creation error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to create booking'
        });
    }
});

// Error handling for undefined routes
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        requestedRoute: req.originalUrl,
        method: req.method
    });
});

// Start server
async function startServer() {
    try {
        const dbConnected = await testConnection();
        
        if (!dbConnected) {
            console.error('❌ Database connection failed');
            process.exit(1);
        }
        
        app.listen(PORT, () => {
            console.log('🚀 TravelEase API Server running on port', PORT);
            console.log('📊 Health check: http://localhost:' + PORT + '/api/health');
            console.log('📦 Packages: http://localhost:' + PORT + '/api/packages');
            console.log('🔐 Auth endpoints available');
        });
        
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer();