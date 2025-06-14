const AccountPage = {
    template: `
        <!-- Page Header -->
        <div class="bg-light py-4">
            <div class="container">
                <h1 class="display-6 fw-bold">My Account</h1>
                <p class="lead text-muted">Manage your profile and account settings</p>
            </div>
        </div>

        <div class="container py-4">
            <div class="row">
                <!-- Profile Overview -->
                <div class="col-lg-4 mb-4">
                    <div class="card">
                        <div class="card-body text-center p-4">
                            <div class="mb-3">
                                <div class="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center" 
                                     style="width: 80px; height: 80px;">
                                    <i class="bi bi-person-fill text-white" style="font-size: 2rem;"></i>
                                </div>
                            </div>
                            <h5 class="fw-bold">{{currentUser.firstName}} {{currentUser.lastName}}</h5>
                            <p class="text-muted mb-3">{{currentUser.email}}</p>
                            <div class="d-grid gap-2">
                                <router-link to="/purchases" class="btn btn-primary">
                                    <i class="bi bi-bag-check"></i> My Bookings
                                </router-link>
                                <button class="btn btn-outline-secondary" @click="toggleEdit">
                                    <i class="bi bi-pencil"></i> 
                                    {{isEditing ? 'Cancel Edit' : 'Edit Profile'}}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Profile Details -->
                <div class="col-lg-8">
                    <div class="card">
                        <div class="card-header bg-white">
                            <div class="d-flex justify-content-between align-items-center">
                                <h5 class="mb-0 fw-bold">Profile Information</h5>
                                <span class="badge bg-success" v-if="!isEditing">
                                    <i class="bi bi-check-circle"></i> Verified
                                </span>
                            </div>
                        </div>

                        <div class="card-body p-4">
                            <!-- View Mode -->
                            <div v-if="!isEditing">
                                <div class="row g-4">
                                    <div class="col-md-6">
                                        <label class="form-label fw-semibold text-muted">First Name</label>
                                        <div class="form-control-plaintext fw-semibold">{{currentUser.firstName}}</div>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label fw-semibold text-muted">Last Name</label>
                                        <div class="form-control-plaintext fw-semibold">{{currentUser.lastName}}</div>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label fw-semibold text-muted">Email</label>
                                        <div class="form-control-plaintext fw-semibold">{{currentUser.email}}</div>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label fw-semibold text-muted">Phone</label>
                                        <div class="form-control-plaintext fw-semibold">{{currentUser.phone}}</div>
                                    </div>
                                    <div class="col-12">
                                        <label class="form-label fw-semibold text-muted">Address</label>
                                        <div class="form-control-plaintext fw-semibold">{{currentUser.address}}</div>
                                    </div>
                                </div>
                            </div>

                            <!-- Edit Mode -->
                            <form v-if="isEditing" @submit.prevent="saveProfile">
                                <div class="row g-3">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">First Name <span class="text-danger">*</span></label>
                                            <input type="text" class="form-control" 
                                                   :class="{'is-invalid': errors.firstName}"
                                                   v-model="userData.firstName"
                                                   required>
                                            <div class="invalid-feedback" v-if="errors.firstName">
                                                {{errors.firstName}}
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">Last Name <span class="text-danger">*</span></label>
                                            <input type="text" class="form-control" 
                                                   :class="{'is-invalid': errors.lastName}"
                                                   v-model="userData.lastName"
                                                   required>
                                            <div class="invalid-feedback" v-if="errors.lastName">
                                                {{errors.lastName}}
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">Email <span class="text-danger">*</span></label>
                                            <input type="email" class="form-control" 
                                                   :class="{'is-invalid': errors.email}"
                                                   v-model="userData.email"
                                                   required>
                                            <div class="invalid-feedback" v-if="errors.email">
                                                {{errors.email}}
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">Phone <span class="text-danger">*</span></label>
                                            <input type="tel" class="form-control" 
                                                   :class="{'is-invalid': errors.phone}"
                                                   v-model="userData.phone"
                                                   required>
                                            <div class="invalid-feedback" v-if="errors.phone">
                                                {{errors.phone}}
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-12">
                                        <div class="mb-3">
                                            <label class="form-label">Address <span class="text-danger">*</span></label>
                                            <textarea class="form-control" 
                                                      :class="{'is-invalid': errors.address}"
                                                      v-model="userData.address"
                                                      rows="3" 
                                                      required></textarea>
                                            <div class="invalid-feedback" v-if="errors.address">
                                                {{errors.address}}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="d-flex gap-2">
                                    <button type="submit" class="btn btn-primary" :disabled="loading">
                                        <span v-if="!loading">
                                            <i class="bi bi-check"></i> Save Changes
                                        </span>
                                        <span v-if="loading">
                                            <span class="spinner-border spinner-border-sm me-2"></span>
                                            Saving...
                                        </span>
                                    </button>
                                    <button type="button" class="btn btn-outline-secondary" @click="toggleEdit">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <!-- Account Actions -->
                    <div class="card mt-4">
                        <div class="card-header bg-white">
                            <h5 class="mb-0 fw-bold">Account Actions</h5>
                        </div>
                        <div class="card-body">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <div class="d-flex align-items-center">
                                        <div class="flex-grow-1">
                                            <h6 class="mb-1">Download Data</h6>
                                            <small class="text-muted">Export your account info</small>
                                        </div>
                                        <button class="btn btn-outline-primary btn-sm" @click="downloadData">
                                            <i class="bi bi-download"></i>
                                        </button>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="d-flex align-items-center">
                                        <div class="flex-grow-1">
                                            <h6 class="mb-1">Support</h6>
                                            <small class="text-muted">Contact customer service</small>
                                        </div>
                                        <button class="btn btn-outline-secondary btn-sm" @click="showSupport">
                                            <i class="bi bi-headset"></i>
                                        </button>
                                    </div>
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
            isEditing: false,
            userData: {},
            errors: {}
        };
    },
    
    computed: {
        currentUser() {
            return this.$store.user || {};
        }
    },
    
    created() {
        // Redirect if not logged in
        if (!this.$store.isLoggedIn) {
            this.$router.push('/login');
            return;
        }
        
        this.userData = { ...this.currentUser };
    },
    
    methods: {
        toggleEdit() {
            if (this.isEditing) {
                this.userData = { ...this.currentUser };
            }
            this.isEditing = !this.isEditing;
            this.errors = {};
        },
        
        // Allow editing user details - required for marking
        async saveProfile() {
            this.errors = {};
            
            // Validation
            if (!this.userData.firstName) {
                this.errors.firstName = 'First name is required';
            }
            if (!this.userData.lastName) {
                this.errors.lastName = 'Last name is required';
            }
            if (!this.userData.email) {
                this.errors.email = 'Email is required';
            } else if (!this.isValidEmail(this.userData.email)) {
                this.errors.email = 'Please enter a valid email';
            }
            if (!this.userData.phone) {
                this.errors.phone = 'Phone is required';
            }
            if (!this.userData.address) {
                this.errors.address = 'Address is required';
            }
            
            if (Object.keys(this.errors).length > 0) {
                return;
            }
            
            this.loading = true;
            
            try {
                await this.$api.updateProfile(this.userData);
                this.isEditing = false;
                alert('Profile updated successfully!');
            } catch (error) {
                alert('Error updating profile: ' + error.message);
            } finally {
                this.loading = false;
            }
        },
        
        isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        },
        
        downloadData() {
            const data = {
                user: this.currentUser,
                downloadDate: new Date().toISOString()
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `travelease-account-${this.currentUser.id}.json`;
            a.click();
            URL.revokeObjectURL(url);
            
            alert('Account data downloaded!');
        },
        
        showSupport() {
            alert('Support Contact:\\n\\nPhone: 1300 TRAVEL\\nEmail: support@travelease.com\\nHours: Mon-Fri 9AM-6PM');
        }
    }
};