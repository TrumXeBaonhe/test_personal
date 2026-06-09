# 🚀 HƯỚNG DẪN CHÍNH: FIX DEPLOYMENT VERCEL

## 📌 TÓM TẮT VẤN ĐỀ

Trang web không thể truy cập vì:
1. ❌ `NEXTAUTH_SECRET` sai (placeholder)
2. ❌ `NEXTAUTH_URL` hướng tới localhost (local URL)
3. ❌ Credentials bị commit trong repository (không an toàn)
4. ❌ Environment variables chưa được cấu hình trên Vercel

---

## ✅ GIẢI PHÁP - THỰC HIỆN TỪNG BƯỚC

### **BƯỚC 1: Chuẩn Bị Local (Máy Của Bạn)**

#### 1a) Kiểm tra file .env.local tồn tại:
```bash
# Mở terminal tại thư mục dự án
# Windows: cmd hoặc PowerShell
# macOS/Linux: Terminal

cd d:\3subexo\test_CLI\test_personal
ls -la .env.local  # Hoặc dir /b .env.local (Windows)
```

✅ Bạn sẽ thấy `.env.local` đã tồn tại với các credentials.

#### 1b) Xác nhận .git/hooks/pre-commit tồn tại:
```bash
cat .git/hooks/pre-commit  # hoặc type .git\hooks\pre-commit (Windows)
```

✅ Bạn sẽ thấy script kiểm tra credentials.

---

### **BƯỚC 2: Cập Nhật Repository - Loại Bỏ Credentials Cũ**

```bash
# 1. Xoá credential cũ khỏi file .env
#    (Đã làm ở bước setup - chỉ giữ template)

# 2. Xoá credentials khỏi Git history (Quan trọng!)
#    Command này sẽ xoá tất cả references:

# 2a) Xoá DATABASE_URL từ Git history:
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .env' \
  -- --all

# 2b) Force push lên GitHub (nếu cần):
git push origin --force --all

# 2c) Hoặc nếu không muốn rewrite history, 
#     tạo .gitignore fix:
git rm --cached .env
git add .gitignore
git commit -m "chore: remove .env from tracking"
git push origin main
```

**HOẶC (Cách nhanh hơn - Khuyến nghị):**
```bash
# 1. Thêm .env.local vào tracking (để dễ quản lý):
git rm --cached .env.local
git add .env  # Thêm file template
git commit -m "chore: update env template and secure credentials"
git push origin main
```

---

### **BƯỚC 3: Cấu Hình Trên Vercel Dashboard** ⭐ QUAN TRỌNG

**Đường dẫn:**
1. Vào https://vercel.com/dashboard
2. Chọn project `spendwise5`
3. Click "Settings" → "Environment Variables"

**Thêm 7 biến sau (đúng thứ tự):**

| # | Name | Value | Scope |
|---|------|-------|-------|
| 1 | `DATABASE_URL` | `postgresql://user:password@host/dbname` | ✓ Production, Preview, Development |
| 2 | `NEXTAUTH_SECRET` | `[generated 32+ char random string]` | ✓ Production, Preview, Development |
| 3 | `NEXTAUTH_URL` | `https://spendwise5.vercel.app` | ✓ Production, Preview |
| 4 | `AUTH_TRUST_HOST` | `true` | ✓ Production, Preview, Development |
| 5 | `GROQ_API_KEY` | `gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` | ✓ Production, Preview |
| 6 | `GMAIL_USER` | `your-email@gmail.com` | ✓ Production, Preview |
| 7 | `GMAIL_APP_PASSWORD` | `xxxx xxxx xxxx xxxx` | ✓ Production, Preview |

**Cách thêm từng biến:**
1. Click "Add New..." nút
2. Nhập `Name` (ví dụ: `DATABASE_URL`)
3. Nhập `Value` (ví dụ: database URL)
4. Chọn ✓ Scopes (Production, Preview, Development)
5. Click "Save"
6. Lặp lại cho biến tiếp theo

---

### **BƯỚC 4: Trigger Re-deployment**

**Cách 1 (Nhanh nhất):**
1. Vào "Deployments" tab
2. Tìm deployment mới nhất
3. Click "..." (3 chấm)
4. Chọn "Redeploy" 
5. Click "Redeploy" để xác nhận

**Cách 2 (Push từ local):**
```bash
# Thực hiện push bất kỳ thay đổi nào
git add .env
git commit -m "chore: update env template"
git push origin main

# Vercel sẽ tự động trigger deploy
```

---

### **BƯỚC 5: Chờ & Kiểm Tra**

**Trong Vercel Dashboard:**
```
Deployment Status:
✓ Building...
✓ Initializing Build
✓ Installing dependencies
✓ Linting
✓ Building
✓ Exporting
✓ Creating deployment
✓ Deployment Complete! 🎉
```

