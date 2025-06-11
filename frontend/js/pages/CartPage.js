const CartPage = {
    template: `
        <!-- Alert Messages -->
        <alert-message v-if="alerts.length" :alerts="alerts" @close="closeAlert"></alert-message>

        <!-- Page Header -->
        <div class="bg-light py-4">
            <div class="container">
                <div class="row">
                    <div class="col-12">
                        <h1 class="display-6 fw-bold">Shopping Cart</h1>
                        <nav aria-label="breadcrumb">
                            <ol class="breadcrumb">
                                <li class="breadcrumb-item"><router-link to="/">Home</router-link></li>
                                <li class="breadcrumb-item"><router-link to="/products">Packages</router-link></li>
                                <li class="breadcrumb-item active">Cart</li>
                            </ol>
                        </nav>
                    </div>
                </div>
            </div>
        </div>

        <div class="container py-4">
            <!-- Empty Cart State -->
            <div class="row" v-if="cartItems.length === 0">
                <div class="col-12">
                    <div class="text-center py-5">
                        <div class="bg-light rounded p-5">
                            <i class="bi bi-cart-x display-1 text-muted"></i>
                            <h3 class="mt-3">Your cart is empty</h3>
                            <p class="text-muted mb-4">Looks like you haven't added any travel packages yet</p>
                            <router-link to="/products" class="btn btn-primary btn-lg">Browse Packages</router-link>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Cart with Items -->
            <div class="row" v-if="cartItems.length > 0">
                <!-- Cart Items -->
                <div class="col-lg-8 col-12 mb-4">
                    <div class="bg-white rounded shadow-sm">
                        <!-- Cart Header -->
                        <div class="p-4 border-bottom">
                            <div class="d-flex justify-content-between align-items-center">
                                <h4 class="mb-0">Cart Items ({{cartItems.length}})</h4>
                                <button class="btn btn-outline-danger btn-sm" @click="clearCart">
                                    <i class="bi bi-trash"></i> Clear Cart
                                </button>
                            </div>
                        </div>

                        <!-- Cart Items List -->
                        <div class="cart-items">
                            <div class="p-4 border-bottom" v-for="item in cartItems" :key="item.cartId">
                                <div class="row g-3 align-items-center">
                                    <!-- Package Image -->
                                    <div class="col-md-3 col-4">
                                        <img :src="item.image" 
                                             class="img-fluid rounded" 
                                             :alt="item.name"
                                             style="height: 100px; object-fit: cover; width: 100%;">
                                    </div>
                                    
                                    <!-- Package Details -->
                                    <div class="col-md-5 col-8">
                                        <h6 class="fw-bold mb-1">{{item.name}}</h6>
                                        <p class="text-muted small mb-1">
                                            <i class="bi bi-geo-alt"></i> {{item.destination}}
                                        </p>
                                        <p class="text-muted small mb-1">
                                            <i class="bi bi-calendar"></i> {{item.duration}}
                                        </p>
                                        <span class="badge" :class="item.category === 'international' ? 'bg-primary' : 'bg-success'">
                                            {{$filters.capitalize(item.category)}}
                                        </span>
                                    </div>
                                    
                                    <!-- Quantity Controls -->
                                    <div class="col-md-2 col-6">
                                        <label class="form-label small">Quantity</label>
                                        <div class="input-group input-group-sm">
                                            <button class="btn btn-outline-secondary" 
                                                    @click="updateQuantity(item, item.quantity - 1)">-</button>
                                            <input type="number" class="form-control text-center" 
                                                   v-model.number="item.quantity" 
                                                   @change="updateQuantity(item, item.quantity)"
                                                   min="1" max="10">
                                            <button class="btn btn-outline-secondary" 
                                                    @click="updateQuantity(item, item.quantity + 1)">+</button>
                                        </div>
                                    </div>
                                    
                                    <!-- Price and Actions -->
                                    <div class="col-md-2 col-6 text-end">
                                        <div class="mb-2">
                                            <div class="fw-bold">{{$filters.currency(item.price * item.quantity)}}</div>
                                            <small class="text-muted">{{$filters.currency(item.price)}} each</small>
                                        </div>
                                        <button class="btn btn-sm btn-outline-danger" 
                                                @click="removeItem(item)">
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Continue Shopping -->
                        <div class="p-4">
                            <router-link to="/products" class="btn btn-outline-primary">
                                <i class="bi bi-arrow-left"></i> Continue Shopping
                            </router-link>
                        </div>
                    </div>
                </div>

                <!-- Order Summary -->
                <div class="col-lg-4 col-12">
                    <div class="bg-white rounded shadow-sm sticky-top">
                        <!-- Promo Code Section -->
                        <div class="p-4 border-bottom">
                            <h6 class="fw-bold mb-3">Promo Code</h6>
                            <div class="input-group mb-2" v-if="!appliedPromo">
                                <input type="text" class="form-control" 
                                       placeholder="Enter promo code" 
                                       v-model="promoCode">
                                <button class="btn btn-outline-primary" @click="applyPromoCode">Apply</button>
                            </div>
                            <div class="alert alert-success d-flex justify-content-between align-items-center" v-if="appliedPromo">
                                <span>
                                    <i class="bi bi-check-circle"></i> 
                                    {{promoCode}} Applied ({{Math.round(appliedPromo.discount * 100)}}%)
                                </span>
                                <button class="btn btn-sm btn-outline-danger" @click="removePromoCode">
                                    <i class="bi bi-x"></i>
                                </button>
                            </div>
                            <small class="text-muted">
                                Try: SAVE10, WELCOME, or STUDENT
                            </small>
                        </div>

                        <!-- Shipping Options -->
                        <div class="p-4 border-bottom">
                            <h6 class="fw-bold mb-3">Processing Options</h6>
                            <div class="form-check mb-2" v-for="option in shippingOptions" :key="option.id">
                                <input class="form-check-input" type="radio" 
                                       v-model="selectedShipping" 
                                       :value="option"
                                       :id="'shipping_' + option.id">
                                <label class="form-check-label w-100" :for="'shipping_' + option.id">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <div class="fw-semibold">{{option.name}}</div>
                                            <small class="text-muted">{{option.days}}</small>
                                        </div>
                                        <div class="text-end">
                                            <div class="fw-semibold">{{$filters.currency(option.cost)}}</div>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <!-- Order Summary -->
                        <div class="p-4">
                            <h6 class="fw-bold mb-3">Order Summary</h6>
                            
                            <div class="d-flex justify-content-between mb-2">
                                <span>Subtotal ({{cartItems.length}} items)</span>
                                <span>{{$filters.currency(cartSummary.subtotal)}}</span>
                            </div>
                            
                            <div class="d-flex justify-content-between mb-2" v-if="cartSummary.discount > 0">
                                <span class="text-success">Promo Discount</span>
                                <span class="text-success">-{{$filters.currency(cartSummary.discount)}}</span>
                            </div>
                            
                            <div class="d-flex justify-content-between mb-2">
                                <span>Processing Fee</span>
                                <span>{{$filters.currency(cartSummary.shipping)}}</span>
                            </div>
                            
                            <div class="d-flex justify-content-between mb-2">
                                <span>GST ({{Math.round(cartSummary.taxRate * 100)}}%)</span>
                                <span>{{$filters.currency(cartSummary.tax)}}</span>
                            </div>
                            
                            <hr>
                            
                            <div class="d-flex justify-content-between mb-4">
                                <strong>Total</strong>
                                <strong class="text-primary h5">{{$filters.currency(cartSummary.total)}}</strong>
                            </div>
                            
                            <!-- Checkout Button -->
                            <div class="d-grid mb-3">
                                <button class="btn btn-primary btn-lg" 
                                        @click="proceedToCheckout"
                                        :disabled="loading">
                                    <span v-if="!loading">
                                        <i class="bi bi-credit-card"></i> Proceed to Checkout
                                    </span>
                                    <span v-if="loading">
                                        <span class="spinner-border spinner-border-sm me-2"></span>
                                        Processing...
                                    </span>
                                </button>
                            </div>
                            
                            <!-- Security Info -->
                            <div class="text-center">
                                <small class="text-muted">
                                    <i class="bi bi-shield-check"></i> 
                                    Secure checkout protected by SSL encryption
                                </small>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Additional Info -->
                    <div class="mt-4 p-4 bg-light rounded">
                        <h6 class="fw-bold mb-3">Need Help?</h6>
                        <div class="d-flex align-items-center mb-2">
                            <i class="bi bi-telephone text-primary me-2"></i>
                            <span>1300 TRAVEL (872835)</span>
                        </div>
                        <div class="d-flex align-items-center mb-2">
                            <i class="bi bi-envelope text-primary me-2"></i>
                            <span>support@travelease.com</span>
                        </div>
                        <div class="d-flex align-items-center">
                            <i class="bi bi-clock text-primary me-2"></i>
                            <span>Mon-Fri 9AM-6PM AEST</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    
    data() {
        return {
            loading: false,
            alerts: [],
            promoCode: '',
            appliedPromo: null,
            cartSummary: {
                subtotal: 0,
                taxRate: 0.10, // 10% GST
                tax: 0,
                shipping: 0,
                discount: 0,
                total: 0
            },
            shippingOptions: [
                { id: 'standard', name: 'Standard Processing', cost: 0, days: '7-14 days' },
                { id: 'express', name: 'Express Processing', cost: 50, days: '3-5 days' },
                { id: 'priority', name: 'Priority Processing', cost: 100, days: '1-2 days' }
            ],
            selectedShipping: null,
            promoCodes: {
                'SAVE10': { discount: 0.10, minAmount: 1000 },
                'WELCOME': { discount: 0.05, minAmount: 500 },
                'STUDENT': { discount: 0.15, minAmount: 800 }
            }
        };
    },
    
    computed: {
        cartItems() {
            return this.$store.cartItems;
        }
    },
    
    watch: {
        cartItems: {
            handler() {
                this.calculateTotals();
            },
            deep: true
        },
        selectedShipping() {
            this.calculateTotals();
        }
    },
    
    created() {
        this.selectedShipping = this.shippingOptions[0];
        this.calculateTotals();
    },
    
    methods: {
        // Calculate totals including postage - required for marking
        calculateTotals() {
            this.cartSummary.subtotal = this.cartItems.reduce((total, item) => {
                return total + (item.price * item.quantity);
            }, 0);
            
            // Apply promo discount
            if (this.appliedPromo) {
                this.cartSummary.discount = this.cartSummary.subtotal * this.appliedPromo.discount;
            } else {
                this.cartSummary.discount = 0;
            }
            
            const discountedSubtotal = this.cartSummary.subtotal - this.cartSummary.discount;
            
            // Calculate tax on discounted amount
            this.cartSummary.tax = discountedSubtotal * this.cartSummary.taxRate;
            
            // Set shipping cost
            this.cartSummary.shipping = this.selectedShipping ? this.selectedShipping.cost : 0;
            
            // Calculate final total
            this.cartSummary.total = discountedSubtotal + this.cartSummary.tax + this.cartSummary.shipping;
        },
        
        updateQuantity(item, newQuantity) {
            if (newQuantity < 1) {
                this.removeItem(item);
                return;
            }
            
            this.$store.updateCartItem(item.cartId, newQuantity);
            this.showAlert('Quantity updated successfully!', 'success');
        },
        
        removeItem(item) {
            this.$store.removeFromCart(item.cartId);
            this.showAlert('Package removed from cart!', 'info');
        },
        
        clearCart() {
            if (confirm('Are you sure you want to clear your cart?')) {
                this.$store.clearCart();
                this.showAlert('Cart cleared successfully!', 'info');
            }
        },
        
        applyPromoCode() {
            const code = this.promoCode.toUpperCase();
            const promo = this.promoCodes[code];
            
            if (!promo) {
                this.showAlert('Invalid promo code!', 'danger');
                return;
            }
            
            if (this.cartSummary.subtotal < promo.minAmount) {
                this.showAlert(`Minimum order amount of ${this.$filters.currency(promo.minAmount)} required for this promo code.`, 'warning');
                return;
            }
            
            this.appliedPromo = promo;
            this.calculateTotals();
            this.showAlert(`Promo code applied successfully! You saved ${Math.round(promo.discount * 100)}%`, 'success');
        },
        
        removePromoCode() {
            this.appliedPromo = null;
            this.promoCode = '';
            this.calculateTotals();
            this.showAlert('Promo code removed.', 'info');
        },
        
        async proceedToCheckout() {
            if (this.cartItems.length === 0) {
                this.showAlert('Your cart is empty!', 'warning');
                return;
            }
            
            if (!this.$store.isLoggedIn) {
                this.showAlert('Please login to continue with checkout.', 'info');
                this.$router.push('/login');
                return;
            }
            
            this.loading = true;
            
            try {
                // Create booking data
                const bookingData = {
                    items: this.cartItems.map(item => ({
                        id: item.id,
                        name: item.name,
                        destination: item.destination,
                        duration: item.duration,
                        price: item.price,
                        quantity: item.quantity
                    })),
                    summary: {
                        subtotal: this.cartSummary.subtotal,
                        tax: this.cartSummary.tax,
                        shipping: this.cartSummary.shipping,
                        discount: this.cartSummary.discount,
                        total: this.cartSummary.total
                    },
                    shipping: this.selectedShipping,
                    promoCode: this.appliedPromo ? this.promoCode : null
                };
                
                // Submit booking to API
                const response = await this.$api.createBooking(bookingData);
                
                // Clear cart after successful booking
                this.$store.clearCart();
                
                this.showAlert('Booking confirmed successfully! Redirecting to your bookings...', 'success');
                
                setTimeout(() => {
                    this.$router.push('/purchases');
                }, 2000);
                
            } catch (error) {
                console.error('Checkout error:', error);
                this.showAlert(error.message || 'Error processing checkout. Please try again.', 'danger');
            } finally {
                this.loading = false;
            }
        },
        
        showAlert(message, type) {
            this.alerts.push({ message, type, id: Date.now() });
            setTimeout(() => {
                this.alerts.shift();
            }, 4000);
        },
        
        closeAlert(index) {
            this.alerts.splice(index, 1);
        }
    }
};