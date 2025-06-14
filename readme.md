# TravelEase - Vue.js Travel Booking Application

## 项目简介 / Project Overview

TravelEase 是一个完整的旅行预订网站应用，使用 Vue.js 3 + Node.js + MySQL 开发，符合 COS30043 Interface Design and Development 课程要求。

## 🎯 COS30043 要求符合性 / Requirements Compliance

### ✅ 必需页面 (7页)
1. **Main page (index page)** - 主页，展示特色包和搜索
2. **Product page** - 产品页面，展示所有旅行包，支持分页和过滤
3. **Shopping Cart** - 购物车，计算总价包括运费和税费
4. **Registration page** - 注册页面，创建用户数据库记录
5. **Login page** - 登录页面，表单验证
6. **My account page** - 账户页面，显示和编辑用户详情
7. **My purchase page** - 购买页面，显示预订历史，支持 CRUD 操作

### ✅ 技术要求
- **Context view grouping** - 使用 Bootstrap row-column 网格系统
- **Arrays usage** - 产品列表、购物车项目、预订记录
- **Directives** - v-for, v-if, v-show 等选择和重复指令
- **Filters** - 货币格式化、文本截断、日期格式化
- **Pagination** - 产品页面分页功能
- **JSON data** - 后端 API 返回 JSON 数据
- **Database tables** - MySQL 数据库存储用户和预订信息
- **Form validation** - 登录和注册表单验证
- **Bootstrap** - 响应式设计
- **Router** - Vue Router 单页应用路由

## 🛠️ 技术栈 / Technology Stack

### Frontend
- **Vue.js 3** - 渐进式JavaScript框架
- **Vue Router 4** - 单页应用路由
- **Bootstrap 5** - 响应式CSS框架
- **Axios** - HTTP客户端
- **Bootstrap Icons** - 图标库

### Backend
- **Node.js** - JavaScript运行环境
- **Express.js** - Web应用框架
- **MySQL** - 关系数据库
- **JWT** - 身份验证
- **bcrypt** - 密码加密

## 📁 项目结构 / Project Structure

```
travelease/
├── backend/
│   ├── server.js          # Express服务器
│   ├── database.sql       # 数据库结构
│   ├── package.json       # 后端依赖
│   └── .env               # 环境变量
└── frontend/
    ├── index.html         # 主页面
    ├── css/
    │   └── custom.css     # 自定义样式
    └── js/
        ├── app.js         # 主应用文件
        ├── components/    # Vue组件
        │   ├── PackageCard.js
        │   └── AlertMessage.js
        └── pages/         # 页面组件
            ├── HomePage.js
            ├── ProductsPage.js
            ├── CartPage.js
            ├── LoginPage.js
            ├── RegisterPage.js
            ├── AccountPage.js
            └── PurchasesPage.js
```

## 🚀 快速开始 / Getting Started

### 1. 数据库设置
```bash
# 启动 MySQL 服务
# 创建数据库并导入数据
mysql -u root -p < backend/database.sql
```

### 2. 后端设置
```bash
cd backend
npm install
npm start
# 服务器运行在 http://localhost:3000
```

### 3. 前端设置
```bash
cd frontend
# 使用任何HTTP服务器，例如：
python -m http.server 8080
# 或者使用 Live Server (VS Code 扩展)
```

### 4. 访问应用
- Frontend: http://localhost:8080
- Backend API: http://localhost:3000/api

## 🔐 测试账户 / Demo Account

- **Email**: demo@travelease.com
- **Password**: demo123

## 📊 主要功能 / Key Features

### 🏠 主页 (HomePage)
- 英雄区域与搜索功能
- 特色旅行包展示
- 统计数据显示
- 分类导航

### 🛍️ 产品页面 (ProductsPage)
- **数组使用**: 展示旅行包列表
- **过滤器**: 搜索、分类、价格范围、排序
- **分页**: 每页6个项目的分页系统
- **指令**: v-for 循环显示、v-if 条件显示

### 🛒 购物车 (CartPage)
- **计算总价**: 包括小计、折扣、运费、GST税费
- 促销代码功能
- 数量调整
- 结账流程

### 👤 用户管理
- **注册**: 创建数据库用户记录
- **登录**: 表单验证和JWT认证
- **账户**: 显示和编辑用户详情
- **预订**: CRUD操作 (创建、读取、更新、删除)

### 🎨 设计特性
- **响应式设计**: 支持手机、平板、桌面
- **Bootstrap网格**: Row-column 上下文视图分组
- **现代UI**: 渐变、阴影、动画效果
- **可访问性**: ARIA标签、语义化HTML

## 🔧 API端点 / API Endpoints

### 认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录

### 旅行包
- `GET /api/packages` - 获取所有旅行包
- `GET /api/packages/:id` - 获取单个旅行包

### 用户
- `GET /api/user/profile` - 获取用户资料
- `PUT /api/user/profile` - 更新用户资料

### 预订
- `GET /api/bookings` - 获取用户预订
- `POST /api/bookings` - 创建新预订

## 📝 数据库设计 / Database Design

### 主要表格
- **users** - 用户信息
- **travel_packages** - 旅行包信息
- **bookings** - 预订记录
- **booking_items** - 预订项目详情

## 🎨 样式和主题 / Styling & Theming

- **主色调**: 蓝紫渐变 (#667eea to #764ba2)
- **响应式**: 移动优先设计
- **动画**: 悬停效果、过渡动画
- **图标**: Bootstrap Icons

## 🔍 开发特性 / Development Features

- **模块化组件**: 可重用的Vue组件
- **状态管理**: 简化的响应式store
- **错误处理**: 用户友好的错误消息
- **表单验证**: 实时验证反馈
- **SEO优化**: 语义化HTML和meta标签

## 📱 浏览器支持 / Browser Support

- Chrome (推荐)
- Firefox
- Safari  
- Edge

## 🎓 学习要点 / Learning Objectives

这个项目展示了：
1. **Vue.js 3 组合式API** 的使用
2. **组件化开发** 的最佳实践
3. **RESTful API** 设计和集成
4. **数据库设计** 和关系管理
5. **用户体验设计** 原则
6. **响应式Web开发**

## 🤝 贡献 / Contributing

这是一个学术项目，用于 COS30043 课程评估。

## 📄 许可证 / License

此项目仅用于教育目的。

---

**COS30043 - Interface Design and Development**  
**Swinburne University of Technology**  
**2024**