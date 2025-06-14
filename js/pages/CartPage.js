const CartPage = {
    template: `
        <!-- Page Header -->
        <div class="bg-light py-4">
            <div class="container">
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

        <div class="container py-4">
            <!-- Empty Cart -->
            <div class="row" v-if="cartItems.length === 0">
                <div class="col-12">
                    <div class="text-center py-5">
                        <i class="bi bi-cart-x display-1 text-muted"></i>
                        <h3 class="mt-3">Your cart is empty</h3>
                        <p class="text-muted mb-4">Start shopping for amazing travel packages</p>
                        <router-link to="/products" class="btn btn-primary btn-lg">Browse Packages</router-link>
                    </div>
                </div>
            </div>

            <!-- Cart with Items -->
            <div class="row" v-if="cartItems.length > 0">
                <!-- Cart Items -->
                <div class="col-lg-8 mb-4">
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h4 class="mb-0">Cart Items ({{cartItems.length}})</h4>
                            <button class="btn btn-outline-danger btn-sm" @click="clearCart">
                                <i class="bi bi-trash"></i> Clear Cart
                            </button>
                        </div>

                        <div class="card-body p-0">
                            <div class="p-3 border-bottom" v-for="item in cartItems" :key="item.cartId">
                                <div class="row g-3 align-items-center">
                                    <!-- Package Image -->
                                    <div class="col-md-3">
                                        <img :src="item.image" 
                                             class="img-fluid rounded" 
                                             :alt="item.name"
                                             style="height: 80px; object-fit: cover; width: 100%;">
                                    </div>
                                    
                                    <!-- Package Details -->
                                    <div class="col-md-5">
                                        <h6 class="fw-bold">{{item.name}}</h6>
                                        <p class="text-muted small mb-1">
                                            <i class="bi bi-geo-alt"></i> {{item.destination}}
                                        </p>
                                        <p class="text-muted small">
                                            <i class="bi bi-calendar"></i> {{item.duration}}
                                        </p>
                                    </div>
                                    
                                    <!-- Quantity -->
                                    <div class="col-md-2">
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
                                    
                                    <!-- Price and Remove -->
                                    <div class="col-md-2 text-end">
                                        <div class="fw-bold">{{$filters.currency(item.price * item.quantity)}}</div>
                                        <small class="text-muted d-block">{{$filters.currency(item.price)}} each</small>
                                        <button class="btn btn-sm btn-outline-danger mt-1" 
                                                @click="removeItem(item)">
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="card-footer">
                            <router-link to="/products" class="btn btn-outline-primary">
                                <i class="bi bi-arrow-left"></i> Continue Shopping
                            </router-link>
                        </div>
                    </div>
                </div>

                <!-- Order Summary -->
                <div class="col-lg-4">
                    <div class="card sticky-top">
                        <!-- Promo Code -->
                        <div class="card-header">
                            <h6 class="mb-0">Promo Code</h6>
                        </div>
                        <div class="card-body">
                            <div class="input-group mb-2" v-if="!appliedPromo">
                                <input type="text" class="form-control" 
                                       placeholder="Enter promo code" 
                                       v-model="promoCode">
                                <button class="btn btn-outline-primary" @click="applyPromoCode">Apply</button>
                            </div>
                            <div class="alert alert-success d-flex justify-content-between" v-if="appliedPromo">
                                <span>{{promoCode}} Applied ({{Math.round(appliedPromo.discount * 100)}}%)</span>
                                <button class="btn btn-sm btn-outline-danger" @click="removePromoCode">×</button>
                            </div>
                            <small class="text-muted">Try: SAVE10, WELCOME, or STUDENT</small>
                        </div>

                        <!-- Shipping Options -->
                        <div class="card-body border-top">
                            <h6 class="mb-3">Processing Options</h6>
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
                                        <div class="fw-semibold">{{$filters.currency(option.cost)}}</div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <!-- Order Summary -->
                        <div class="card-body border-top">
                            <h6 class="mb-3">Order Summary</h6>
                            
                            <div class="d-flex justify-content-between mb-2">
                                <span>Subtotal</span>
                                <span>{{$filters.currency(cartSummary.subtotal)}}</span>
                            </div>
                            
                            <div class="d-flex justify-content-between mb-2" v-if="cartSummary.discount > 0">
                                <span class="text-success">Discount</span>
                                <span class="text-success">-{{$filters.currency(cartSummary.discount)}}</span>
                            </div>
                            
                            <div class="d-flex justify-content-between mb-2">
                                <span>Processing Fee</span>
                                <span>{{$filters.currency(cartSummary.shipping)}}</span>
                            </div>
                            
                            <div class="d-flex justify-content-between mb-2">
                                <span>GST (10%)</span>
                                <span>{{$filters.currency(cartSummary.tax)}}</span>
                            </div>
                            
                            <hr>
                            
                            <div class="d-flex justify-content-between mb-4">
                                <strong>Total</strong>
                                <strong class="text-primary h5">{{$filters.currency(cartSummary.total)}}</strong>
                            </div>
                            
                            <div class="d-grid">
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
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    
    data() {
        return {
            loading: false,
            promoCode: '',
            appliedPromo: null,
            cartSummary: {
                subtotal: 0,
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
            
            // Apply discount
            if (this.appliedPromo) {
                this.cartSummary.discount = this.cartSummary.subtotal * this.appliedPromo.discount;
            } else {
                this.cartSummary.discount = 0;
            }
            
            const discountedSubtotal = this.cartSummary.subtotal - this.cartSummary.discount;
            
            // Calculate tax (10% GST)
            this.cartSummary.tax = discountedSubtotal * 0.10;
            
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
        },
        
        removeItem(item) {
            this.$store.removeFromCart(item.cartId);
        },
        
        clearCart() {
            if (confirm('Clear all items from cart?')) {
                this.$store.clearCart();
            }
        },
        
        applyPromoCode() {
            const code = this.promoCode.toUpperCase();
            const promo = this.promoCodes[code];
            
            if (!promo) {
                alert('Invalid promo code!');
                return;
            }
            
            if (this.cartSummary.subtotal < promo.minAmount) {
                alert(`Minimum order ${this.$filters.currency(promo.minAmount)} required.`);
                return;
            }
            
            this.appliedPromo = promo;
            this.calculateTotals();
            alert('Promo code applied successfully!');
        },
        
        removePromoCode() {
            this.appliedPromo = null;
            this.promoCode = '';
            this.calculateTotals();
        },
        
        async proceedToCheckout() {
            if (!this.$store.isLoggedIn) {
                alert('Please login to continue.');
                this.$router.push('/login');
                return;
            }
            
            this.loading = true;
            
            try {
                const bookingData = {
                    items: this.cartItems.map(item => ({
                        packageId: item.id,
                        quantity: item.quantity
                    }))
                };
                
                await this.$api.createBooking(bookingData);
                this.$store.clearCart();
                alert('Booking confirmed! Redirecting to your bookings...');
                
                setTimeout(() => {
                    this.$router.push('/purchases');
                }, 1500);
                
            } catch (error) {
                alert('Error processing checkout: ' + error.message);
            } finally {
                this.loading = false;
            }
        }
    }
};