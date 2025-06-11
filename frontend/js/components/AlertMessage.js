// Alert Message Component - Standalone File
const AlertMessage = {
    props: {
        alerts: {
            type: Array,
            required: true
        }
    },
    
    emits: ['close'],
    
    template: `
        <div class="alert-container fixed-top p-3" v-if="alerts.length" style="z-index: 1050; pointer-events: none;">
            <div class="alert alert-dismissible fade show shadow-sm" 
                 :class="'alert-' + alert.type" 
                 v-for="(alert, index) in alerts" 
                 :key="alert.id || index"
                 style="pointer-events: auto; margin-bottom: 10px;"
                 role="alert">
                <div class="d-flex align-items-center">
                    <i class="bi me-2" :class="getAlertIcon(alert.type)"></i>
                    <span class="flex-grow-1">{{alert.message}}</span>
                    <button type="button" class="btn-close" @click="$emit('close', index)"></button>
                </div>
            </div>
        </div>
    `,
    
    methods: {
        getAlertIcon(type) {
            switch(type) {
                case 'success': return 'bi-check-circle-fill';
                case 'danger': return 'bi-exclamation-triangle-fill';
                case 'warning': return 'bi-exclamation-circle-fill';
                case 'info': return 'bi-info-circle-fill';
                default: return 'bi-info-circle';
            }
        }
    }
};

// Loading Spinner Component - Standalone File
const LoadingSpinner = {
    props: {
        show: {
            type: Boolean,
            default: false
        },
        message: {
            type: String,
            default: 'Loading...'
        },
        size: {
            type: String,
            default: 'normal', // 'small', 'normal', 'large'
            validator: value => ['small', 'normal', 'large'].includes(value)
        },
        overlay: {
            type: Boolean,
            default: false
        }
    },
    
    template: `
        <div v-if="show">
            <!-- Overlay version -->
            <div v-if="overlay" class="loading-overlay d-flex align-items-center justify-content-center">
                <div class="bg-white rounded p-4 shadow text-center">
                    <div class="spinner-border text-primary" :class="spinnerSizeClass" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-3 mb-0 text-muted" v-if="message">{{message}}</p>
                </div>
            </div>
            
            <!-- Inline version -->
            <div v-else class="text-center py-4">
                <div class="spinner-border text-primary" :class="spinnerSizeClass" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2 text-muted" v-if="message">{{message}}</p>
            </div>
        </div>
    `,
    
    computed: {
        spinnerSizeClass() {
            switch(this.size) {
                case 'small': return 'spinner-border-sm';
                case 'large': return 'spinner-border-lg';
                default: return '';
            }
        }
    }
};

// Form Field Component - Reusable form input
const FormField = {
    props: {
        label: {
            type: String,
            required: true
        },
        type: {
            type: String,
            default: 'text'
        },
        modelValue: {
            required: true
        },
        error: {
            type: String,
            default: ''
        },
        required: {
            type: Boolean,
            default: false
        },
        placeholder: {
            type: String,
            default: ''
        },
        disabled: {
            type: Boolean,
            default: false
        }
    },
    
    emits: ['update:modelValue'],
    
    template: `
        <div class="mb-3">
            <label class="form-label">
                {{label}}
                <span class="text-danger" v-if="required">*</span>
            </label>
            <input 
                :type="type" 
                class="form-control" 
                :class="{'is-invalid': error}"
                :value="modelValue"
                @input="$emit('update:modelValue', $event.target.value)"
                :placeholder="placeholder"
                :required="required"
                :disabled="disabled">
            <div class="invalid-feedback" v-if="error">
                {{error}}
            </div>
        </div>
    `
};

