const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());

// MySQL Database Configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'travelease',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Routes

// Travel Packages Routes
app.get('/api/packages', async (req, res) => {
    try {
        const { category } = req.query;
        let query = `
            SELECT p.*, GROUP_CONCAT(pi.inclusion) as inclusions 
            FROM travel_packages p 
            LEFT JOIN package_inclusions pi ON p.id = pi.package_id 
            WHERE p.available = true
        `;
        const params = [];

        if (category && category !== 'all') {
            query += ' AND p.category = ?';
            params.push(category);
        }

        query += ' GROUP BY p.id ORDER BY p.rating DESC, p.created_at DESC';

        const [rows] = await pool.execute(query, params);
        
        // Format inclusions as array
        const packages = rows.map(pkg => ({
            ...pkg,
            inclusions: pkg.inclusions ? pkg.inclusions.split(',') : []
        }));

        res.json(packages);
    } catch (error) {
        console.error('Error fetching packages:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/packages/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ error: 'Search query required' });
        }

        const query = `
            SELECT p.*, GROUP_CONCAT(pi.inclusion) as inclusions 
            FROM travel_packages p 
            LEFT JOIN package_inclusions pi ON p.id = pi.package_id 
            WHERE p.available = true 
            AND (p.name LIKE ? OR p.destination LIKE ? OR p.description LIKE ?)
            GROUP BY p.id 
            ORDER BY p.rating DESC
        `;
        
        const searchTerm = `%${q}%`;
        const [rows] = await pool.execute(query, [searchTerm, searchTerm, searchTerm]);
        
        const packages = rows.map(pkg => ({
            ...pkg,
            inclusions: pkg.inclusions ? pkg.inclusions.split(',') : []
        }));

        res.json(packages);
    } catch (error) {
        console.error('Error searching packages:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Authentication Routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password, phone, address } = req.body;

        // Validation
        if (!firstName || !lastName || !email || !password || !phone || !address) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if user exists
        const [existingUsers] = await pool.execute(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const [result] = await pool.execute(
            'INSERT INTO users (firstName, lastName, email, password, phone, address) VALUES (?, ?, ?, ?, ?, ?)',
            [firstName, lastName, email, hashedPassword, phone, address]
        );

        const userId = result.insertId;

        // Generate JWT token
        const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            message: 'User registered successfully',
            user: { id: userId, firstName, lastName, email, phone, address },
            token
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const [users] = await pool.execute(
            'SELECT * FROM users WHERE email = ? AND is_active = true',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = users[0];

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        res.json({
            message: 'Login successful',
            user: userWithoutPassword,
            token
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const [users] = await pool.execute(
            'SELECT id, firstName, lastName, email, phone, address, created_at FROM users WHERE id = ?',
            [req.user.userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user: users[0] });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/auth/profile', authenticateToken, async (req, res) => {
    try {
        const { firstName, lastName, email, phone, address } = req.body;

        await pool.execute(
            'UPDATE users SET firstName = ?, lastName = ?, email = ?, phone = ?, address = ? WHERE id = ?',
            [firstName, lastName, email, phone, address, req.user.userId]
        );

        const [users] = await pool.execute(
            'SELECT id, firstName, lastName, email, phone, address, created_at FROM users WHERE id = ?',
            [req.user.userId]
        );

        res.json({
            message: 'Profile updated successfully',
            user: users[0]
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Bookings Routes
app.get('/api/bookings', authenticateToken, async (req, res) => {
    try {
        const [bookings] = await pool.execute(`
            SELECT b.*, 
                   JSON_ARRAYAGG(
                       JSON_OBJECT(
                           'id', bi.id,
                           'package_id', bi.package_id,
                           'name', tp.name,
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
            WHERE b.user_id = ?
            GROUP BY b.id
            ORDER BY b.booking_date DESC
        `, [req.user.userId]);

        const formattedBookings = bookings.map(booking => ({
            ...booking,
            items: JSON.parse(booking.items || '[]'),
            summary: {
                subtotal: booking.subtotal,
                tax: booking.tax_amount,
                shipping: booking.shipping_cost,
                discount: booking.discount_amount,
                total: booking.total_amount
            }
        }));

        res.json(formattedBookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/bookings', authenticateToken, async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();

        const { items, summary, special_requests } = req.body;
        
        // Generate booking reference
        const bookingRef = 'TRV' + Date.now();

        // Insert booking
        const [bookingResult] = await connection.execute(
            'INSERT INTO bookings (user_id, booking_reference, subtotal, tax_amount, shipping_cost, discount_amount, total_amount, special_requests) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [req.user.userId, bookingRef, summary.subtotal, summary.tax, summary.shipping, summary.discount, summary.total, special_requests]
        );

        const bookingId = bookingResult.insertId;

        // Insert booking items
        for (const item of items) {
            await connection.execute(
                'INSERT INTO booking_items (booking_id, package_id, quantity, unit_price, total_price, special_requests) VALUES (?, ?, ?, ?, ?, ?)',
                [bookingId, item.id, item.quantity, item.price, item.price * item.quantity, item.special_requests]
            );
        }

        await connection.commit();

        res.status(201).json({
            message: 'Booking created successfully',
            bookingId,
            bookingReference: bookingRef
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error creating booking:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        connection.release();
    }
});

app.put('/api/bookings/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { items } = req.body;

        // Verify booking belongs to user
        const [bookings] = await pool.execute(
            'SELECT id FROM bookings WHERE id = ? AND user_id = ?',
            [id, req.user.userId]
        );

        if (bookings.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        // Update booking items (simplified - just update quantities)
        for (const item of items) {
            await pool.execute(
                'UPDATE booking_items SET quantity = ?, total_price = ? WHERE booking_id = ? AND package_id = ?',
                [item.quantity, item.unit_price * item.quantity, id, item.package_id]
            );
        }

        res.json({ message: 'Booking updated successfully' });
    } catch (error) {
        console.error('Error updating booking:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/bookings/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        // Verify booking belongs to user
        const [result] = await pool.execute(
            'UPDATE bookings SET status = "cancelled" WHERE id = ? AND user_id = ?',
            [id, req.user.userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'TravelEase API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`TravelEase API Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
});