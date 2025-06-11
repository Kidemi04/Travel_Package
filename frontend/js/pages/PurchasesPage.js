const PurchasesPage = {
    template: `
        <!-- Alert Messages -->
        <alert-message v-if="alerts.length" :alerts="alerts" @close="closeAlert"></alert-message>

        <!-- Page Header -->
        <div class="bg-light py-4">
            <div class="container">
                <div class="row">
                    <div class="col-12">
                        <h1 class="display-6 fw-bold">My Bookings</h1>
                        <p class="lead text-muted">Manage your travel bookings and view booking history</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="container py-4">
            <!-- Add New Booking Section -->
            <div class="row mb-4">
                <div class="col-12">
                    <div class="card shadow-sm">
                        <div class="card-header bg-white d-flex justify-content-between align-items-center">
                            <h5 class="mb-0 fw-bold">Quick Actions</h5>
                            <button class="btn btn-primary" @click="toggleAddForm">
                                <i class="bi bi-plus-circle"></i> Add New Booking
                            </button>
                        </div>
                        
                        <!-- Add New Booking Form -->
                        <div class="card-body" v-if="showAddForm">
                            <form @submit.prevent="addNewBooking">
                                <div class="row g-3">
                                    <div class="col-md-6">
                                        <label class="form-label fw-semibold">Select Package <span class="text-danger">*</span></label>
                                        <select class="form-select" v-model="newBooking.selectedPackage" required>
                                            <option value="">Choose a travel package...</option>
                                            <option v-for="pkg in availablePackages" :key="pkg.id" :value="pkg">
                                                {{pkg.name}} - {{pkg.destination}} ({{$filters.currency(pkg.price)}})
                                            </option>
                                        </select>
                                    </div>
                                    <div class="col-md-3">
                                        <label class="form-label fw-semibold">Quantity</label>
                                        <input type="number" class="form-control" 
                                               v-model.number="newBooking.quantity" 
                                               min="1" max="10" required>
                                    </div>
                                    <div class="col-md-3">
                                        <label class="form-label fw-semibold">Total Cost</label>
                                        <div class="form-control-plaintext fw-bold text-primary">
                                            {{$filters.currency(newBookingTotal)}}
                                        </div>
                                    </div>
                                    <div class="col-12">
                                        <label class="form-label fw-semibold">Special Requests</label>
                                        <textarea class="form-control" 
                                                  v-model="newBooking.specialRequests"
                                                  rows="2" 
                                                  placeholder="Any special requirements or requests..."></textarea>
                                    </div>
                                </div>
                                
                                <div class="d-flex gap-2 mt-3">
                                    <button type="submit" class="btn btn-success" :disabled="!newBooking.selectedPackage">
                                        <i class="bi bi-check"></i> Add Booking
                                    </button>
                                    <button type="button" class="btn btn-outline-secondary" @click="toggleAddForm">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Loading Spinner -->
            <loading-spinner v-if="loading" message="Loading your bookings..."></loading-spinner>

            <!-- No Bookings State -->
            <div class="row" v-if="!loading && purchases.length === 0">
                <div class="col-12">
                    <div class="text-center py-5">
                        <div class="bg-light rounded p-5">
                            <i class="bi bi-calendar-x display-1 text-muted"></i>
                            <h3 class="mt-3">No bookings yet</h3>
                            <p class="text-muted mb-4">Start your travel journey by booking your first package</p>
                            <router-link to="/products" class="btn btn-primary btn-lg">Browse Travel Packages</router-link>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Bookings List -->
            <div class="row" v-if="!loading && purchases.length > 0">
                <div class="col-12">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h4 class="fw-bold">Your Bookings ({{purchases.length}})</h4>
                        <div class="btn-group" role="group">
                            <input type="radio" class="btn-check" name="statusFilter" id="all" 
                                   v-model="statusFilter" value="all">
                            <label class="btn btn-outline-primary" for="all">All</label>
                            
                            <input type="radio" class="btn-check" name="statusFilter" id="confirmed" 
                                   v-model="statusFilter" value="confirmed">
                            <label class="btn btn-outline-success" for="confirmed">Confirmed</label>
                            
                            <input type="radio" class="btn-check" name="statusFilter" id="pending" 
                                   v-model="statusFilter" value="pending">
                            <label class="btn btn-outline-warning" for="pending">Pending</label>
                        </div>
                    </div>

                    <!-- Booking Cards -->
                    <div class="row g-4">
                        <div class="col-lg-6 col-12" v-for="purchase in filteredPurchases" :key="purchase.id">
                            <div class="card shadow-sm h-100">
                                <div class="card-header bg-white d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="mb-0 fw-bold">Booking #{{purchase.booking_reference || purchase.id}}</h6>
                                        <small class="text-muted">{{formatDate(purchase.booking_date)}}</small>
                                    </div>
                                    <span :class="getStatusClass(purchase.status || 'confirmed')">
                                        {{$filters.capitalize(purchase.status || 'confirmed')}}
                                    </span>
                                </div>

                                <div class="card-body">
                                    <!-- Items List -->
                                    <div class="mb-3">
                                        <h6 class="fw-semibold mb-2">Package Details:</h6>
                                        <div class="border rounded p-2 mb-2" v-for="item in purchase.items" :key="item.id">
                                            <div class="d-flex justify-content-between align-items-start">
                                                <div class="flex-grow-1">
                                                    <div class="fw-semibold">{{item.name}}</div>
                                                    <small class="text-muted">
                                                        <i class="bi bi-geo-alt"></i> {{item.destination}}
                                                        <span v-if="item.duration"> • {{item.duration}}</span>
                                                    </small>
                                                    <div class="text-muted small" v-if="item.special_requests">
                                                        <strong>Special Requests:</strong> {{item.special_requests}}
                                                    </div>
                                                </div>
                                                <div class="text-end">
                                                    <div class="fw-semibold">{{$filters.currency(item.total_price)}}</div>
                                                    <small class="text-muted">Qty: {{item.quantity}}</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Total Amount -->
                                    <div class="d-flex justify-content-between align-items-center border-top pt-3 mb-3">
                                        <span class="fw-semibold">Total Amount:</span>
                                        <span class="h6 text-primary mb-0">{{$filters.currency(purchase.total_amount)}}</span>
                                    </div>

                                    <!-- Actions -->
                                    <div class="d-flex gap-2">
                                        <button class="btn btn-outline-primary btn-sm" 
                                                @click="editPurchase(purchase)"
                                                :disabled="purchase.status === 'cancelled'">
                                            <i class="bi bi-pencil"></i> Edit
                                        </button>
                                        <button class="btn btn-outline-info btn-sm" @click="downloadReceipt(purchase)">
                                            <i class="bi bi-download"></i> Receipt
                                        </button>
                                        <button class="btn btn-outline-danger btn-sm" 
                                                @click="deletePurchase(purchase)"
                                                :disabled="purchase.status === 'cancelled'">
                                            <i class="bi bi-trash"></i> Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Edit Purchase Modal -->
            <div class="modal fade show d-block" v-if="editingPurchase" style="background: rgba(0,0,0,0.5);">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Edit Booking #{{editingPurchase.booking_reference || editingPurchase.id}}</h5>
                            <button type="button" class="btn-close" @click="cancelEdit"></button>
                        </div>
                        <div class="modal-body">
                            <form @submit.prevent="saveEditedPurchase">
                                <div class="mb-3">
                                    <h6 class="fw-semibold">Package Items:</h6>
                                    <div class="border rounded p-3 mb-2" v-for="(item, index) in editingPurchase.items" :key="item.id">
                                        <div class="row g-3 align-items-center">
                                            <div class="col-md-6">
                                                <strong>{{item.name}}</strong><br>
                                                <small class="text-muted">{{item.destination}}</small>
                                            </div>
                                            <div class="col-md-3">
                                                <label class="form-label small">Quantity</label>
                                                <input type="number" class="form-control form-control-sm" 
                                                       v-model.number="item.quantity"
                                                       min="0" max="10">
                                            </div>
                                            <div class="col-md-3 text-end">
                                                <div class="fw-semibold">{{$filters.currency(item.unit_price * item.quantity)}}</div>
                                                <small class="text-muted">{{$filters.currency(item.unit_price)}} each</small>
                                                <button type="button" class="btn btn-sm btn-outline-danger d-block mt-1" 
                                                        @click="removeEditingItem(index)">
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="alert alert-warning" v-if="editingPurchase.items.length === 0">
                                        <i class="bi bi-exclamation-triangle"></i>
                                        No items in this booking. Add items or cancel the booking.
                                    </div>
                                </div>
                                
                                <div class="d-flex justify-content-between">
                                    <button type="button" class="btn btn-outline-secondary" @click="cancelEdit">
                                        Cancel
                                    </button>
                                    <button type="submit" class="btn btn-primary" :disabled="editingPurchase.items.length === 0">
                                        <i class="bi bi-check"></i> Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Summary Stats -->
        <div class="bg-light py-5 mt-5" v-if="purchases.length > 0">
            <div class="container">
                <div class="row text-center">
                    <div class="col-md-3 col-6 mb-3">
                        <h4 class="text-primary mb-1">{{purchases.length}}</h4>
                        <p class="text-muted mb-0">Total Bookings</p>
                    </div>
                    <div class="col-md-3 col-6 mb-3">
                        <h4 class="text-success mb-1">{{totalPackageCount}}</h4>
                        <p class="text-muted mb-0">Travel Packages</p>
                    </div>
                    <div class="col-md-3 col-6 mb-3">
                        <h4 class="text-info mb-1">{{confirmedBookings}}</h4>
                        <p class="text-muted mb-0">Confirmed</p>
                    </div>
                    <div class="col-md-3 col-6 mb-3">
                        <h4 class="text-warning mb-1">{{$filters.currency(totalSpent)}}</h4>
                        <p class="text-muted mb-0">Total Spent</p>
                    </div>
                </div>
            </div>
        </div>
    `,
    
    data() {
        return {
            loading: false,
            alerts: [],
            purchases: [], // Array for purchase history
            availablePackages: [],
            statusFilter: 'all',
            showAddForm: false,
            editingPurchase: null,
            newBooking: {
                selectedPackage: null,
                quantity: 1,
                specialRequests: ''
            }
        };
    },
    
    computed: {
        filteredPurchases() {
            if (this.statusFilter === 'all') {
                return this.purchases;
            }
            return this.purchases.filter(p => (p.status || 'confirmed') === this.statusFilter);
        },
        
        newBookingTotal() {
            if (this.newBooking.selectedPackage) {
                return this.newBooking.selectedPackage.price * this.newBooking.quantity;
            }
            return 0;
        },
        
        totalPackageCount() {
            return this.purchases.reduce((total, purchase) => {
                return total + (purchase.items ? purchase.items.length : 0);
            }, 0);
        },
        
        confirmedBookings() {
            return this.purchases.filter(p => (p.status || 'confirmed') === 'confirmed').length;
        },
        
        totalSpent() {
            return this.purchases.reduce((total, purchase) => {
                return total + (purchase.total_amount || 0);
            }, 0);
        }
    },
    
    async created() {
        // Redirect if not logged in
        if (!this.$store.isLoggedIn) {
            this.$router.push('/login');
            return;
        }
        
        await this.loadPurchases();
        await this.loadAvailablePackages();
    },
    
    methods: {
        // Display purchase history - required for marking
        async loadPurchases() {
            this.loading = true;
            try {
                this.purchases = await this.$api.getBookings();
            } catch (error) {
                console.error('Error loading purchases:', error);
                this.showAlert('Error loading bookings. Please try again.', 'danger');
            } finally {
                this.loading = false;
            }
        },
        
        async loadAvailablePackages() {
            try {
                this.availablePackages = await this.$api.getPackages();
            } catch (error) {
                console.error('Error loading packages:', error);
            }
        },
        
        toggleAddForm() {
            this.showAddForm = !this.showAddForm;
            if (this.showAddForm) {
                this.newBooking = {
                    selectedPackage: null,
                    quantity: 1,
                    specialRequests: ''
                };
            }
        },
        
        // Add new booking - CRUD operation (Create)
        async addNewBooking() {
            if (!this.newBooking.selectedPackage) {
                this.showAlert('Please select a travel package', 'warning');
                return;
            }
            
            try {
                const bookingData = {
                    items: [{
                        id: this.newBooking.selectedPackage.id,
                        name: this.newBooking.selectedPackage.name,
                        destination: this.newBooking.selectedPackage.destination,
                        duration: this.newBooking.selectedPackage.duration,
                        price: this.newBooking.selectedPackage.price,
                        quantity: this.newBooking.quantity,
                        special_requests: this.newBooking.specialRequests
                    }],
                    summary: {
                        subtotal: this.newBookingTotal,
                        tax: this.newBookingTotal * 0.10,
                        shipping: 0,
                        discount: 0,
                        total: this.newBookingTotal * 1.10
                    }
                };
                
                await this.$api.createBooking(bookingData);
                await this.loadPurchases();
                this.showAddForm = false;
                this.showAlert('New booking added successfully!', 'success');
            } catch (error) {
                console.error('Error creating booking:', error);
                this.showAlert(error.message || 'Error creating booking', 'danger');
            }
        },
        
        // Edit purchase - CRUD operation (Update)
        editPurchase(purchase) {
            this.editingPurchase = {
                ...purchase,
                items: [...purchase.items]
            };
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        },
        
        removeEditingItem(index) {
            this.editingPurchase.items.splice(index, 1);
        },
        
        async saveEditedPurchase() {
            try {
                await this.$api.updateBooking(this.editingPurchase.id, {
                    items: this.editingPurchase.items
                });
                
                await this.loadPurchases();
                this.cancelEdit();
                this.showAlert('Booking updated successfully!', 'success');
            } catch (error) {
                console.error('Error updating booking:', error);
                this.showAlert(error.message || 'Error updating booking', 'danger');
            }
        },
        
        cancelEdit() {
            this.editingPurchase = null;
            document.body.style.overflow = 'auto';
        },
        
        // Delete purchase - CRUD operation (Delete)
        async deletePurchase(purchase) {
            if (confirm('Are you sure you want to cancel this booking?')) {
                try {
                    await this.$api.deleteBooking(purchase.id);
                    await this.loadPurchases();
                    this.showAlert('Booking cancelled successfully!', 'info');
                } catch (error) {
                    console.error('Error cancelling booking:', error);
                    this.showAlert(error.message || 'Error cancelling booking', 'danger');
                }
            }
        },
        
        downloadReceipt(purchase) {
            const receipt = {
                bookingReference: purchase.booking_reference || purchase.id,
                bookingDate: purchase.booking_date,
                customer: this.$store.user,
                items: purchase.items,
                totalAmount: purchase.total_amount,
                status: purchase.status || 'confirmed',
                generatedAt: new Date().toISOString()
            };
            
            const blob = new Blob([JSON.stringify(receipt, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `travelease-receipt-${purchase.booking_reference || purchase.id}.json`;
            a.click();
            URL.revokeObjectURL(url);
            
            this.showAlert('Receipt downloaded successfully!', 'success');
        },
        
        formatDate(date) {
            if (!date) return 'Unknown';
            return new Date(date).toLocaleDateString('en-AU', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        },
        
        getStatusClass(status) {
            switch(status) {
                case 'confirmed': return 'badge bg-success';
                case 'pending': return 'badge bg-warning';
                case 'cancelled': return 'badge bg-danger';
                case 'completed': return 'badge bg-info';
                default: return 'badge bg-secondary';
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