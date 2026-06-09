# 🚀 HƯỚNG DẪN CẤU HÌNH VERCEL ENVIRONMENT VARIABLES

## BƯỚC 1: Truy Cập Vercel Dashboard
1. Đăng nhập vào https://vercel.com/dashboard
2. Chọn project "spendwise5"
3. Click vào tab "Settings"
4. Chọn "Environment Variables" ở menu bên trái

## BƯỚC 2: Thêm Các Biến Môi Trường

Thêm từng biến sau đây với các giá trị tương ứng:

### 🔐 1. DATABASE_URL (Bắt Buộc)
```
Name:  DATABASE_URL
Value: postgresql://user:password@host/dbname?sslmode=require&channel_binding=require
```
**Cách lấy:** Sao chép từ .env.local → DATABASE_URL (KHÔNG commit real value!)

---

### 🔑 2. NEXTAUTH_SECRET (Bắt Buộc - Cấu Trúc Giá Trị)
```
Name:  NEXTAUTH_SECRET
Value: [32+ character random string - lấy từ .env.local]
```
**Cách lấy:** Sao chép từ .env.local → NEXTAUTH_SECRET (KHÔNG commit real value!)

---

### 📍 3. NEXTAUTH_URL (Bắt Buộc - Production)
```
Name:  NEXTAUTH_URL
Value: https://spendwise5.vercel.app
```
**Lưu Ý:** PHẢI là URL production, không phải localhost!

---

### 4. AUTH_TRUST_HOST (Bắt Buộc)
```
Name:  AUTH_TRUST_HOST
Value: true
```

---

### 5. GROQ_API_KEY (Tùy chọn)
```
Name:  GROQ_API_KEY
Value: gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
**Cách lấy:** Sao chép từ .env.local → GROQ_API_KEY (KHÔNG commit real value!)

---

### 6. GMAIL_USER (Tùy chọn)
```
Name:  GMAIL_USER
Value: your-email@gmail.com
```
**Cách lấy:** Sao chép từ .env.local → GMAIL_USER

---

### 7. GMAIL_APP_PASSWORD (Tùy chọn)
```
Name:  GMAIL_APP_PASSWORD
Value: xxxx xxxx xxxx xxxx
```
**Cách lấy:** Sao chép từ .env.local → GMAIL_APP_PASSWORD (KHÔNG commit real value!)

---

## BƯỚC 3: Cấu Hình Cho Cả Production & Preview

Khi thêm từng biến, đảm bảo:

1. **Chọn các Environments:**
   - ☑️ Production (spendwise5.vercel.app)
   - ☑️ Preview (staging/preview deploys)
   - ☑️ Development (local env)

2. **Hoặc riêng cho Production:**
   - Nếu chỉ muốn cho Production, chọn:
     - ☑️ Production
     - ✓ Click "Add"

---

## BƯỚC 4: Trigger Re-deployment

Sau khi thêm tất cả biến:

1. Vào "Deployments" tab
2. Click vào deployment mới nhất
3. Click "..." → "Redeploy" 
   OR
4. **Nhanh hơn:** Push commit lên GitHub:
   ```bash
   git add .env
   git commit -m "chore: update env template"
   git push origin main
   ```
   → Vercel sẽ tự động redeploy

---

## 🧪 BƯỚC 5: Kiểm Tra Deployment

1. Chờ deploy hoàn tất (xanh ✓)
2. Click vào URL: https://spendwise5.vercel.app
3. Kiểm tra:
   - ✅ Trang load bình thường
   - ✅ Không lỗi 429 (Rate Limited)
   - ✅ Có thể đăng nhập
   - ✅ Database kết nối thành công

---

## ⚠️ TROUBLESHOOTING

### Lỗi: "Failed to fetch" / 429
**Nguyên nhân:** Environment variables chưa được cấu hình
**Cách sửa:** Đảm bảo tất cả biến đã được thêm → Redeploy

### Lỗi: "NEXTAUTH_SECRET is missing"
**Nguyên nhân:** Biến NEXTAUTH_SECRET chưa được thêm
**Cách sửa:** Thêm NEXTAUTH_SECRET vào Environment Variables

### Lỗi: "Database connection failed"
**Nguyên nhân:** DATABASE_URL sai hoặc hết hạn
**Cách sửa:** 
- Kiểm tra DATABASE_URL trong .env.local
- Đảm bảo Neon database còn hoạt động
- Cập nhật lại DATABASE_URL trên Vercel

### Lỗi: "Invalid hostname" 
**Nguyên nhân:** NEXTAUTH_URL sai (local URL trên production)
**Cách sửa:** Thay NEXTAUTH_URL = https://spendwise5.vercel.app

---

## 📝 CHECKLIST

- [ ] Tạo NEXTAUTH_SECRET mới
- [ ] Tạo .env.local với credentials
- [ ] Cập nhật .env thành template
- [ ] Thêm DATABASE_URL trên Vercel
- [ ] Thêm NEXTAUTH_SECRET trên Vercel  
- [ ] Thêm NEXTAUTH_URL=https://spendwise5.vercel.app trên Vercel
- [ ] Thêm AUTH_TRUST_HOST=true trên Vercel
- [ ] Thêm GROQ_API_KEY trên Vercel
- [ ] Thêm GMAIL_USER trên Vercel
- [ ] Thêm GMAIL_APP_PASSWORD trên Vercel
- [ ] Redeploy project
- [ ] Kiểm tra https://spendwise5.vercel.app có hoạt động

---

## 💡 TIPS AN TOÀN

✅ **LÀM:**
- Lưu credentials trong .env.local (ignored by git)
- Dùng Environment Variables trên Vercel cho production
- Tạo NEXTAUTH_SECRET độc lập cho mỗi environment
- Rotate secrets định kỳ

❌ **KHÔNG LÀM:**
- Commit .env.local lên Git
- Share secrets trên Slack/Email
- Dùng cùng secret cho dev & production
- Lưu credentials trong code
