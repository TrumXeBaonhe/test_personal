# Kiến trúc hệ thống

## Tổng quan

Ứng dụng Quản lý Chi tiêu Cá nhân được xây dựng theo mô hình MVC (Model-View-Controller).

## Cấu trúc thư mục

```
src/
├── main.py              # Entry point
├── models/              # Database models
├── views/               # UI components
├── controllers/         # Business logic
└── utils/              # Helper functions
```

## Các modules chính

### 1. Models
- Quản lý dữ liệu (chi tiêu, danh mục, ngân sách)

### 2. Views
- Giao diện người dùng

### 3. Controllers
- Xử lý logic ứng dụng

### 4. Utils
- Các hàm tiện ích

## Database Schema

Sẽ được cập nhật khi phát triển ứng dụng.

## Flow của ứng dụng

```
User Input → View → Controller → Model → Database
   ↑                                         ↓
   └─────────────── Response ────────────────┘
```
