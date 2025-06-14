const ProductsPage = {
    template: `
        <!-- Page Header -->
        <div class="bg-light py-4">
            <div class="container">
                <h1 class="display-6 fw-bold">Travel Packages</h1>
                <p class="lead text-muted">
                    Showing {{filteredPackages.length}} of {{packages.length}} packages
                    <span v-if="selectedCategory !== 'all'"> in {{selectedCategory}} category</span>
                </p>
            </div>
        </div>

        <div class="container py-4">
            <div class="row">
                <!-- Filters Sidebar -->
                <div class="col-lg-3 mb-4">
                    <div class="card sticky-top">
                        <div class="card-body">
                            <h5 class="fw-bold mb-3">Filters</h5>
                            
                            <!-- Search Filter -->
                            <div class="mb-3">
                                <label class="form-label">Search</label>
                                <input type="text" class="form-control" 
                                       placeholder="Search destinations..." 
                                       v-model="searchText"
                                       @input="applyFilters">
                            </div>
                            
                            <!-- Category Filter -->
                            <div class="mb-3">
                                <label class="form-label">Category</label>
                                <div class="d-grid gap-2">
                                    <button type="button" 
                                            class="btn text-start"
                                            :class="selectedCategory === 'all' ? 'btn-primary' : 'btn-outline-primary'"
                                            @click="filterByCategory('all')">
                                        All Packages
                                    </button>
                                    <button type="button" 
                                            class="btn text-start"
                                            :class="selectedCategory === 'domestic' ? 'btn-success' : 'btn-outline-success'"
                                            @click="filterByCategory('domestic')">
                                        Domestic
                                    </button>
                                    <button type="button" 
                                            class="btn text-start"
                                            :class="selectedCategory === 'international' ? 'btn-info' : 'btn-outline-info'"
                                            @click="filterByCategory('international')">
                                        International
                                    </button>
                                </div>
                            </div>
                            
                            <!-- Price Range Filter -->
                            <div class="mb-3">
                                <label class="form-label">Price Range</label>
                                <div class="row g-2">
                                    <div class="col-6">
                                        <input type="number" class="form-control form-control-sm" 
                                               v-model.number="minPrice" 
                                               @input="applyFilters"
                                               placeholder="Min">
                                    </div>
                                    <div class="col-6">
                                        <input type="number" class="form-control form-control-sm" 
                                               v-model.number="maxPrice" 
                                               @input="applyFilters"
                                               placeholder="Max">
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Sort Options -->
                            <div class="mb-3">
                                <label class="form-label">Sort By</label>
                                <select class="form-select" v-model="sortBy" @change="applyFilters">
                                    <option value="name">Name A-Z</option>
                                    <option value="-name">Name Z-A</option>
                                    <option value="price">Price Low-High</option>
                                    <option value="-price">Price High-Low</option>
                                    <option value="-rating">Highest Rated</option>
                                </select>
                            </div>
                            
                            <button class="btn btn-outline-secondary w-100" @click="clearFilters">
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Products Grid -->
                <div class="col-lg-9">
                    <!-- Loading -->
                    <div v-if="loading" class="text-center py-4">
                        <div class="spinner-border text-primary"></div>
                        <p class="mt-2">Loading packages...</p>
                    </div>
                    
                    <!-- No Results -->
                    <div class="text-center py-5" v-if="!loading && !filteredPackages.length">
                        <h3>No packages found</h3>
                        <p class="text-muted">Try adjusting your filters</p>
                        <button class="btn btn-primary" @click="clearFilters">Clear Filters</button>
                    </div>
                    
                    <!-- Products Grid -->
                    <div class="row g-4" v-if="!loading && paginatedPackages.length">
                        <div class="col-xl-4 col-md-6" v-for="pkg in paginatedPackages" :key="pkg.id">
                            <package-card :package="pkg" @add-to-cart="addToCart"></package-card>
                        </div>
                    </div>
                    
                    <!-- Pagination -->
                    <nav aria-label="Page navigation" v-if="totalPages > 1" class="mt-4">
                        <ul class="pagination justify-content-center">
                            <li class="page-item" :class="{disabled: currentPage === 1}">
                                <a class="page-link" href="#" @click.prevent="goToPage(currentPage - 1)">&laquo;</a>
                            </li>
                            <li class="page-item" 
                                v-for="page in visiblePages" :key="page"
                                :class="{active: page === currentPage}">
                                <a class="page-link" href="#" @click.prevent="goToPage(page)">{{page}}</a>
                            </li>
                            <li class="page-item" :class="{disabled: currentPage === totalPages}">
                                <a class="page-link" href="#" @click.prevent="goToPage(currentPage + 1)">&raquo;</a>
                            </li>
                        </ul>
                        
                        <div class="text-center mt-3">
                            <small class="text-muted">
                                Showing {{(currentPage - 1) * itemsPerPage + 1}} to 
                                {{Math.min(currentPage * itemsPerPage, filteredPackages.length)}} 
                                of {{filteredPackages.length}} packages
                            </small>
                        </div>
                    </nav>
                </div>
            </div>
        </div>
    `,
    
    data() {
        return {
            loading: false,
            packages: [],
            filteredPackages: [],
            searchText: '',
            selectedCategory: 'all',
            minPrice: 0,
            maxPrice: 5000,
            sortBy: 'name',
            currentPage: 1,
            itemsPerPage: 6
        };
    },
    
    computed: {
        totalPages() {
            return Math.ceil(this.filteredPackages.length / this.itemsPerPage);
        },
        
        paginatedPackages() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            return this.filteredPackages.slice(start, start + this.itemsPerPage);
        },
        
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
    
    async created() {
        if (this.$route.params.category) {
            this.selectedCategory = this.$route.params.category;
        }
        
        if (this.$route.query.search) {
            this.searchText = this.$route.query.search;
        }
        
        await this.loadPackages();
    },
    
    watch: {
        '$route'() {
            if (this.$route.params.category) {
                this.selectedCategory = this.$route.params.category;
            }
            if (this.$route.query.search) {
                this.searchText = this.$route.query.search;
            }
            this.loadPackages();
        }
    },
    
    methods: {
        async loadPackages() {
            this.loading = true;
            try {
                this.packages = await this.$api.getPackages();
                this.applyFilters();
            } catch (error) {
                console.error('Error loading packages:', error);
                alert('Error loading packages. Please try again.');
            } finally {
                this.loading = false;
            }
        },
        
        applyFilters() {
            let filtered = [...this.packages];
            
            // Search filter
            if (this.searchText) {
                const search = this.searchText.toLowerCase();
                filtered = filtered.filter(pkg => 
                    pkg.name.toLowerCase().includes(search) ||
                    pkg.destination.toLowerCase().includes(search) ||
                    pkg.description.toLowerCase().includes(search)
                );
            }
            
            // Category filter
            if (this.selectedCategory !== 'all') {
                filtered = filtered.filter(pkg => pkg.category === this.selectedCategory);
            }
            
            // Price range filter
            filtered = filtered.filter(pkg => 
                pkg.price >= this.minPrice && pkg.price <= this.maxPrice
            );
            
            // Sort filter - Fixed to handle all data types properly
            filtered.sort((a, b) => {
                const field = this.sortBy.replace('-', '');
                const isDesc = this.sortBy.startsWith('-');
                
                let valueA = a[field];
                let valueB = b[field];
                
                // Convert to numbers for price comparison
                if (field === 'price') {
                    valueA = parseFloat(valueA) || 0;
                    valueB = parseFloat(valueB) || 0;
                }
                
                // Convert to lowercase for string comparison
                if (field === 'name' || field === 'destination') {
                    valueA = String(valueA).toLowerCase();
                    valueB = String(valueB).toLowerCase();
                }
                
                // Ensure rating is treated as number
                if (field === 'rating') {
                    valueA = parseFloat(valueA) || 0;
                    valueB = parseFloat(valueB) || 0;
                }
                
                let comparison = 0;
                if (valueA < valueB) comparison = -1;
                if (valueA > valueB) comparison = 1;
                
                return isDesc ? -comparison : comparison;
            });
            
            this.filteredPackages = filtered;
            this.currentPage = 1;
        },
        
        filterByCategory(category) {
            this.selectedCategory = category;
            this.applyFilters();
        },
        
        clearFilters() {
            this.searchText = '';
            this.selectedCategory = 'all';
            this.minPrice = 0;
            this.maxPrice = 5000;
            this.sortBy = 'name';
            this.applyFilters();
        },
        
        goToPage(page) {
            if (page >= 1 && page <= this.totalPages) {
                this.currentPage = page;
            }
        },
        
        addToCart(pkg) {
            this.$store.addToCart(pkg);
            alert(`${pkg.name} added to cart!`);
        }
    }
};