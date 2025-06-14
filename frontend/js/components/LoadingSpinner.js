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
            default: 'normal'
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