// Pagination Component - For product listing
const PaginationComponent = {
    props: {
        currentPage: {
            type: Number,
            required: true
        },
        totalPages: {
            type: Number,
            required: true
        }
    },
    
    emits: ['page-change'],
    
    template: `
        <nav aria-label="Page navigation" v-if="totalPages > 1">
            <ul class="pagination justify-content-center">
                <li class="page-item" :class="{disabled: currentPage === 1}">
                    <a class="page-link" href="#" @click.prevent="changePage(1)" aria-label="First">
                        <span aria-hidden="true">&laquo;&laquo;</span>
                    </a>
                </li>
                <li class="page-item" :class="{disabled: currentPage === 1}">
                    <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)" aria-label="Previous">
                        <span aria-hidden="true">&laquo;</span>
                    </a>
                </li>
                
                <li class="page-item" 
                    v-for="page in visiblePages" 
                    :key="page"
                    :class="{active: page === currentPage}">
                    <a class="page-link" href="#" @click.prevent="changePage(page)">{{page}}</a>
                </li>
                
                <li class="page-item" :class="{disabled: currentPage === totalPages}">
                    <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)" aria-label="Next">
                        <span aria-hidden="true">&raquo;</span>
                    </a>
                </li>
                <li class="page-item" :class="{disabled: currentPage === totalPages}">
                    <a class="page-link" href="#" @click.prevent="changePage(totalPages)" aria-label="Last">
                        <span aria-hidden="true">&raquo;&raquo;</span>
                    </a>
                </li>
            </ul>
        </nav>
    `,
    
    computed: {
        visiblePages() {
            const pages = [];
            const start = Math.max(1, this.currentPage - 2);
            const end = Math.min(this.totalPages, this.currentPage + 2);
            
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
            
            return pages;
        }
    },
    
    methods: {
        changePage(page) {
            if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
                this.$emit('page-change', page);
            }
        }
    }
};

// Star Rating Component
const StarRating = {
    props: {
        rating: {
            type: Number,
            required: true
        },
        readonly: {
            type: Boolean,
            default: true
        },
        size: {
            type: String,
            default: 'normal' // 'small', 'normal', 'large'
        }
    },
    
    emits: ['rating-change'],
    
    template: `
        <div class="star-rating" :class="'star-rating-' + size">
            <span v-for="star in 5" 
                  :key="star"
                  class="star" 
                  :class="{
                      'star-filled': star <= Math.floor(rating),
                      'star-half': star === Math.ceil(rating) && rating % 1 !== 0,
                      'star-interactive': !readonly
                  }"
                  @click="!readonly && setRating(star)"
                  @mouseover="!readonly && hoverRating(star)"
                  @mouseleave="!readonly && hoverRating(0)">
                ★
            </span>
            <span class="rating-text ms-2" v-if="rating > 0">{{rating.toFixed(1)}}</span>
        </div>
    `,
    
    data() {
        return {
            hoverValue: 0
        };
    },
    
    methods: {
        setRating(value) {
            if (!this.readonly) {
                this.$emit('rating-change', value);
            }
        },
        
        hoverRating(value) {
            if (!this.readonly) {
                this.hoverValue = value;
            }
        }
    }
};

// Price Display Component
const PriceDisplay = {
    props: {
        price: {
            type: Number,
            required: true
        },
        originalPrice: {
            type: Number,
            default: null
        },
        currency: {
            type: String,
            default: 'AUD'
        },
        size: {
            type: String,
            default: 'normal' // 'small', 'normal', 'large'
        }
    },
    
    template: `
        <div class="price-display" :class="'price-' + size">
            <span class="original-price text-decoration-line-through text-muted me-2" 
                  v-if="originalPrice && originalPrice > price">
                {{formatPrice(originalPrice)}}
            </span>
            <span class="current-price fw-bold" 
                  :class="size === 'large' ? 'h4 text-primary' : size === 'small' ? 'small' : 'h6 text-primary'">
                {{formatPrice(price)}}
            </span>
            <span class="savings badge bg-success ms-2" v-if="originalPrice && originalPrice > price">
                Save {{formatPrice(originalPrice - price)}}
            </span>
        </div>
    `,
    
    methods: {
        formatPrice(amount) {
            return new Intl.NumberFormat('en-AU', {
                style: 'currency',
                currency: this.currency
            }).format(amount);
        }
    }
};