const HomePage = {
    template: `
        <!-- Hero Section -->
        <div class="hero-section bg-primary text-white">
            <div class="container-fluid">
                <div class="row align-items-center min-vh-75">
                    <div class="col-lg-6 col-md-8 col-12">
                        <div class="hero-content p-4">
                            <h1 class="display-4 fw-bold mb-3">Discover Your Dream Destination</h1>
                            <p class="lead mb-4">Explore the world with our carefully curated travel packages. From tropical paradises to bustling cities, your adventure starts here.</p>
                            
                            <!-- Quick Search -->
                            <div class="row g-2 mb-4">
                                <div class="col-8">
                                    <input type="text" class="form-control form-control-lg" 
                                           placeholder="Where do you want to go?" 
                                           v-model="searchTerm" 
                                           @keyup.enter="quickSearch">
                                </div>
                                <div class="col-4">
                                    <button class="btn btn-warning btn-lg w-100" @click="quickSearch">
                                        <i class="bi bi-search"></i> Search
                                    </button>
                                </div>
                            </div>
                            
                            <div class="row g-3">
                                <div class="col-auto">
                                    <router-link to="/products" class="btn btn-light btn-lg">Browse All Packages</router-link>
                                </div>
                                <div class="col-auto">
                                    <router-link to="/products/international" class="btn btn-outline-light btn-lg">International Tours</router-link>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-lg-6 d-none d-lg-block">
                        <div class="hero-image text-center">
                            <img src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=400&fit=crop" 
                                 class="img-fluid rounded shadow-lg" alt="Travel destination">
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Stats Section -->
        <div class="stats-section py-5 bg-light">
            <div class="container">
                <div class="row text-center">
                    <div class="col-md-4 col-sm-6 col-12 mb-4">
                        <div class="stat-item">
                            <h3 class="display-5 fw-bold text-primary">{{stats.customers.toLocaleString()}}</h3>
                            <p class="lead">Happy Customers</p>
                        </div>
                    </div>
                    <div class="col-md-4 col-sm-6 col-12 mb-4">
                        <div class="stat-item">
                            <h3 class="display-5 fw-bold text-success">{{stats.destinations}}+</h3>
                            <p class="lead">Destinations</p>
                        </div>
                    </div>
                    <div class="col-md-4 col-12 mb-4">
                        <div class="stat-item">
                            <h3 class="display-5 fw-bold text-warning">{{stats.satisfaction}}%</h3>
                            <p class="lead">Satisfaction Rate</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Featured Packages Section -->
        <div class="featured-section py-5">
            <div class="container">
                <div class="row mb-5">
                    <div class="col-12 text-center">
                        <h2 class="display-6 fw-bold">Featured Travel Packages</h2>
                        <p class="lead text-muted">Handpicked destinations for unforgettable experiences</p>
                    </div>
                </div>
                
                <loading-spinner v-if="loading" message="Loading featured packages..."></loading-spinner>
                
                <div class="row g-4" v-if="!loading">
                    <div class="col-lg-4 col-md-6 col-12" v-for="pkg in featuredPackages" :key="pkg.id">
                        <package-card :package="pkg" @add-to-cart="addToCart"></package-card>
                    </div>
                </div>
                
                <div class="row mt-5">
                    <div class="col-12 text-center">
                        <router-link to="/products" class="btn btn-primary btn-lg">View All Packages</router-link>
                    </div>
                </div>
            </div>
        </div>

        <!-- Categories Section -->
        <div class="categories-section py-5 bg-light">
            <div class="container">
                <div class="row mb-4">
                    <div class="col-12 text-center">
                        <h2 class="display-6 fw-bold">Explore by Category</h2>
                        <p class="lead text-muted">Find the perfect trip for your style</p>
                    </div>
                </div>
                
                <div class="row g-4">
                    <div class="col-md-6 col-12">
                        <div class="category-card bg-white rounded shadow-sm overflow-hidden h-100">
                            <div class="row g-0 h-100">
                                <div class="col-5">
                                    <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop" 
                                         class="img-fluid h-100 w-100" style="object-fit: cover;" alt="Domestic Travel">
                                </div>
                                <div class="col-7">
                                    <div class="card-body h-100 d-flex flex-column justify-content-center">
                                        <h5 class="card-title text-success">Domestic Adventures</h5>
                                        <p class="card-text">Discover the beauty of Australia with our local travel packages.</p>
                                        <router-link to="/products/domestic" class="btn btn-success">Explore Local</router-link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-6 col-12">
                        <div class="category-card bg-white rounded shadow-sm overflow-hidden h-100">
                            <div class="row g-0 h-100">
                                <div class="col-5">
                                    <img src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=300&h=200&fit=crop" 
                                         class="img-fluid h-100 w-100" style="object-fit: cover;" alt="International Travel">
                                </div>
                                <div class="col-7">
                                    <div class="card-body h-100 d-flex flex-column justify-content-center">
                                        <h5 class="card-title text-primary">International Escapes</h5>
                                        <p class="card-text">Experience cultures around the world with our international tours.</p>
                                        <router-link to="/products/international" class="btn btn-primary">Go Global</router-link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Testimonials Section -->
        <div class="testimonials-section py-5">
            <div class="container">
                <div class="row mb-5">
                    <div class="col-12 text-center">
                        <h2 class="display-6 fw-bold">What Our Customers Say</h2>
                        <p class="lead text-muted">Real experiences from real travelers</p>
                    </div>
                </div>
                
                <div class="row g-4">
                    <div class="col-lg-4 col-md-6 col-12" v-for="testimonial in testimonials" :key="testimonial.name">
                        <div class="testimonial-card bg-white rounded shadow-sm p-4 h-100">
                            <div class="d-flex align-items-center mb-3">
                                <img :src="testimonial.image" 
                                     class="rounded-circle me-3" 
                                     width="50" height="50" 
                                     :alt="testimonial.name">
                                <div>
                                    <h6 class="mb-0">{{testimonial.name}}</h6>
                                    <small class="text-muted">{{testimonial.location}}</small>
                                </div>
                            </div>
                            <div class="text-warning mb-2">
                                <span v-for="n in testimonial.rating" :key="n">★</span>
                            </div>
                            <p class="mt-3 mb-0">"{{testimonial.text}}"</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Call to Action -->
        <div class="cta-section py-5 bg-primary text-white">
            <div class="container">
                <div class="row justify-content-center text-center">
                    <div class="col-lg-8 col-12">
                        <h2 class="display-6 fw-bold mb-3">Ready for Your Next Adventure?</h2>
                        <p class="lead mb-4">Join thousands of satisfied travelers who have booked with TravelEase</p>
                        <div class="row justify-content-center g-3">
                            <div class="col-auto">
                                <router-link to="/products" class="btn btn-light btn-lg">Start Planning</router-link>
                            </div>
                            <div class="col-auto" v-if="!$store.isLoggedIn">
                                <router-link to="/register" class="btn btn-outline-light btn-lg">Join TravelEase</router-link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    
    data() {
        return {
            searchTerm: '',
            loading: false,
            featuredPackages: [],
            stats: {
                customers: 15000,
                destinations: 150,
                satisfaction: 98
            },
            testimonials: [
                {
                    name: "Sarah Johnson",
                    location: "Melbourne",
                    rating: 5,
                    text: "Amazing experience! The Bali package exceeded all expectations.",
                    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
                },
                {
                    name: "Michael Chen",
                    location: "Sydney", 
                    rating: 5,
                    text: "Professional service and incredible destinations. Highly recommended!",
                    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
                },
                {
                    name: "Emma Wilson",
                    location: "Brisbane",
                    rating: 5,
                    text: "The European tour was perfectly organized. Every detail was taken care of.",
                    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
                }
            ]
        };
    },
    
    async created() {
        await this.loadFeaturedPackages();
    },
    
    methods: {
        async loadFeaturedPackages() {
            this.loading = true;
            try {
                const packages = await this.$api.getPackages();
                // Get top 3 rated packages for featured section
                this.featuredPackages = packages
                    .sort((a, b) => b.rating - a.rating)
                    .slice(0, 3);
            } catch (error) {
                console.error('Error loading featured packages:', error);
                // Fallback to mock data if API fails
                this.featuredPackages = [
                    {
                        id: 1,
                        name: "Bali Paradise Getaway",
                        destination: "Bali, Indonesia",
                        duration: "7 days",
                        price: 1299,
                        originalPrice: 1599,
                        description: "Experience the magic of Bali with pristine beaches, ancient temples, and vibrant culture.",
                        image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=300&fit=crop",
                        category: "international",
                        rating: 4.8,
                        available: true,
                        discount: 19
                    }
                ];
            } finally {
                this.loading = false;
            }
        },
        
        addToCart(pkg) {
            this.$store.addToCart(pkg);
            // Show success message (you could implement a toast notification)
            alert(`${pkg.name} added to cart!`);
        },
        
        quickSearch() {
            if (this.searchTerm.trim()) {
                this.$router.push(`/products?search=${encodeURIComponent(this.searchTerm)}`);
            }
        }
    }
};