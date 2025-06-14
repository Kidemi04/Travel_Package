# TravelEase - Vue.js Travel Booking Application

## 📋 Project Information

- **Student:** Kelvin Fong Wen Kiong (102782287)
- **Email:** fongkelvin04@gmail.com
- **GitHub:** Kidemi04
- **Course:** COS30043 - Interface Design and Development
- **Institution:** Swinburne University of Technology

## 🌐 Live Deployment

- **Frontend:** [Deployment URL - GitHub Pages]
- **Backend:** [Deployment URL - Railway/Heroku]
- **Repository:** https://github.com/Kidemi04/travelease

## 📖 Overview

Full-stack travel booking application built with Vue.js 3, Node.js, and MySQL. Demonstrates modern web development practices and fulfils all COS30043 assessment requirements.

## ✅ Assessment Requirements

### Required Pages (7)
1. **Main Page** - Landing page with featured packages and search
2. **Product Page** - Package catalogue with pagination and filtering
3. **Shopping Cart** - Booking system with price calculations
4. **Registration** - User account creation with validation
5. **Login** - Authentication with JWT tokens
6. **My Account** - Profile management and editing
7. **My Purchases** - Booking history with CRUD operations

### Technical Implementation
- **Context View Grouping:** Bootstrap grid system (rows/columns)
- **Arrays Usage:** Product lists, cart items, booking records
- **Directives:** v-for, v-if, v-model for dynamic rendering
- **Filters:** Currency, text truncation, date formatting
- **Pagination:** Client-side with navigation controls
- **JSON Data:** RESTful API integration
- **Database:** MySQL with Users, Packages, Bookings tables
- **Form Validation:** Client and server-side validation

## 🛠️ Technology Stack

**Frontend:** Vue.js 3, Vue Router, Bootstrap 5, Axios  
**Backend:** Node.js, Express.js, MySQL, JWT, bcrypt  
**Tools:** VS Code, Git, MySQL Workbench

## 📁 Project Structure

```
travelease/
├── frontend/
│   ├── index.html
│   ├── css/custom.css
│   └── js/
│       ├── app.js
│       ├── components/
│       └── pages/
├── backend/
│   ├── server.js
│   ├── database.sql
│   └── package.json
└── README.md
```

## 🚀 Quick Setup

### Backend
```bash
cd backend
npm install
mysql -u root -p < database.sql
npm start  # Runs on http://localhost:3000
```

### Frontend
```bash
cd frontend
python -m http.server 8080  # Or use Live Server
```

## 🔐 Demo Account

- **Email:** demo@travelease.com
- **Password:** demo123

## 🎨 Key Features

- **Responsive Design:** Mobile-first approach with Bootstrap
- **Authentication:** Secure JWT-based login system
- **Shopping Cart:** Full e-commerce functionality with calculations
- **Search & Filter:** Advanced package filtering and sorting
- **CRUD Operations:** Complete booking management
- **Modern UI:** Clean design with gradients and animations

## 📊 Database Schema

- **Users:** Authentication and profile data
- **Travel Packages:** Package details and pricing
- **Bookings:** Order management and tracking
- **Booking Items:** Individual order line items

## 📱 Browser Support

Chrome, Firefox, Safari, Edge - fully responsive across devices.

## 📄 Declaration

This project has been developed independently for COS30043 assessment. All code written by the student with appropriate library attributions.

---

**© 2024 Kelvin Fong Wen Kiong - COS30043 Interface Design and Development**
