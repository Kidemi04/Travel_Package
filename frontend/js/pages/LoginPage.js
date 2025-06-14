const LoginPage = {
    template: `
        <div class="container py-5">
            <div class="row justify-content-center">
                <div class="col-lg-5 col-md-7">
                    <div class="card shadow-lg border-0">
                        <div class="card-body p-5">
                            <!-- Header -->
                            <div class="text-center mb-4">
                                <h2 class="fw-bold text-primary">Welcome Back</h2>
                                <p class="text-muted">Sign in to your TravelEase account</p>
                            </div>

                            <!-- Login Form -->
                            <form @submit.prevent="login">
                                <!-- Email -->
                                <div class="mb-3">
                                    <label class="form-label">Email Address <span class="text-danger">*</span></label>
                                    <input type="email" class="form-control" 
                                           :class="{'is-invalid': errors.email}"
                                           v-model="loginData.email"
                                           placeholder="Enter your email"
                                           required>
                                    <div class="invalid-feedback" v-if="errors.email">
                                        {{errors.email}}
                                    </div>
                                </div>

                                <!-- Password -->
                                <div class="mb-3">
                                    <label class="form-label">Password <span class="text-danger">*</span></label>
                                    <input type="password" class="form-control" 
                                           :class="{'is-invalid': errors.password}"
                                           v-model="loginData.password"
                                           placeholder="Enter your password"
                                           required>
                                    <div class="invalid-feedback" v-if="errors.password">
                                        {{errors.password}}
                                    </div>
                                </div>

                                <!-- Remember Me -->
                                <div class="d-flex justify-content-between align-items-center mb-4">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="remember" v-model="rememberMe">
                                        <label class="form-check-label" for="remember">Remember me</label>
                                    </div>
                                    <a href="#" class="text-primary small" @click.prevent="showForgotPassword">Forgot password?</a>
                                </div>

                                <!-- Submit Button -->
                                <div class="d-grid mb-3">
                                    <button type="submit" class="btn btn-primary btn-lg" :disabled="loading">
                                        <span v-if="!loading">
                                            <i class="bi bi-box-arrow-in-right"></i> Sign In
                                        </span>
                                        <span v-if="loading">
                                            <span class="spinner-border spinner-border-sm me-2"></span>
                                            Signing In...
                                        </span>
                                    </button>
                                </div>

                                <!-- Demo Credentials -->
                                <div class="text-center mb-3">
                                    <button type="button" class="btn btn-outline-secondary btn-sm" @click="fillDemoData">
                                        <i class="bi bi-magic"></i> Use Demo Account
                                    </button>
                                </div>
                            </form>

                            <!-- Switch to Register -->
                            <div class="text-center">
                                <p class="text-muted mb-0">
                                    Don't have an account? 
                                    <router-link to="/register" class="text-primary fw-semibold">Create one here</router-link>
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Demo Account Info -->
                    <div class="mt-4 p-4 bg-light rounded">
                        <h6 class="fw-bold mb-2">Demo Account</h6>
                        <p class="small text-muted mb-2">For testing:</p>
                        <div class="row">
                            <div class="col-6">
                                <strong>Email:</strong><br>
                                <code>demo@travelease.com</code>
                            </div>
                            <div class="col-6">
                                <strong>Password:</strong><br>
                                <code>demo123</code>
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
            rememberMe: false,
            loginData: {
                email: '',
                password: ''
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
        async login() {
            this.errors = {};
            
            // Form validation - required for marking
            if (!this.loginData.email) {
                this.errors.email = 'Email is required';
            } else if (!this.isValidEmail(this.loginData.email)) {
                this.errors.email = 'Please enter a valid email address';
            }
            
            if (!this.loginData.password) {
                this.errors.password = 'Password is required';
            }
            
            if (Object.keys(this.errors).length > 0) {
                return;
            }
            
            this.loading = true;
            
            try {
                const response = await this.$api.login(this.loginData.email, this.loginData.password);
                alert(`Welcome back, ${response.user.firstName}!`);
                
                // Redirect
                const redirect = this.$route.query.redirect || '/';
                this.$router.push(redirect);
                
            } catch (error) {
                alert('Login failed: ' + error.message);
            } finally {
                this.loading = false;
            }
        },
        
        isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        },
        
        fillDemoData() {
            this.loginData = {
                email: 'demo@travelease.com',
                password: 'demo123'
            };
        },
        
        showForgotPassword() {
            alert('Password reset: For demo, use demo@travelease.com / demo123');
        }
    }
};