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

// Health check
app.get('/', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'TravelEase API is running',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/health', async (req, res) => {
    try {
        const dbConnected = await testConnection();
        res.json({ 
            status: 'OK', 
            message: 'TravelEase API is running',
            database: dbConnected ? 'Connected' : 'Disconnected',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'ERROR', 
            message: 'API health check failed'
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