// Main Vue.js Application - Simplified Version (No Loading Screen)
const { createApp, reactive, computed } = Vue;
const { createRouter, createWebHashHistory } = VueRouter;

// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// Global Store
const store = reactive({
    user: null,
    isLoggedIn: false,
    cartItems: [],
    cartCount: computed(() => store.cartItems.length),
    
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
        const existing = this.cartItems.find(cartItem => cartItem.id === item.id);
        if (existing) {
            existing.quantity += 1;
        } else {
            this.cartItems.push({ ...item, quantity: 1, cartId: Date.now() });
        }
        localStorage.setItem('cart', JSON.stringify(this.cartItems));
    },
    
    updateCartItem(cartId, quantity) {
        const item = this.cartItems.find(item => item.cartId === cartId);
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(cartId);
            } else {
                item.quantity = quantity;
                localStorage.setItem('cart', JSON.stringify(this.cartItems));
            }
        }
    },
    
    removeFromCart(cartId) {
        const index = this.cartItems.findIndex(item => item.cartId === cartId);
        if (index !== -1) {
            this.cartItems.splice(index, 1);
            localStorage.setItem('cart', JSON.stringify(this.cartItems));
        }
    },
    
    clearCart() {
        this.cartItems = [];
        localStorage.removeItem('cart');
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
    setAuthToken(token) {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    },

    async getPackages() {
        try {
            console.log('Fetching packages from:', `${API_BASE_URL}/packages`);
            const response = await axios.get(`${API_BASE_URL}/packages`);
            console.log('API Response:', response.data);
            
            const packages = response.data.packages || response.data || [];
            console.log('Processed packages:', packages);
            
            return packages;
        } catch (error) {
            console.error('API Error:', error);
            
            // Fallback data if API fails
            return [
                {
                    id: 1,
                    name: "Bali Paradise Getaway",
                    destination: "Bali, Indonesia",
                    duration: "7 days",
                    price: 1299,
                    original_price: 1599,
                    description: "Experience the magic of Bali with pristine beaches and temples.",
                    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=300&fit=crop",
                    category: "international",
                    rating: 4.8,
                    available: true,
                    discount_percentage: 19,
                    inclusions: "Round-trip flights,5-star resort,Daily breakfast,Temple tours"
                },
                {
                    id: 2,
                    name: "Sydney Harbour Explorer",
                    destination: "Sydney, Australia",
                    duration: "5 days",
                    price: 899,
                    original_price: 1099,
                    description: "Discover Sydney's iconic landmarks and beautiful harbor.",
                    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
                    category: "domestic",
                    rating: 4.6,
                    available: true,
                    discount_percentage: 18,
                    inclusions: "Hotel accommodation,Harbour cruise,Opera House tour,Bondi Beach"
                },
                {
                    id: 3,
                    name: "Tokyo Cultural Journey",
                    destination: "Tokyo, Japan",
                    duration: "10 days",
                    price: 2299,
                    original_price: 2899,
                    description: "Immerse yourself in Japan's rich culture, from ancient temples to modern technology.",
                    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop",
                    category: "international",
                    rating: 4.9,
                    available: true,
                    discount_percentage: 21,
                    inclusions: "International flights,Traditional ryokan,JR Rail Pass,Cultural workshops"
                }
            ];
        }
    },

    async register(userData) {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
            if (response.data.success) {
                return await this.login(userData.email, userData.password);
            }
            throw new Error(response.data.error || 'Registration failed');
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Registration failed');
        }
    },

    async login(email, password) {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
            if (response.data.success) {
                const { user, token } = response.data;
                localStorage.setItem('token', token);
                this.setAuthToken(token);
                store.setUser(user);
                return response.data;
            }
            throw new Error(response.data.error || 'Login failed');
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Invalid credentials');
        }
    },

    async getProfile() {
        try {
            const response = await axios.get(`${API_BASE_URL}/user/profile`);
            return response.data.user;
        } catch (error) {
            throw new Error('Failed to load profile');
        }
    },

    async updateProfile(userData) {
        try {
            const response = await axios.put(`${API_BASE_URL}/user/profile`, userData);
            if (response.data.success) {
                const updatedUser = { ...store.user, ...userData };
                store.setUser(updatedUser);
                return response.data;
            }
            throw new Error('Failed to update profile');
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to update profile');
        }
    },

    async getBookings() {
        try {
            const response = await axios.get(`${API_BASE_URL}/bookings`);
            return response.data.bookings || [];
        } catch (error) {
            throw new Error('Failed to load bookings');
        }
    },

    async createBooking(bookingData) {
        try {
            const response = await axios.post(`${API_BASE_URL}/bookings`, bookingData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to create booking');
        }
    }
};

// Routes
const routes = [
    { path: '/', component: HomePage },
    { path: '/products', component: ProductsPage },
    { path: '/products/:category', component: ProductsPage },
    { path: '/cart', component: CartPage },
    { path: '/register', component: RegisterPage },
    { path: '/login', component: LoginPage },
    { path: '/account', component: AccountPage },
    { path: '/purchases', component: PurchasesPage }
];

const router = createRouter({
    history: createWebHashHistory(),
    routes
});

// Vue App
const app = createApp({
    data() {
        return { store };
    },
    
    computed: {
        isLoggedIn() { return this.store.isLoggedIn; },
        currentUser() { return this.store.user; },
        cartCount() { return this.store.cartCount; }
    },
    
    methods: {
        logout() {
            api.setAuthToken(null);
            this.store.logout();
            this.$router.push('/');
        }
    },
    
    created() {
        console.log('Vue app created');
        
        // 恢复登录状态
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        
        if (token && savedUser) {
            try {
                api.setAuthToken(token);
                this.store.setUser(JSON.parse(savedUser));
            } catch (error) {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }
        
        // 恢复购物车
        this.store.loadCart();
    },
    
    mounted() {
        console.log('Vue app mounted');
    }
});

// Register components
app.component('PackageCard', PackageCard);
app.component('AlertMessage', AlertMessage);
app.component('LoadingSpinner', LoadingSpinner);

// Global properties
app.config.globalProperties.$api = api;
app.config.globalProperties.$store = store;

// Global filters
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
        return text.length <= length ? text : text.substring(0, length) + '...';
    }
};

// Use router
app.use(router);

// Mount app
console.log('Mounting Vue app...');
const vueApp = app.mount('#app');
console.log('Vue app mounted successfully');