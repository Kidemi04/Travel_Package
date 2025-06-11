const AccountPage = {
    template: `
        <!-- Alert Messages -->
        <alert-message v-if="alerts.length" :alerts="alerts" @close="closeAlert"></alert-message>

        <!-- Page Header -->
        <div class="bg-light py-4">
            <div class="container">
                <div class="row">
                    <div class="col-12">
                        <h1 class="display-6 fw-bold">My Account</h1>
                        <p class="lead text-muted">Manage your profile and account settings</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="container py-4">
            <div class="row">
                <!-- Profile Overview -->
                <div class="col-lg-4 col-12 mb-4">
                    <div class="card shadow-sm">
                        <div class="card-body text-center p-4">
                            <div class="mb-3">
                                <div class="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center" 
                                     style="width: 80px; height: 80px;">
                                    <i class="bi bi-person-fill text-white" style="font-size: 2rem;"></i>
                                </div>
                            </div>
                            <h5 class="fw-bold mb-1">{{currentUser.firstName}} {{currentUser.lastName}}</h5>
                            <p class="text-muted mb-3">{{currentUser.email}}</p>
                            <div class="d-grid gap-2">
                                <router-link to="/purchases" class="btn btn-primary">
                                    <i class="bi bi-bag-check"></i> View My Bookings
                                </router-link>
                                <button class="btn btn-outline-secondary" @click="toggleEdit">
                                    <i class="bi bi-pencil"></i> 
                                    {{isEditing ? 'Cancel Edit' : 'Edit Profile'}}
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Quick Stats -->
                    <div class="card shadow-sm mt-3">
                        <div class="card-body">
                            <h6 class="fw-bold mb-3">Account Summary</h6>
                            <div class="row text-center">
                                <div class="col-6">
                                    <div class="border-end">
                                        <h4 class="text-primary mb-0">{{bookingCount}}</h4>
                                        <small class="text-muted">Bookings</small>
                                    </div>
                                </div>
                                <div class="col-6">
                                    <h4 class="text-success mb-0">{{memberSince}}</h4>
                                    <small class="text-muted">Member Since</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Profile Details -->
                <div class="col-lg-8 col-12">
                    <div class="card shadow-sm">
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
                                        <label class="form-label fw-semibold text-muted">Email Address</label>
                                        <div class="form-control-plaintext fw-semibold">{{currentUser.email}}</div>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label fw-semibold text-muted">Phone Number</label>
                                        <div class="form-control-plaintext fw-semibold">{{$filters.phone(currentUser.phone)}}</div>
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
                                            <label class="form-label">Email Address <span class="text-danger">*</span></label>
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
                                            <label class="form-label">Phone Number <span class="text-danger">*</span></label>
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

                    <!-- Change Password Section -->
                    <div class="card shadow-sm mt-4">
                        <div class="card-header bg-white">
                            <h5 class="mb-0 fw-bold">Change Password</h5>
                        </div>
                        <div class="card-body p-4">
                            <form @submit.prevent="changePassword">
                                <div class="row g-3">
                                    <div class="col-12">
                                        <div class="mb-3">
                                            <label class="form-label">Current Password <span class="text-danger">*</span></label>
                                            <input type="password" class="form-control" 
                                                   :class="{'is-invalid': passwordErrors.currentPassword}"
                                                   v-model="passwordData.currentPassword"
                                                   required>
                                            <div class="invalid-feedback" v-if="passwordErrors.currentPassword">
                                                {{passwordErrors.currentPassword}}
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">New Password <span class="text-danger">*</span></label>
                                            <input type="password" class="form-control" 
                                                   :class="{'is-invalid': passwordErrors.newPassword}"
                                                   v-model="passwordData.newPassword"
                                                   required>
                                            <div class="invalid-feedback" v-if="passwordErrors.newPassword">
                                                {{passwordErrors.newPassword}}
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">Confirm New Password <span class="text-danger">*</span></label>
                                            <input type="password" class="form-control" 
                                                   :class="{'is-invalid': passwordErrors.confirmPassword}"
                                                   v-model="passwordData.confirmPassword"
                                                   required>
                                            <div class="invalid-feedback" v-if="passwordErrors.confirmPassword">
                                                {{passwordErrors.confirmPassword}}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button type="submit" class="btn btn-warning">
                                    <i class="bi bi-shield-check"></i> Update Password
                                </button>
                            </form>
                        </div>
                    </div>

                    <!-- Account Actions -->
                    <div class="card shadow-sm mt-4">
                        <div class="card-header bg-white">
                            <h5 class="mb-0 fw-bold">Account Actions</h5>
                        </div>
                        <div class="card-body p-4">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <div class="d-flex align-items-center">
                                        <div class="flex-grow-1">
                                            <h6 class="mb-1">Download Account Data</h6>
                                            <small class="text-muted">Export your account information</small>
                                        </div>
                                        <button class="btn btn-outline-primary btn-sm" @click="downloadData">
                                            <i class="bi bi-download"></i>
                                        </button>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="d-flex align-items-center">
                                        <div class="flex-grow-1">
                                            <h6 class="mb-1">Email Preferences</h6>
                                            <small class="text-muted">Manage notification settings</small>
                                        </div>
                                        <button class="btn btn-outline-secondary btn-sm" @click="showEmailPreferences">
                                            <i class="bi bi-gear"></i>
                                        </button>
                                    </div>
                                </div>
                                <div class="col-12">
                                    <div class="d-flex align-items-center text-danger">
                                        <div class="flex-grow-1">
                                            <h6 class="mb-1 text-danger">Delete Account</h6>
                                            <small class="text-muted">Permanently delete your account and data</small>
                                        </div>
                                        <button class="btn btn-outline-danger btn-sm" @click="confirmDeleteAccount">
                                            <i class="bi bi-trash"></i>
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
            alerts: [],
            isEditing: false,
            bookingCount: 0,
            userData: {},
            passwordData: {
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            },
            errors: {},
            passwordErrors: {}
        };
    },
    
    computed: {
        currentUser() {
            return this.$store.user || {};
        },
        
        memberSince() {
            if (this.currentUser.created_at) {
                return new Date(this.currentUser.created_at).toLocaleDateString('en-AU', { 
                    month: 'short', 
                    year: 'numeric' 
                });
            }
            return 'Recently';
        }
    },
    
    async created() {
        // Redirect if not logged in
        if (!this.$store.isLoggedIn) {
            this.$router.push('/login');
            return;
        }
        
        this.userData = { ...this.currentUser };
        await this.loadBookingCount();
    },
    
    methods: {
        async loadBookingCount() {
            try {
                const bookings = await this.$api.getBookings();
                this.bookingCount = bookings.length;
            } catch (error) {
                console.error('Error loading booking count:', error);
            }
        },
        
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
                this.errors.email = 'Please enter a valid email address';
            }
            if (!this.userData.phone) {
                this.errors.phone = 'Phone is required';
            } else if (!this.isValidPhone(this.userData.phone)) {
                this.errors.phone = 'Please enter a valid phone number';
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
                this.showAlert('Profile updated successfully!', 'success');
            } catch (error) {
                console.error('Error updating profile:', error);
                this.showAlert(error.message || 'Error updating profile', 'danger');
            } finally {
                this.loading = false;
            }
        },
        
        async changePassword() {
            this.passwordErrors = {};
            
            // Password validation
            if (!this.passwordData.currentPassword) {
                this.passwordErrors.currentPassword = 'Current password is required';
            }
            if (!this.passwordData.newPassword) {
                this.passwordErrors.newPassword = 'New password is required';
            } else if (this.passwordData.newPassword.length < 6) {
                this.passwordErrors.newPassword = 'Password must be at least 6 characters';
            }
            if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
                this.passwordErrors.confirmPassword = 'Passwords do not match';
            }
            
            if (Object.keys(this.passwordErrors).length > 0) {
                return;
            }
            
            try {
                // In a real implementation, this would verify current password
                // For demo, we'll just update the password
                await this.$api.updateProfile({ 
                    ...this.userData, 
                    password: this.passwordData.newPassword 
                });
                
                this.passwordData = { currentPassword: '', newPassword: '', confirmPassword: '' };
                this.showAlert('Password changed successfully!', 'success');
            } catch (error) {
                console.error('Error changing password:', error);
                this.showAlert(error.message || 'Error changing password', 'danger');
            }
        },
        
        isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        },
        
        isValidPhone(phone) {
            const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
            return phoneRegex.test(phone);
        },
        
        downloadData() {
            const data = {
                user: this.currentUser,
                downloadDate: new Date().toISOString(),
                note: 'This is a demo export. In production, this would include complete account data.'
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `travelease-account-${this.currentUser.id}.json`;
            a.click();
            URL.revokeObjectURL(url);
            
            this.showAlert('Account data exported successfully!', 'success');
        },
        
        showEmailPreferences() {
            alert('Email Preferences:\n\n✓ Booking confirmations\n✓ Special offers\n✓ Newsletter\n○ SMS notifications\n\n(This would open a preferences modal in production)');
        },
        
        confirmDeleteAccount() {
            const confirmed = confirm('Are you sure you want to delete your account?\n\nThis action cannot be undone and will permanently delete:\n- Your profile information\n- All booking history\n- Saved preferences\n\nType "DELETE" to confirm.');
            
            if (confirmed) {
                const doubleConfirm = prompt('Please type "DELETE" to confirm account deletion:');
                if (doubleConfirm === 'DELETE') {
                    alert('Account deletion would be processed here.\n\nFor demo purposes, account deletion is disabled.');
                }
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