const HomePage = {
    template: `
        <!-- Hero Section -->
        <div class="hero-section bg-primary text-white">
            <div class="container">
                <div class="row align-items-center min-vh-75">
                    <div class="col-lg-6">
                        <h1 class="display-4 fw-bold mb-3">Discover Your Dream Destination</h1>
                        <p class="lead mb-4">Explore the world with our carefully curated travel packages.</p>
                        
                        <!-- Quick Search -->
                        <div class="row g-2 mb-4">
                            <div class="col-8">
                                <input type="text" class="form-control form-control-lg" 
                                       placeholder="Where do you want to go?" 
                                       v-model="searchTerm" 
                                       @keyup.enter="quickSearch"
                                       @input="handleSearchInput">
                            </div>
                            <div class="col-4">
                                <button class="btn btn-warning btn-lg w-100" 
                                        @click="quickSearch"
                                        :disabled="!searchTerm.trim()">
                                    <i class="bi bi-search"></i> Search
                                </button>
                            </div>
                        </div>
                        
                        <div class="d-flex gap-3 flex-wrap">
                            <router-link to="/products" class="btn btn-outline-light btn-lg">
                                Browse All Packages
                            </router-link>
                            <router-link to="/products/international" class="btn btn-outline-light btn-lg">
                                International Tours
                            </router-link>
                        </div>
                    </div>
                    
                    <div class="col-lg-6 d-none d-lg-block">
                        <img src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=400&fit=crop" 
                             class="img-fluid rounded shadow-lg" alt="Travel destination">
                    </div>
                </div>
            </div>
        </div>

        <!-- Stats Section -->
        <div class="stats-section py-5 bg-light">
            <div class="container">
                <div class="row text-center">
                    <div class="col-md-4 mb-4">
                        <h3 class="display-5 fw-bold text-primary">15,000+</h3>
                        <p class="lead">Happy Customers</p>
                    </div>
                    <div class="col-md-4 mb-4">
                        <h3 class="display-5 fw-bold text-success">150+</h3>
                        <p class="lead">Destinations</p>
                    </div>
                    <div class="col-md-4 mb-4">
                        <h3 class="display-5 fw-bold text-warning">98%</h3>
                        <p class="lead">Satisfaction Rate</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Featured Packages -->
        <div class="featured-section py-5">
            <div class="container">
                <div class="text-center mb-5">
                    <h2 class="display-6 fw-bold">Featured Travel Packages</h2>
                    <p class="lead text-muted">Handpicked destinations for unforgettable experiences</p>
                </div>
                
                <div v-if="loading" class="text-center py-4">
                    <div class="spinner-border text-primary"></div>
                    <p class="mt-2">Loading packages...</p>
                </div>
                
                <div class="row g-4" v-if="!loading && featuredPackages.length">
                    <div class="col-lg-4 col-md-6" v-for="pkg in featuredPackages" :key="pkg.id">
                        <package-card :package="pkg" @add-to-cart="addToCart"></package-card>
                    </div>
                </div>
                
                <!-- No packages fallback -->
                <div v-if="!loading && !featuredPackages.length" class="text-center py-4">
                    <p class="text-muted">No featured packages available at the moment.</p>
                    <router-link to="/products" class="btn btn-primary">Browse All Packages</router-link>
                </div>
                
                <div class="text-center mt-5">
                    <router-link to="/products" class="btn btn-primary btn-lg">View All Packages</router-link>
                </div>
            </div>
        </div>

        <!-- Categories -->
        <div class="categories-section py-5 bg-light">
            <div class="container">
                <div class="text-center mb-4">
                    <h2 class="display-6 fw-bold">Explore by Category</h2>
                </div>
                
                <div class="row g-4">
                    <div class="col-md-6">
                        <div class="card h-100 category-card" @click="goToCategory('domestic')">
                            <div class="row g-0 h-100">
                                <div class="col-5">
                                    <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop" 
                                         class="img-fluid h-100 w-100" style="object-fit: cover;" alt="Domestic Travel">
                                </div>
                                <div class="col-7">
                                    <div class="card-body d-flex flex-column justify-content-center">
                                        <h5 class="text-success">Domestic Adventures</h5>
                                        <p class="mb-3">Discover the beauty of Australia</p>
                                        <button class="btn btn-success">Explore</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-6">
                        <div class="card h-100 category-card" @click="goToCategory('international')">
                            <div class="row g-0 h-100">
                                <div class="col-5">
                                    <img src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=300&h=200&fit=crop" 
                                         class="img-fluid h-100 w-100" style="object-fit: cover;" alt="International Travel">
                                </div>
                                <div class="col-7">
                                    <div class="card-body d-flex flex-column justify-content-center">
                                        <h5 class="text-primary">International Escapes</h5>
                                        <p class="mb-3">Experience cultures around the world</p>
                                        <button class="btn btn-primary">Explore</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Call to Action -->
        <div class="cta-section py-5 bg-primary text-white">
            <div class="container text-center">
                <h2 class="display-6 fw-bold mb-3">Ready for Your Next Adventure?</h2>
                <p class="lead mb-4">Join thousands of satisfied travelers</p>
                <div class="d-flex justify-content-center gap-3 flex-wrap">
                    <router-link to="/products" class="btn btn-light btn-lg">Start Planning</router-link>
                    <router-link to="/register" v-if="!$store.isLoggedIn" class="btn btn-outline-light btn-lg">Join TravelEase</router-link>
                </div>
            </div>
        </div>
    `,
    
    data() {
        return {
            searchTerm: '',
            loading: false,
            featuredPackages: []
        };
    },
    
    async created() {
        console.log('HomePage created');
        await this.loadFeaturedPackages();
    },
    
    methods: {
        async loadFeaturedPackages() {
            console.log('Loading featured packages...');
            this.loading = true;
            try {
                const packages = await this.$api.getPackages();
                console.log('Loaded packages:', packages);
                
                this.featuredPackages = packages
                    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                    .slice(0, 3);
                    
                console.log('Featured packages:', this.featuredPackages);
            } catch (error) {
                console.error('Error loading packages:', error);
                this.featuredPackages = [];
            } finally {
                this.loading = false;
            }
        },
        
        addToCart(pkg) {
            console.log('Adding to cart:', pkg);
            this.$store.addToCart(pkg);
            alert(`${pkg.name} added to cart!`);
        },
        
        quickSearch() {
            console.log('Quick search triggered with term:', this.searchTerm);
            if (this.searchTerm.trim()) {
                const searchQuery = encodeURIComponent(this.searchTerm.trim());
                console.log('Navigating to products with search:', searchQuery);
                this.$router.push(`/products?search=${searchQuery}`);
            } else {
                alert('Please enter a search term');
            }
        },
        
        handleSearchInput() {
            console.log('Search input changed:', this.searchTerm);
        },
        
        goToCategory(category) {
            console.log('Going to category:', category);
            this.$router.push(`/products/${category}`);
        }
    }
};