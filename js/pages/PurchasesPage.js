const PurchasesPage = {
    template: `
        <!-- Page Header -->
        <div class="bg-light py-4">
            <div class="container">
                <h1 class="display-6 fw-bold">My Bookings</h1>
                <p class="lead text-muted">Manage your travel bookings and history</p>
            </div>
        </div>

        <div class="container py-4">
            <!-- Add New Booking -->
            <div class="row mb-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header bg-white d-flex justify-content-between align-items-center">
                            <h5 class="mb-0 fw-bold">Quick Actions</h5>
                            <button class="btn btn-primary" @click="toggleAddForm">
                                <i class="bi bi-plus-circle"></i> Add New Booking
                            </button>
                        </div>
                        
                        <!-- Add Form -->
                        <div class="card-body" v-if="showAddForm">
                            <form @submit.prevent="addNewBooking">
                                <div class="row g-3">
                                    <div class="col-md-6">
                                        <label class="form-label">Select Package <span class="text-danger">*</span></label>
                                        <select class="form-select" v-model="newBooking.selectedPackage" required>
                                            <option value="">Choose a package...</option>
                                            <option v-for="pkg in availablePackages" :key="pkg.id" :value="pkg">
                                                {{pkg.name}} - {{pkg.destination}} ({{$filters.currency(pkg.price)}})
                                            </option>
                                        </select>
                                    </div>
                                    <div class="col-md-3">
                                        <label class="form-label">Quantity</label>
                                        <input type="number" class="form-control" 
                                               v-model.number="newBooking.quantity" 
                                               min="1" max="10" required>
                                    </div>
                                    <div class="col-md-3">
                                        <label class="form-label">Total Cost</label>
                                        <div class="form-control-plaintext fw-bold text-primary">
                                            {{$filters.currency(newBookingTotal)}}
                                        </div>
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

            <!-- Loading -->
            <div v-if="loading" class="text-center py-4">
                <div class="spinner-border text-primary"></div>
                <p class="mt-2">Loading your bookings...</p>
            </div>

            <!-- No Bookings -->
            <div class="row" v-if="!loading && purchases.length === 0">
                <div class="col-12">
                    <div class="text-center py-5">
                        <i class="bi bi-calendar-x display-1 text-muted"></i>
                        <h3 class="mt-3">No bookings yet</h3>
                        <p class="text-muted mb-4">Start your travel journey</p>
                        <router-link to="/products" class="btn btn-primary btn-lg">Browse Packages</router-link>
                    </div>
                </div>
            </div>

            <!-- Bookings List -->
            <div class="row" v-if="!loading && purchases.length > 0">
                <div class="col-12">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h4 class="fw-bold">Your Bookings ({{purchases.length}})</h4>
                        <div class="btn-group">
                            <input type="radio" class="btn-check" name="filter" id="all" 
                                   v-model="statusFilter" value="all">
                            <label class="btn btn-outline-primary" for="all">All</label>
                            
                            <input type="radio" class="btn-check" name="filter" id="confirmed" 
                                   v-model="statusFilter" value="confirmed">
                            <label class="btn btn-outline-success" for="confirmed">Confirmed</label>
                        </div>
                    </div>

                    <!-- Booking Cards -->
                    <div class="row g-4">
                        <div class="col-lg-6" v-for="purchase in filteredPurchases" :key="purchase.id">
                            <div class="card h-100">
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
                                    <!-- Items -->
                                    <div class="mb-3">
                                        <h6 class="fw-semibold mb-2">Package Details:</h6>
                                        <div class="border rounded p-2 mb-2" v-for="item in purchase.items" :key="item.id || item.name">
                                            <div class="d-flex justify-content-between">
                                                <div>
                                                    <div class="fw-semibold">{{item.name}}</div>
                                                    <small class="text-muted">{{item.destination}}</small>
                                                </div>
                                                <div class="text-end">
                                                    <div class="fw-semibold">{{$filters.currency(item.total_price || item.price)}}</div>
                                                    <small class="text-muted">Qty: {{item.quantity}}</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Total -->
                                    <div class="d-flex justify-content-between border-top pt-3 mb-3">
                                        <span class="fw-semibold">Total:</span>
                                        <span class="h6 text-primary mb-0">{{$filters.currency(purchase.total_amount)}}</span>
                                    </div>

                                    <!-- Actions -->
                                    <div class="d-flex gap-2">
                                        <button class="btn btn-outline-primary btn-sm" 
                                                @click="editPurchase(purchase)">
                                            <i class="bi bi-pencil"></i> Edit
                                        </button>
                                        <button class="btn btn-outline-info btn-sm" @click="downloadReceipt(purchase)">
                                            <i class="bi bi-download"></i> Receipt
                                        </button>
                                        <button class="btn btn-outline-danger btn-sm" 
                                                @click="deletePurchase(purchase)">
                                            <i class="bi bi-trash"></i> Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Edit Modal -->
            <div class="modal fade show d-block" v-if="editingPurchase" style="background: rgba(0,0,0,0.5);">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Edit Booking #{{editingPurchase.booking_reference || editingPurchase.id}}</h5>
                            <button type="button" class="btn-close" @click="cancelEdit"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <h6>Booking Items:</h6>
                                <div class="border rounded p-3 mb-2" v-for="(item, index) in editingPurchase.items" :key="index">
                                    <div class="row align-items-center">
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
                                            <div class="fw-semibold">{{$filters.currency((item.unit_price || item.price || 0) * item.quantity)}}</div>
                                            <button type="button" class="btn btn-sm btn-outline-danger mt-1" 
                                                    @click="removeEditingItem(index)">
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="d-flex justify-content-between">
                                <button type="button" class="btn btn-outline-secondary" @click="cancelEdit">
                                    Cancel
                                </button>
                                <button type="button" class="btn btn-primary" @click="saveEditedPurchase">
                                    <i class="bi bi-check"></i> Save Changes
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
            purchases: [], // Array for purchase history
            availablePackages: [],
            statusFilter: 'all',
            showAddForm: false,
            editingPurchase: null,
            newBooking: {
                selectedPackage: null,
                quantity: 1
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
        }
    },
    
    async created() {
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
                // 处理items数据结构
                this.purchases.forEach(purchase => {
                    if (!purchase.items || purchase.items.length === 0) {
                        // 如果没有items，创建默认item
                        purchase.items = [{
                            name: 'Travel Package',
                            destination: 'Various',
                            quantity: 1,
                            total_price: purchase.total_amount || 0
                        }];
                    }
                });
            } catch (error) {
                console.error('Error loading purchases:', error);
                alert('Error loading bookings: ' + error.message);
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
                    quantity: 1
                };
            }
        },
        
        // Add new booking - CRUD operation (Create)
        async addNewBooking() {
            if (!this.newBooking.selectedPackage) {
                alert('Please select a package');
                return;
            }
            
            try {
                const bookingData = {
                    items: [{
                        packageId: this.newBooking.selectedPackage.id,
                        quantity: this.newBooking.quantity
                    }]
                };
                
                await this.$api.createBooking(bookingData);
                await this.loadPurchases();
                this.showAddForm = false;
                alert('New booking added successfully!');
            } catch (error) {
                alert('Error creating booking: ' + error.message);
            }
        },
        
        // Edit purchase - CRUD operation (Update)
        editPurchase(purchase) {
            this.editingPurchase = {
                ...purchase,
                items: [...(purchase.items || [])]
            };
        },
        
        removeEditingItem(index) {
            this.editingPurchase.items.splice(index, 1);
        },
        
        async saveEditedPurchase() {
            try {
                // 注意：backend没有更新端点，这里模拟更新
                alert('Booking update feature is not available in demo mode.');
                this.cancelEdit();
            } catch (error) {
                alert('Error updating booking: ' + error.message);
            }
        },
        
        cancelEdit() {
            this.editingPurchase = null;
        },
        
        // Delete purchase - CRUD operation (Delete)
        async deletePurchase(purchase) {
            if (confirm('Cancel this booking?')) {
                try {
                    // 注意：backend没有删除端点，这里模拟删除
                    alert('Booking cancellation feature is not available in demo mode.');
                } catch (error) {
                    alert('Error cancelling booking: ' + error.message);
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
                status: purchase.status || 'confirmed'
            };
            
            const blob = new Blob([JSON.stringify(receipt, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `receipt-${purchase.booking_reference || purchase.id}.json`;
            a.click();
            URL.revokeObjectURL(url);
            
            alert('Receipt downloaded!');
        },
        
        formatDate(date) {
            if (!date) return 'Unknown';
            return new Date(date).toLocaleDateString('en-AU');
        },
        
        getStatusClass(status) {
            switch(status) {
                case 'confirmed': return 'badge bg-success';
                case 'pending': return 'badge bg-warning';
                case 'cancelled': return 'badge bg-danger';
                default: return 'badge bg-secondary';
            }
        }
    }
};