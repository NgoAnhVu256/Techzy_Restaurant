# Techzy Restaurant - Backend API

Backend API cho hệ thống quản lý nhà hàng Techzy Restaurant, được xây dựng bằng Node.js, Express và PostgreSQL.

## 📋 Mục lục

- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cài đặt](#cài-đặt)
- [Cấu hình](#cấu-hình)
- [Chạy ứng dụng](#chạy-ứng-dụng)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [API Endpoints](#api-endpoints)
- [Database Migration](#database-migration)
- [Troubleshooting](#troubleshooting)

## 🛠 Yêu cầu hệ thống

- Node.js >= 14.0.0
- npm >= 6.0.0
- PostgreSQL >= 12.0 (hoặc AWS RDS PostgreSQL)
- Git

## 📦 Cài đặt

### 1. Clone repository và di chuyển vào thư mục Backend

```bash
cd Backend
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Tạo file .env

Sao chép file `.env.example` thành `.env` và cập nhật các giá trị:

```bash
cp .env.example .env
```

### 4. Cấu hình database

Mở file `.env` và cập nhật thông tin kết nối database:

**Nếu sử dụng AWS RDS:**

```env
DATABASE_URL=postgresql://username:password@your-rds-endpoint:5432/database_name
DB_SSL=true
```

**Nếu sử dụng PostgreSQL local:**

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=RestaurantDb
DB_USER=postgres
DB_PASSWORD=your_password
DB_SSL=false
```

### 5. Cấu hình JWT Secret

Cập nhật `JWT_SECRET` trong file `.env` với một chuỗi bí mật mạnh:

```env
JWT_SECRET=your-256-bit-secret-key-here-change-in-production
```

## ⚙️ Cấu hình

### Biến môi trường

File `.env` chứa các cấu hình sau:

- **Database**: Thông tin kết nối PostgreSQL
- **JWT**: Secret key và thời gian hết hạn token
- **Server**: Port và môi trường (development/production)
- **CORS**: Các origin được phép truy cập
- **Email**: Cấu hình SMTP (optional)

### Cấu hình AWS RDS

Khi kết nối tới AWS RDS PostgreSQL:

1. Đảm bảo Security Group cho phép kết nối từ IP của bạn
2. Sử dụng `DATABASE_URL` với format:
   ```
   postgresql://username:password@endpoint:5432/database
   ```
3. Đặt `DB_SSL=true` nếu RDS yêu cầu SSL

## 🚀 Chạy ứng dụng

### Development mode (với nodemon - auto reload)

```bash
npm run dev
```

### Production mode

```bash
npm start
```

Server sẽ chạy tại: `http://localhost:5000` (hoặc port bạn đã cấu hình)

### Kiểm tra server

```bash
curl http://localhost:5000/api/health
```

## 📁 Cấu trúc dự án

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js        # Cấu hình và kết nối PostgreSQL
│   │   └── env.js             # Đọc biến môi trường
│   ├── models/                # Sequelize Models
│   │   ├── TaiKhoan.js
│   │   ├── MonAn.js
│   │   ├── DonHang.js
│   │   ├── DatBan.js
│   │   └── index.js           # Định nghĩa relationships
│   ├── controllers/           # Logic xử lý API
│   │   ├── users.controller.js
│   │   ├── menu.controller.js
│   │   ├── orders.controller.js
│   │   └── reservations.controller.js
│   ├── routes/                 # Định nghĩa routes
│   │   ├── users.routes.js
│   │   ├── menu.routes.js
│   │   ├── orders.routes.js
│   │   ├── reservations.routes.js
│   │   └── index.js
│   ├── middlewares/            # Middleware
│   │   ├── auth.middleware.js
│   │   └── error.middleware.js
│   ├── utils/                  # Utilities
│   │   ├── logger.js
│   │   └── sendMail.js
│   ├── app.js                  # Cấu hình Express
│   └── server.js               # Khởi động server
├── wwwroot/
│   └── images/                 # Thư mục lưu hình ảnh
├── logs/                       # Thư mục lưu log files
├── .env                        # Biến môi trường (không commit)
├── .env.example               # Template cho .env
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Users API (`/api/users`)

- `POST /api/users/register` - Đăng ký user mới
- `POST /api/users/login` - Đăng nhập
- `GET /api/users` - Lấy danh sách users (cần auth + admin)
- `GET /api/users/:id` - Lấy user theo ID (cần auth)
- `PUT /api/users/:id` - Cập nhật user (cần auth + admin)
- `DELETE /api/users/:id` - Xóa user (cần auth + admin)

### Menu API (`/api/menu`)

- `GET /api/menu` - Lấy danh sách món ăn
- `GET /api/menu/loaimon` - Lấy danh sách loại món
- `GET /api/menu/count` - Đếm số lượng món ăn
- `GET /api/menu/:id` - Lấy món ăn theo ID
- `POST /api/menu` - Tạo món ăn mới (cần auth + admin)
- `PUT /api/menu/:id` - Cập nhật món ăn (cần auth + admin)
- `DELETE /api/menu/:id` - Xóa món ăn (cần auth + admin)

### Orders API (`/api/orders`)

- `POST /api/orders` - Tạo đơn hàng mới
- `GET /api/orders` - Lấy danh sách đơn hàng (cần auth)
- `GET /api/orders/today/count` - Đếm đơn hàng hôm nay (cần auth)
- `GET /api/orders/today/revenue` - Doanh thu hôm nay (cần auth)
- `GET /api/orders/:id` - Lấy đơn hàng theo ID (cần auth)
- `PUT /api/orders/:id/trangthai` - Cập nhật trạng thái đơn hàng (cần auth)
- `DELETE /api/orders/:id` - Xóa đơn hàng (cần auth)

### Reservations API (`/api/reservations`)

- `POST /api/reservations` - Tạo đặt bàn mới
- `GET /api/reservations` - Lấy danh sách đặt bàn (cần auth)
- `GET /api/reservations/:id` - Lấy đặt bàn theo ID (cần auth)
- `GET /api/reservations/:maDatBan/monan` - Lấy món ăn theo đặt bàn (cần auth)
- `PUT /api/reservations/:id` - Cập nhật đặt bàn (cần auth)
- `DELETE /api/reservations/:id` - Hủy đặt bàn (cần auth)

### Health Check

- `GET /api/health` - Kiểm tra trạng thái server

## 🔐 Authentication

API sử dụng JWT (JSON Web Token) để xác thực.

**Cách sử dụng:**

1. Đăng nhập qua `/api/users/login` để nhận token
2. Gửi token trong header của các request cần xác thực:
   ```
   Authorization: Bearer <your-token>
   ```

**Vai trò:**

- **Quản lý**: Toàn quyền truy cập
- **Nhân viên**: Quyền hạn chế
- **Khách hàng**: Chỉ có thể tạo đơn hàng và đặt bàn

## 📊 Database Migration

### Tự động sync (Development)

Trong môi trường development, server sẽ tự động sync models với database khi khởi động.

### Manual Migration (Production)

Trong production, nên sử dụng Sequelize migrations:

```bash
# Tạo migration
npx sequelize-cli migration:generate --name migration-name

# Chạy migrations
npx sequelize-cli db:migrate

# Rollback
npx sequelize-cli db:migrate:undo
```

## 🐛 Troubleshooting

### Lỗi kết nối database

1. Kiểm tra thông tin kết nối trong `.env`
2. Đảm bảo PostgreSQL đang chạy
3. Kiểm tra firewall và security groups (nếu dùng AWS RDS)
4. Kiểm tra SSL settings nếu dùng RDS

### Lỗi JWT

- Đảm bảo `JWT_SECRET` đã được cấu hình
- Kiểm tra token có hết hạn không
- Đảm bảo gửi token đúng format: `Bearer <token>`

### Lỗi upload file

- Kiểm tra thư mục `wwwroot/images` có tồn tại và có quyền ghi
- Kiểm tra kích thước file (tối đa 5MB)
- Kiểm tra định dạng file (chỉ chấp nhận ảnh)

### Port đã được sử dụng

Thay đổi port trong file `.env`:

```env
PORT=5001
```

## 📝 Ghi chú

- Logs được lưu trong thư mục `logs/`
- Hình ảnh được lưu trong thư mục `wwwroot/images/`
- Trong production, nên sử dụng process manager như PM2
- Nên sử dụng HTTPS trong production
- Đảm bảo `.env` không được commit lên Git

## 📄 License

ISC

## 👥 Contributors

- Techzy Restaurant Team
