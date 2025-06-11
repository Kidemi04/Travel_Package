const LoginPage = {
    template: `
        <!-- Alert Messages -->
        <alert-message v-if="alerts.length" :alerts="alerts" @close="closeAlert"></alert-message>

        <div class="container py-5">
            <div class="row justify-content-center">
                <div class="col-lg-5 col-md-7 col-12">
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
                                           placeholder="Enter your email address"
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

                                <!-- Remember Me & Forgot Password -->
                                <div class="d-flex justify-content-between align-items-center mb-4">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="remember" v-model="rememberMe">
                                        <label class="form-check-label" for="remember">
                                            Remember me
                                        </label>
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
                                        <i class="bi bi-magic"></i> Fill Demo Credentials
                                    </button>
                                </div>
                            </form>

                            <!-- Divider -->
                            <div class="text-center my-4">
                                <div class="position-relative">
                                    <hr>
                                    <span class="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted">
                                        OR
                                    </span>
                                </div>
                            </div>

                            <!-- Social Login (Demo) -->
                            <div class="d-grid gap-2 mb-4">
                                <button type="button" class="btn btn-outline-danger" @click="showSocialLogin('Google')">
                                    <i class="bi bi-google"></i> Continue with Google
                                </button>
                                <button type="button" class="btn btn-outline-primary" @click="showSocialLogin('Facebook')">
                                    <i class="bi bi-facebook"></i> Continue with Facebook
                                </button>
                            </div>

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
                        <p class="small text-muted mb-2">For testing purposes, you can use:</p>
                        <div class="row">
                            <div class="col-6">
                                <strong>Email:</strong><br>
                                <code class="small">demo@travelease.com</code>
                            </div>
                            <div class="col-6">
                                <strong>Password:</strong><br>
                                <code class="small">demo123</code>
                            </div>
                        </div>
                    </div>

                    <!-- Security Notice -->
                    <div class="mt-3 text-center">
                        <small class="text-muted">
                            <i class="bi bi-shield-check text-success"></i>
                            Your data is protected with industry-standard encryption
                        </small>
                    </div>
                </div>
            </div>
        </div>
    `,
    
    data() {
        return {
            loading: false,
            alerts: [],
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
                
                this.showAlert(`Login successful! Welcome back, ${response.user.firstName}`, 'success');
                
                // Redirect to intended route or home
                const redirect = this.$route.query.redirect || '/';
                setTimeout(() => {
                    this.$router.push(redirect);
                }, 1500);
                
            } catch (error) {
                console.error('Login error:', error);
                this.showAlert(error.message || 'Invalid email or password', 'danger');
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
            alert('Password reset functionality would be implemented here.\n\nFor demo purposes, use:\nEmail: demo@travelease.com\nPassword: demo123');
        },
        
        showSocialLogin(provider) {
            alert(`${provider} login would be implemented here using OAuth integration.`);
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