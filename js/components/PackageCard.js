const PackageCard = {
    props: {
        package: {
            type: Object,
            required: true
        }
    },
    
    template: `
        <div class="card h-100 package-card">
            <div class="position-relative">
                <img :src="package.image" class="card-img-top" :alt="package.name" 
                     style="height: 200px; object-fit: cover;">
                <span class="badge bg-danger position-absolute top-0 end-0 m-2" 
                      v-if="package.discount_percentage">
                    -{{package.discount_percentage}}%
                </span>
                <span class="badge position-absolute top-0 start-0 m-2" 
                      :class="package.category === 'international' ? 'bg-primary' : 'bg-success'">
                    {{$filters.capitalize(package.category)}}
                </span>
            </div>
            <div class="card-body d-flex flex-column">
                <h5 class="card-title">{{package.name}}</h5>
                <p class="text-muted mb-2">
                    <i class="bi bi-geo-alt"></i> {{package.destination}}
                </p>
                <p class="text-muted mb-2">
                    <i class="bi bi-calendar"></i> {{package.duration}}
                </p>
                <p class="card-text flex-grow-1">{{$filters.truncate(package.description, 80)}}</p>
                
                <!-- Rating -->
                <div class="mb-2" v-if="package.rating">
                    <span class="text-warning">
                        <span v-for="n in Math.floor(package.rating)" :key="'full-' + n">★</span>
                        <span v-if="package.rating % 1 !== 0">☆</span>
                    </span>
                    <small class="text-muted ms-1">({{package.rating}})</small>
                </div>
                
                <!-- Inclusions Preview -->
                <div class="mb-2" v-if="package.inclusions && package.inclusions.length">
                    <small class="text-muted">Includes:</small>
                    <div class="d-flex flex-wrap gap-1 mt-1">
                        <span class="badge bg-light text-dark" 
                              v-for="(inclusion, index) in getInclusionsArray().slice(0, 3)" 
                              :key="index">
                            {{inclusion}}
                        </span>
                        <span class="badge bg-secondary" v-if="getInclusionsArray().length > 3">
                            +{{getInclusionsArray().length - 3}} more
                        </span>
                    </div>
                </div>
                
                <!-- Price Section -->
                <div class="price-section mb-3">
                    <span class="text-decoration-line-through text-muted" 
                          v-if="package.original_price && package.original_price > package.price">
                        {{$filters.currency(package.original_price)}}
                    </span>
                    <span class="h5 text-primary ms-2">{{$filters.currency(package.price)}}</span>
                    <div class="text-muted small" 
                         v-if="package.original_price && package.original_price > package.price">
                        Save {{$filters.currency(package.original_price - package.price)}}
                    </div>
                </div>
                
                <!-- Action Buttons -->
                <div class="d-grid gap-2">
                    <button class="btn btn-primary" 
                            @click="handleAddToCart" 
                            :disabled="!package.available">
                        <i class="bi bi-cart-plus"></i> 
                        {{package.available ? 'Book Now' : 'Unavailable'}}
                    </button>
                    <button class="btn btn-outline-secondary btn-sm" @click="showDetails">
                        <i class="bi bi-info-circle"></i> View Details
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Package Details Modal -->
        <div class="modal fade show d-block" v-if="showModal" style="background: rgba(0,0,0,0.5);">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">{{package.name}}</h5>
                        <button type="button" class="btn-close" @click="closeModal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <img :src="package.image" class="img-fluid rounded mb-3" :alt="package.name">
                            </div>
                            <div class="col-md-6">
                                <h6 class="fw-bold">Destination</h6>
                                <p>{{package.destination}}</p>
                                
                                <h6 class="fw-bold">Duration</h6>
                                <p>{{package.duration}}</p>
                                
                                <h6 class="fw-bold">Rating</h6>
                                <p v-if="package.rating">
                                    <span class="text-warning">
                                        <span v-for="n in Math.floor(package.rating)" :key="'modal-full-' + n">★</span>
                                        <span v-if="package.rating % 1 !== 0">☆</span>
                                    </span>
                                    {{package.rating}}/5
                                </p>
                                <p v-else>Not rated yet</p>
                                
                                <h6 class="fw-bold">Price</h6>
                                <p class="h4 text-primary">{{$filters.currency(package.price)}}</p>
                            </div>
                        </div>
                        
                        <h6 class="fw-bold mt-3">Description</h6>
                        <p>{{package.description}}</p>
                        
                        <h6 class="fw-bold" v-if="getInclusionsArray().length">Package Includes</h6>
                        <ul v-if="getInclusionsArray().length">
                            <li v-for="inclusion in getInclusionsArray()" :key="inclusion">{{inclusion}}</li>
                        </ul>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="closeModal">Close</button>
                        <button type="button" class="btn btn-primary" @click="handleAddToCart" 
                                :disabled="!package.available">
                            <i class="bi bi-cart-plus"></i> Book This Package
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `,
    
    data() {
        return {
            showModal: false
        };
    },
    
    methods: {
        handleAddToCart() {
            this.$emit('add-to-cart', this.package);
            if (this.showModal) {
                this.closeModal();
            }
        },
        
        showDetails() {
            this.showModal = true;
            document.body.style.overflow = 'hidden';
        },
        
        closeModal() {
            this.showModal = false;
            document.body.style.overflow = 'auto';
        },
        
        getInclusionsArray() {
            if (!this.package.inclusions) return [];
            
            // 如果inclusions是字符串（从数据库来的），分割它
            if (typeof this.package.inclusions === 'string') {
                return this.package.inclusions.split(',').map(item => item.trim());
            }
            
            // 如果inclusions是数组，直接返回
            return this.package.inclusions;
        }
    },
    
    mounted() {
        // Close modal on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.showModal) {
                this.closeModal();
            }
        });
    }
};