const RegisterPage = {
    template: `
        <!-- Alert Messages -->
        <alert-message v-if="alerts.length" :alerts="alerts" @close="closeAlert"></alert-message>

        <div class="container py-5">
            <div class="row justify-content-center">
                <div class="col-lg-6 col-md-8 col-12">
                    <div class="card shadow-lg border-0">
                        <div class="card-body p-5">
                            <!-- Header -->
                            <div class="text-center mb-4">
                                <h2 class="fw-bold text-primary">Join TravelEase</h2>
                                <p class="text-muted">Create your account to start booking amazing travel packages</p>
                            </div>

                            <!-- Registration Form -->
                            <form @submit.prevent="register">
                                <div class="row">
                                    <!-- First Name -->
                                    <div class="col-md-6 col-12">
                                        <div class="mb-3">
                                            <label class="form-label">First Name <span class="text-danger">*</span></label>
                                            <input type="text" class="form-control" 
                                                   :class="{'is-invalid': errors.firstName}"
                                                   v-model="registerData.firstName"
                                                   placeholder="Enter your first name"
                                                   required>
                                            <div class="invalid-feedback" v-if="errors.firstName">
                                                {{errors.firstName}}
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Last Name -->
                                    <div class="col-md-6 col-12">
                                        <div class="mb-3">
                                            <label class="form-label">Last Name <span class="text-danger">*</span></label>
                                            <input type="text" class="form-control" 
                                                   :class="{'is-invalid': errors.lastName}"
                                                   v-model="registerData.lastName"
                                                   placeholder="Enter your last name"
                                                   required>
                                            <div class="invalid-feedback" v-if="errors.lastName">
                                                {{errors.lastName}}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Email -->
                                <div class="mb-3">
                                    <label class="form-label">Email Address <span class="text-danger">*</span></label>
                                    <input type="email" class="form-control" 
                                           :class="{'is-invalid': errors.email}"
                                           v-model="registerData.email"
                                           placeholder="Enter your email address"
                                           required>
                                    <div class="invalid-feedback" v-if="errors.email">
                                        {{errors.email}}
                                    </div>
                                </div>

                                <!-- Phone -->
                                <div class="mb-3">
                                    <label class="form-label">Phone Number <span class="text-danger">*</span></label>
                                    <input type="tel" class="form-control" 
                                           :class="{'is-invalid': errors.phone}"
                                           v-model="registerData.phone"
                                           placeholder="e.g., +61 400 123 456"
                                           required>
                                    <div class="invalid-feedback" v-if="errors.phone">
                                        {{errors.phone}}
                                    </div>
                                </div>

                                <!-- Address -->
                                <div class="mb-3">
                                    <label class="form-label">Address <span class="text-danger">*</span></label>
                                    <textarea class="form-control" 
                                              :class="{'is-invalid': errors.address}"
                                              v-model="registerData.address"
                                              rows="3"
                                              placeholder="Enter your full address"
                                              required></textarea>
                                    <div class="invalid-feedback" v-if="errors.address">
                                        {{errors.address}}
                                    </div>
                                </div>

                                <div class="row">
                                    <!-- Password -->
                                    <div class="col-md-6 col-12">
                                        <div class="mb-3">
                                            <label class="form-label">Password <span class="text-danger">*</span></label>
                                            <input type="password" class="form-control" 
                                                   :class="{'is-invalid': errors.password}"
                                                   v-model="registerData.password"
                                                   placeholder="Create a strong password"
                                                   required>
                                            <div class="invalid-feedback" v-if="errors.password">
                                                {{errors.password}}
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Confirm Password -->
                                    <div class="col-md-6 col-12">
                                        <div class="mb-3">
                                            <label class="form-label">Confirm Password <span class="text-danger">*</span></label>
                                            <input type="password" class="form-control" 
                                                   :class="{'is-invalid': errors.confirmPassword}"
                                                   v-model="registerData.confirmPassword"
                                                   placeholder="Confirm your password"
                                                   required>
                                            <div class="invalid-feedback" v-if="errors.confirmPassword">
                                                {{errors.confirmPassword}}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Terms & Conditions -->
                                <div class="mb-4">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="terms" 
                                               v-model="acceptedTerms" required>
                                        <label class="form-check-label" for="terms">
                                            I agree to the <a href="#" class="text-primary" @click.prevent="showTerms">Terms of Service</a> 
                                            and <a href="#" class="text-primary" @click.prevent="showPrivacy">Privacy Policy</a>
                                        </label>
                                    </div>
                                </div>

                                <!-- Submit Button -->
                                <div class="d-grid mb-3">
                                    <button type="submit" class="btn btn-primary btn-lg" :disabled="loading">
                                        <span v-if="!loading">
                                            <i class="bi bi-person-plus"></i> Create Account
                                        </span>
                                        <span v-if="loading">
                                            <span class="spinner-border spinner-border-sm me-2"></span>
                                            Creating Account...
                                        </span>
                                    </button>
                                </div>

                                <!-- Demo Data Button -->
                                <div class="text-center mb-3">
                                    <button type="button" class="btn btn-outline-secondary btn-sm" @click="fillDemoData">
                                        <i class="bi bi-magic"></i> Fill Demo Data
                                    </button>
                                </div>
                            </form>

                            <!-- Switch to Login -->
                            <div class="text-center">
                                <p class="text-muted mb-0">
                                    Already have an account? 
                                    <router-link to="/login" class="text-primary fw-semibold">Sign in here</router-link>
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Benefits Section -->
                    <div class="mt-4 text-center">
                        <h6 class="fw-bold text-muted mb-3">Why Join TravelEase?</h6>
                        <div class="row g-3 text-center">
                            <div class="col-4">
                                <div class="p-3">
                                    <i class="bi bi-percent display-6 text-primary"></i>
                                    <div class="mt-2 small">Exclusive Discounts</div>
                                </div>
                            </div>
                            <div class="col-4">
                                <div class="p-3">
                                    <i class="bi bi-bookmark-heart display-6 text-success"></i>
                                    <div class="mt-2 small">Save Favorites</div>
                                </div>
                            </div>
                            <div class="col-4">
                                <div class="p-3">
                                    <i class="bi bi-headset display-6 text-info"></i>
                                    <div class="mt-2 small">24/7 Support</div>
                                </div>
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
            alerts: [],
            acceptedTerms: false,
            registerData: {
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                confirmPassword: '',
                phone: '',
                address: ''
            },
            errors: {}
        };
    },
    
    created() {
        // Redirect if already logged in
        if (this.$store.isLoggedIn) {
            this.$router.push('/');
        }
    },
    
    methods: {
        // Registration function - creates database tables/storage
        async register() {
            this.errors = {};
            
            // Comprehensive form validation
            if (!this.registerData.firstName) {
                this.errors.firstName = 'First name is required';
            }
            
            if (!this.registerData.lastName) {
                this.errors.lastName = 'Last name is required';
            }
            
            if (!this.registerData.email) {
                this.errors.email = 'Email is required';
            } else if (!this.isValidEmail(this.registerData.email)) {
                this.errors.email = 'Please enter a valid email address';
            }
            
            if (!this.registerData.password) {
                this.errors.password = 'Password is required';
            } else if (this.registerData.password.length < 6) {
                this.errors.password = 'Password must be at least 6 characters long';
            }
            
            if (!this.registerData.confirmPassword) {
                this.errors.confirmPassword = 'Please confirm your password';
            } else if (this.registerData.password !== this.registerData.confirmPassword) {
                this.errors.confirmPassword = 'Passwords do not match';
            }
            
            if (!this.registerData.phone) {
                this.errors.phone = 'Phone number is required';
            } else if (!this.isValidPhone(this.registerData.phone)) {
                this.errors.phone = 'Please enter a valid phone number';
            }
            
            if (!this.registerData.address) {
                this.errors.address = 'Address is required';
            }
            
            if (!this.acceptedTerms) {
                this.showAlert('Please accept the Terms of Service and Privacy Policy', 'warning');
                return;
            }
            
            if (Object.keys(this.errors).length > 0) {
                return;
            }
            
            this.loading = true;
            
            try {
                // Register user via API - stores in MySQL database
                const response = await this.$api.register(this.registerData);
                
                this.showAlert(`Registration successful! Welcome to TravelEase, ${response.user.firstName}`, 'success');
                
                // Redirect to home page
                setTimeout(() => {
                    this.$router.push('/');
                }, 2000);
                
            } catch (error) {
                console.error('Registration error:', error);
                this.showAlert(error.message || 'Registration failed. Please try again.', 'danger');
            } finally {
                this.loading = false;
            }
        },
        
        // Validation helper functions
        isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        },
        
        isValidPhone(phone) {
            const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
            return phoneRegex.test(phone);
        },
        
        fillDemoData() {
            this.registerData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: 'password123',
                confirmPassword: 'password123',
                phone: '+61 400 123 456',
                address: '123 Collins Street, Melbourne VIC 3000'
            };
            this.acceptedTerms = true;
        },
        
        showTerms() {
            alert('Terms of Service:\n\n1. You must be 18+ to use this service\n2. All bookings are subject to availability\n3. Cancellation policies apply\n4. We reserve the right to modify terms\n\n(This is a demo - full terms would be displayed in a modal)');
        },
        
        showPrivacy() {
            alert('Privacy Policy Summary:\n\n- We protect your personal information\n- Data is used only for booking purposes\n- We do not share data with third parties\n- You can request data deletion anytime\n\n(This is a demo - full policy would be displayed in a modal)');
        },
        
        showAlert(message, type) {
            this.alerts.push({ message, type, id: Date.now() });
            setTimeout(() => {
                this.alerts.shift();
            }, 5000);
        },
        
        closeAlert(index) {
            this.alerts.splice(index, 1);
        }
    }
};