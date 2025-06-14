const AlertMessage = {
    props: {
        alerts: {
            type: Array,
            required: true
        }
    },
    
    template: `
        <div class="alert-container fixed-top p-3" v-if="alerts.length" style="z-index: 1050;">
            <div class="alert alert-dismissible fade show" 
                 :class="'alert-' + alert.type" 
                 v-for="(alert, index) in alerts" 
                 :key="alert.id || index"
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