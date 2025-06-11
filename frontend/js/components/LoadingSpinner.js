// LoadingSpinner.js - Standalone Loading Component for Vue.js 3
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
        },
        color: {
            type: String,
            default: 'primary' // Bootstrap color classes
        }
    },
    
    template: `
        <div v-if="show">
            <!-- Overlay version for full-screen loading -->
            <div v-if="overlay" class="loading-overlay d-flex align-items-center justify-content-center">
                <div class="bg-white rounded p-4 shadow-lg text-center" style="min-width: 200px;">
                    <div class="spinner-border" :class="[spinnerColorClass, spinnerSizeClass]" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-3 mb-0 text-muted" v-if="message">{{message}}</p>
                </div>
            </div>
            
            <!-- Inline version for content areas -->
            <div v-else class="text-center py-4">
                <div class="spinner-border" :class="[spinnerColorClass, spinnerSizeClass]" role="status">
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
        },
        
        spinnerColorClass() {
            return `text-${this.color}`;
        }
    },
    
    // Add CSS styles to document if not already present
    mounted() {
        this.addStyles();
    },
    
    methods: {
        addStyles() {
            // Check if styles already exist
            if (document.getElementById('loading-spinner-styles')) {
                return;
            }
            
            // Create and inject CSS styles
            const style = document.createElement('style');
            style.id = 'loading-spinner-styles';
            style.textContent = `
                .loading-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    z-index: 9999;
                    backdrop-filter: blur(2px);
                }
                
                .spinner-border-lg {
                    width: 3rem;
                    height: 3rem;
                }
                
                .loading-dots {
                    display: inline-block;
                }
                
                .loading-dots::after {
                    content: '';
                    animation: dots 1.5s steps(4, end) infinite;
                }
                
                @keyframes dots {
                    0%, 20% { content: ''; }
                    40% { content: '.'; }
                    60% { content: '..'; }
                    80%, 100% { content: '...'; }
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                .custom-spinner {
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #3498db;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                
                .pulse-loader {
                    animation: pulse 1.5s infinite ease-in-out;
                }
                
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `;
            
            document.head.appendChild(style);
        }
    }
};

// Alternative Loading Components for different use cases

// Skeleton Loader Component
const SkeletonLoader = {
    props: {
        rows: {
            type: Number,
            default: 3
        },
        height: {
            type: String,
            default: '20px'
        },
        width: {
            type: String,
            default: '100%'
        }
    },
    
    template: `
        <div class="skeleton-loader">
            <div v-for="n in rows" :key="n" 
                 class="skeleton-item mb-2" 
                 :style="{height: height, width: n === rows ? '70%' : width}">
            </div>
        </div>
    `,
    
    mounted() {
        this.addSkeletonStyles();
    },
    
    methods: {
        addSkeletonStyles() {
            if (document.getElementById('skeleton-loader-styles')) {
                return;
            }
            
            const style = document.createElement('style');
            style.id = 'skeleton-loader-styles';
            style.textContent = `
                .skeleton-item {
                    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                    background-size: 200% 100%;
                    animation: skeleton-loading 1.5s infinite;
                    border-radius: 4px;
                }
                
                @keyframes skeleton-loading {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `;
            
            document.head.appendChild(style);
        }
    }
};

// Dots Loader Component
const DotsLoader = {
    props: {
        size: {
            type: String,
            default: 'normal'
        },
        color: {
            type: String,
            default: 'primary'
        }
    },
    
    template: `
        <div class="dots-loader text-center">
            <div class="dot" :class="dotClasses"></div>
            <div class="dot" :class="dotClasses" style="animation-delay: 0.2s;"></div>
            <div class="dot" :class="dotClasses" style="animation-delay: 0.4s;"></div>
        </div>
    `,
    
    computed: {
        dotClasses() {
            const sizeClass = this.size === 'small' ? 'dot-small' : this.size === 'large' ? 'dot-large' : 'dot-normal';
            const colorClass = `bg-${this.color}`;
            return [sizeClass, colorClass];
        }
    },
    
    mounted() {
        this.addDotsStyles();
    },
    
    methods: {
        addDotsStyles() {
            if (document.getElementById('dots-loader-styles')) {
                return;
            }
            
            const style = document.createElement('style');
            style.id = 'dots-loader-styles';
            style.textContent = `
                .dots-loader {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                }
                
                .dot {
                    border-radius: 50%;
                    animation: dot-bounce 1.4s infinite ease-in-out both;
                }
                
                .dot-small {
                    width: 6px;
                    height: 6px;
                }
                
                .dot-normal {
                    width: 10px;
                    height: 10px;
                }
                
                .dot-large {
                    width: 14px;
                    height: 14px;
                }
                
                @keyframes dot-bounce {
                    0%, 80%, 100% {
                        transform: scale(0);
                        opacity: 0.5;
                    }
                    40% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
            `;
            
            document.head.appendChild(style);
        }
    }
};

// Progress Bar Loader Component
const ProgressLoader = {
    props: {
        progress: {
            type: Number,
            default: 0,
            validator: value => value >= 0 && value <= 100
        },
        indeterminate: {
            type: Boolean,
            default: true
        },
        color: {
            type: String,
            default: 'primary'
        },
        striped: {
            type: Boolean,
            default: false
        },
        animated: {
            type: Boolean,
            default: false
        }
    },
    
    template: `
        <div class="progress-loader">
            <div class="progress" style="height: 6px;">
                <div class="progress-bar" 
                     :class="progressClasses"
                     :style="progressStyle"
                     role="progressbar"
                     :aria-valuenow="indeterminate ? 0 : progress"
                     aria-valuemin="0"
                     aria-valuemax="100">
                </div>
            </div>
        </div>
    `,
    
    computed: {
        progressClasses() {
            let classes = [`bg-${this.color}`];
            
            if (this.indeterminate) {
                classes.push('progress-bar-indeterminate');
            }
            
            if (this.striped) {
                classes.push('progress-bar-striped');
            }
            
            if (this.animated) {
                classes.push('progress-bar-animated');
            }
            
            return classes;
        },
        
        progressStyle() {
            if (this.indeterminate) {
                return { width: '100%' };
            }
            
            return { width: `${this.progress}%` };
        }
    },
    
    mounted() {
        this.addProgressStyles();
    },
    
    methods: {
        addProgressStyles() {
            if (document.getElementById('progress-loader-styles')) {
                return;
            }
            
            const style = document.createElement('style');
            style.id = 'progress-loader-styles';
            style.textContent = `
                .progress-bar-indeterminate {
                    background: linear-gradient(45deg, 
                        rgba(255,255,255,0.15) 25%, 
                        transparent 25%, 
                        transparent 50%, 
                        rgba(255,255,255,0.15) 50%, 
                        rgba(255,255,255,0.15) 75%, 
                        transparent 75%, 
                        transparent);
                    background-size: 1rem 1rem;
                    animation: progress-bar-stripes 1s linear infinite;
                }
                
                @keyframes progress-bar-stripes {
                    0% { background-position: 1rem 0; }
                    100% { background-position: 0 0; }
                }
            `;
            
            document.head.appendChild(style);
        }
    }
};