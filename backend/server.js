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
            'https://kidemi04.github.io',  // 你的GitHub Pages域名
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

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'travelease',
    port: process.env.DB_PORT || 3306,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

// Create database connection pool
const pool = mysql.createPool(dbConfig);

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

// Enhanced Database initialization with detailed output
app.get('/api/init-full-database', async (req, res) => {
    const startTime = Date.now();
    const logs = [];
    
    try {
        logs.push('🔄 Starting FULL database initialization...');
        console.log('🔄 Starting FULL database initialization...');
        
        // Environment info
        const environment = {
            platform: process.env.RAILWAY_ENVIRONMENT ? 'Railway' : 'Local',
            node_env: process.env.NODE_ENV || 'development',
            database_host: process.env.DB_HOST || 'localhost',
            timestamp: new Date().toISOString()
        };
        
        logs.push(`📍 Environment: ${environment.platform} (${environment.node_env})`);
        console.log(`📍 Environment: ${environment.platform} (${environment.node_env})`);

        // Check if data already exists
        logs.push('🔍 Checking existing data...');
        console.log('🔍 Checking existing data...');
        
        const [existingPackages] = await pool.execute('SELECT COUNT(*) as count FROM travel_packages');
        const [existingInclusions] = await pool.execute('SELECT COUNT(*) as count FROM package_inclusions');
        
        if (existingPackages[0].count > 0) {
            return res.json({ 
                success: true, 
                message: `Database already initialized with ${existingPackages[0].count} packages and ${existingInclusions[0].count} inclusions. No action needed.`,
                environment,
                execution_time: `${Date.now() - startTime}ms`,
                logs
            });
        }

        // Insert travel packages
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
        console.log('✅ Travel packages inserted successfully');

        // Package inclusions data
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

        // Insert package inclusions
        logs.push('🎯 Inserting package inclusions...');
        console.log('🎯 Inserting package inclusions...');
        
        for (const inclusion of inclusionsData) {
            await pool.execute(
                'INSERT INTO package_inclusions (package_id, inclusion) VALUES (?, ?)',
                inclusion
            );
        }
        logs.push('✅ Package inclusions inserted successfully');
        console.log('✅ Package inclusions inserted successfully');

        // Create views
        logs.push('👁️ Creating database views...');
        console.log('👁️ Creating database views...');
        
        const viewsCreated = [];
        
        try {
            await pool.execute(`
                CREATE VIEW active_packages AS
                SELECT 
                    p.*,
                    GROUP_CONCAT(pi.inclusion) as inclusions
                FROM travel_packages p 
                LEFT JOIN package_inclusions pi ON p.id = pi.package_id
                WHERE p.available = TRUE 
                GROUP BY p.id
                ORDER BY p.rating DESC, p.created_at DESC
            `);
            viewsCreated.push('active_packages');
            logs.push('✅ View "active_packages" created');
        } catch (error) {
            logs.push('⚠️ View "active_packages" already exists or error: ' + error.message);
        }

        try {
            await pool.execute(`
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
                GROUP BY u.id, u.firstName, u.lastName, u.email
            `);
            viewsCreated.push('user_booking_summary');
            logs.push('✅ View "user_booking_summary" created');
        } catch (error) {
            logs.push('⚠️ View "user_booking_summary" already exists or error: ' + error.message);
        }

        // Create indexes
        logs.push('🔍 Creating database indexes...');
        console.log('🔍 Creating database indexes...');
        
        const indexesCreated = [];
        
        try {
            await pool.execute('CREATE INDEX idx_packages_search ON travel_packages(name, destination)');
            indexesCreated.push('idx_packages_search');
            logs.push('✅ Index "idx_packages_search" created');
        } catch (error) {
            logs.push('⚠️ Index "idx_packages_search" already exists: ' + error.message);
        }

        try {
            await pool.execute('CREATE INDEX idx_bookings_user_status ON bookings(user_id, status)');
            indexesCreated.push('idx_bookings_user_status');
            logs.push('✅ Index "idx_bookings_user_status" created');
        } catch (error) {
            logs.push('⚠️ Index "idx_bookings_user_status" already exists: ' + error.message);
        }

        try {
            await pool.execute('CREATE INDEX idx_booking_items_composite ON booking_items(booking_id, package_id)');
            indexesCreated.push('idx_booking_items_composite');
            logs.push('✅ Index "idx_booking_items_composite" created');
        } catch (error) {
            logs.push('⚠️ Index "idx_booking_items_composite" already exists: ' + error.message);
        }

        // Final verification
        logs.push('🔍 Verifying data insertion...');
        console.log('🔍 Verifying data insertion...');
        
        const [finalPackages] = await pool.execute('SELECT COUNT(*) as count FROM travel_packages');
        const [finalInclusions] = await pool.execute('SELECT COUNT(*) as count FROM package_inclusions');

        const executionTime = Date.now() - startTime;
        logs.push(`🎉 Database initialization completed in ${executionTime}ms`);
        console.log(`🎉 Database initialization completed in ${executionTime}ms`);

        res.json({ 
            success: true, 
            message: `🎉 Database initialization completed successfully!`,
            environment,
            execution_time: `${executionTime}ms`,
            details: {
                packages_inserted: finalPackages[0].count,
                inclusions_inserted: finalInclusions[0].count,
                views_created: viewsCreated,
                indexes_created: indexesCreated
            },
            logs
        });

    } catch (error) {
        const executionTime = Date.now() - startTime;
        logs.push(`❌ Error: ${error.message}`);
        console.error('Database initialization error:', error);
        
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