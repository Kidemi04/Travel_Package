// Main Vue.js Application
const { createApp, ref, reactive, computed } = Vue;
const { createRouter, createWebHashHistory } = VueRouter;

// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// Global State Store
const store = reactive({
    user: null,
    isLoggedIn: false,
    cartItems: [],
    cartCount: computed(() => store.cartItems.length),
    
    // Actions
    setUser(user) {
        this.user = user;
        this.isLoggedIn = !!user;
        localStorage.setItem('user', JSON.stringify(user));
    },
    
    logout() {
        this.user = null;
        this.isLoggedIn = false;
        this.cartItems = [];
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    },
    
    addToCart(item) {
        const existingItem = this.cartItems.find(cartItem => cartItem.id === item.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cartItems.push({ ...item, quantity: 1, cartId: Date.now() });
        }
        this.saveCart();
    },
    
    updateCartItem(cartId, quantity) {
        const item = this.cartItems.find(item => item.cartId === cartId);
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(cartId);
            } else {
                item.quantity = quantity;
                this.saveCart();
            }
        }
    },
    
    removeFromCart(cartId) {
        const index = this.cartItems.findIndex(item => item.cartId === cartId);
        if (index !== -1) {
            this.cartItems.splice(index, 1);
            this.saveCart();
        }
    },
    
    clearCart() {
        this.cartItems = [];
        this.saveCart();
    },
    
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cartItems));
    },
    
    loadCart() {
        const saved = localStorage.getItem('cart');
        if (saved) {
            this.cartItems = JSON.parse(saved);
        }
    }
});

// API Service
const api = {
    // Set auth token for requests
    setAuthToken(token) {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    },

    // Travel Packages
    async getPackages(category = 'all') {
        try {
            const response = await axios.get(`${API_BASE_URL}/packages`, {
                params: { category: category !== 'all' ? category : undefined }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching packages:', error);
            throw error;
        }
    },

    async searchPackages(searchTerm) {
        try {
            const response = await axios.get(`${API_BASE_URL}/packages/search`, {
                params: { q: searchTerm }
            });
            return response.data;
        } catch (error) {
            console.error('Error searching packages:', error);
            throw error;
        }
    },

    // Authentication
    async register(userData) {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    async login(email, password) {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
            const { user, token } = response.data;
            
            // Store token and set auth header
            localStorage.setItem('token', token);
            this.setAuthToken(token);
            store.setUser(user);
            
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    async updateProfile(userData) {
        try {
            const response = await axios.put(`${API_BASE_URL}/auth/profile`, userData);
            store.setUser(response.data.user);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Bookings/Purchases
    async getBookings() {
        try {
            const response = await axios.get(`${API_BASE_URL}/bookings`);
            return response.data;
        } catch (error) {
            console.error('Error fetching bookings:', error);
            throw error;
        }
    },

    async createBooking(bookingData) {
        try {
            const response = await axios.post(`${API_BASE_URL}/bookings`, bookingData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    async updateBooking(bookingId, bookingData) {
        try {
            const response = await axios.put(`${API_BASE_URL}/bookings/${bookingId}`, bookingData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    async deleteBooking(bookingId) {
        try {
            await axios.delete(`${API_BASE_URL}/bookings/${bookingId}`);
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

// Router Configuration
const routes = [
    { path: '/', name: 'Home', component: HomePage },
    { path: '/products', name: 'Products', component: ProductsPage },
    { path: '/products/:category', name: 'ProductsByCategory', component: ProductsPage },
    { path: '/cart', name: 'Cart', component: CartPage },
    { path: '/register', name: 'Register', component: RegisterPage },
    { path: '/login', name: 'Login', component: LoginPage },
    { 
        path: '/account', 
        name: 'Account', 
        component: AccountPage,
        beforeEnter: (to, from, next) => {
            if (!store.isLoggedIn) {
                next('/login');
            } else {
                next();
            }
        }
    },
    { 
        path: '/purchases', 
        name: 'Purchases', 
        component: PurchasesPage,
        beforeEnter: (to, from, next) => {
            if (!store.isLoggedIn) {
                next('/login');
            } else {
                next();
            }
        }
    }
];

const router = createRouter({
    history: createWebHashHistory(),
    routes
});

// Vue App Configuration
const app = createApp({
    data() {
        return {
            store
        };
    },
    
    computed: {
        isLoggedIn() {
            return this.store.isLoggedIn;
        },
        currentUser() {
            return this.store.user;
        },
        cartCount() {
            return this.store.cartCount;
        }
    },
    
    methods: {
        logout() {
            api.setAuthToken(null);
            this.store.logout();
            this.$router.push('/');
        }
    },
    
    async created() {
        // Initialize auth token if exists
        const token = localStorage.getItem('token');
        if (token) {
            api.setAuthToken(token);
            
            // Try to get user info from token
            try {
                const response = await axios.get(`${API_BASE_URL}/auth/me`);
                this.store.setUser(response.data.user);
            } catch (error) {
                // Token invalid, clear it
                localStorage.removeItem('token');
                api.setAuthToken(null);
            }
        }
        
        // Load cart from localStorage
        this.store.loadCart();
    }
});

// Global Properties
app.config.globalProperties.$api = api;
app.config.globalProperties.$store = store;

// Global Filters
app.config.globalProperties.$filters = {
    currency(value) {
        return new Intl.NumberFormat('en-AU', {
            style: 'currency',
            currency: 'AUD'
        }).format(value);
    },
    
    capitalize(value) {
        if (!value) return '';
        return value.charAt(0).toUpperCase() + value.slice(1);
    },
    
    truncate(text, length = 100) {
        if (!text) return '';
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    },
    
    phone(phoneNumber) {
        if (!phoneNumber) return '';
        const cleaned = phoneNumber.replace(/\D/g, '');
        if (cleaned.startsWith('61')) {
            return `+61 ${cleaned.substring(2, 3)} ${cleaned.substring(3, 7)} ${cleaned.substring(7)}`;
        } else if (cleaned.startsWith('0')) {
            return `${cleaned.substring(0, 4)} ${cleaned.substring(4, 7)} ${cleaned.substring(7)}`;
        }
        return phoneNumber;
    }
};

// Mount the app
app.use(router);
app.mount('#app');