**Chờ cho đến khi thấy:**
- Status: `Ready` (xanh ✓)
- Không có lỗi

---

### **BƯỚC 6: Kiểm Tra Trang Web**

Truy cập: **https://spendwise5.vercel.app**

Kiểm tra:
- ✅ Trang load bình thường (không lỗi 429)
- ✅ Không có error message đỏ
- ✅ Logo/UI hiển thị đúng
- ✅ Có thể click các nút
- ✅ Đăng nhập/đăng ký hoạt động

---

## 🧪 KIỂM TRA AN TOÀN TRƯỚC KHI PUSH

Chạy script kiểm tra credentials:

```bash
# Kiểm tra có credentials lộ trong code không
node scripts/check-secrets.js

# Output mong muốn:
# ✅ OK: Không tìm thấy credentials lộ trong code
#    Sẵn sàng push lên GitHub!
```

---

## 🆘 TROUBLESHOOTING

### ❌ Lỗi 1: "ERR_RATE_LIMIT" hoặc 429 Error
```
Nguyên nhân: Environment variables chưa được cấu hình
Cách sửa:
1. Kiểm tra lại tất cả 7 biến ở Vercel
2. Redeploy project
3. Chờ 2-3 phút
4. F5 (refresh) trình duyệt
5. Thử xóa cache: Ctrl+Shift+Delete
```

### ❌ Lỗi 2: "NEXTAUTH_SECRET is missing"
```
Nguyên nhân: NEXTAUTH_SECRET không được thêm vào Vercel
Cách sửa:
1. Vào Vercel Settings → Environment Variables
2. Tìm NEXTAUTH_SECRET
3. Nếu không có → Thêm mới với giá trị: 
   fPDO8s3hc1Z6fT9aTnzxo8ZVGq9H8Jb1RkuAU9rb9ZY=
4. Redeploy
```

### ❌ Lỗi 3: "Invalid hostname"
```
Nguyên nhân: NEXTAUTH_URL sai
Cách sửa:
1. Kiểm tra NEXTAUTH_URL = https://spendwise5.vercel.app
2. KHÔNG là localhost!
3. KHÔNG là http:// (phải là https://)
4. Redeploy
```

### ❌ Lỗi 4: "Database connection failed"
```
Nguyên nhân: DATABASE_URL sai hoặc hết hạn
Cách sửa:
1. Kiểm tra Neon database vẫn hoạt động
2. Thử kết nối local: npm run dev
3. Nếu local không được → Neon database lỗi
4. Cập nhật DATABASE_URL nếu thay đổi
5. Redeploy
```

---

## 📝 CHECKLIST CUỐI CÙNG

Trước khi xem như xong, kiểm tra:

- [ ] File `.env.local` tồn tại (với credentials)
- [ ] File `.env` là template (không có credentials)
- [ ] `.git/hooks/pre-commit` tồn tại
- [ ] Đã commit & push `.env` template lên GitHub
- [ ] 7 biến được thêm trên Vercel
- [ ] Vercel deployment status = "Ready" ✓
- [ ] https://spendwise5.vercel.app load được
- [ ] Không có lỗi 429 / "Failed to fetch"
- [ ] Có thể đăng nhập / đăng ký
- [ ] Database kết nối thành công

---

## 💾 LƯU Ý QUAN TRỌNG

✅ **LÀMLÀM:**
```
1. Giữ .env.local an toàn (không commit)
2. Dùng Vercel Environment Variables cho production
3. Tạo NEXTAUTH_SECRET độc lập mỗi lần
4. Kiểm tra trước khi push: node scripts/check-secrets.js
5. Thường xuyên rotate secrets (mỗi 3 tháng)
```

❌ **KHÔNG LÀM:**
```
1. Commit .env.local lên Git
2. Share credentials trên Slack/Email
3. Dùng placeholder NEXTAUTH_SECRET
4. Hardcode credentials trong code
5. Push credentials lên GitHub công khai
```

---

## 🎉 SAU KHI FIX XONG

Trang web của bạn sẽ:
- ✅ Hoạt động bình thường
- ✅ Có thể đăng nhập/đăng ký
- ✅ Database kết nối thành công
- ✅ Mã QR và avatar upload hoạt động
- ✅ Giao dịch chuyển khoản thành công
- ✅ An toàn (credentials không lộ)

---

## 📞 CẦN GIÚP?

Nếu vẫn gặp lỗi sau khi thực hiện hết:
1. Chụp ảnh error message
2. Kiểm tra Vercel Logs (Deployments → Click vào build → Logs)
3. Xem console browser (F12 → Console tab)
4. Kiểm tra file VERCEL_ENV_SETUP.md để chi tiết hơn

---

**Chúc bạn thành công! 🚀**
