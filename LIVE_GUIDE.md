# ✅ HƯỚNG DẪN HOÀN THÀNH - VERCEL SETUP (LIVE GUIDE)

## 📊 Tình Trạng Hiện Tại

```
✅ Git:     Code đã push lên GitHub
✅ Build:   npm run build thành công (không lỗi)
✅ Code:    Tất cả features sẵn sàng
⏳ Vercel:  Chờ cấu hình Environment Variables
```

---

## 🚀 BƯỚC-BY-BƯỚC - CÓ HÌNH ẢNH

### **BƯỚC 1: Truy cập Vercel Dashboard**

1. Mở trình duyệt → Vào: **https://vercel.com/dashboard**
2. Đăng nhập nếu chưa (dùng GitHub account)
3. Chọn project **`spendwise5`** từ danh sách projects

📸 **Expected:** Bạn sẽ thấy:
```
spendwise5 ← Click vào đây
├─ Settings
├─ Deployments (hiện tại: chưa hoàn thành)
├─ Analytics
└─ Preview Deployments
```

---

### **BƯỚC 2: Vào Settings → Environment Variables**

1. Click vào nút **"Settings"** (ở trên cùng hoặc sidebar)
2. Tìm mục **"Environment Variables"** ở menu bên trái
3. Click vào "Environment Variables"

📸 **Expected:** Bạn sẽ thấy form trống hoặc danh sách biến cũ:
```
Name              | Value (hidden)        | Scopes              | Actions
────────────────────────────────────────────────────────────────────────
(trống hoặc có biến cũ)
```

---

### **BƯỚC 3: Xoá Biến Cũ (Nếu Có)**

Nếu thấy biến cũ → Click nút **"Delete"** để xoá (nếu có):
```
- DATABASE_URL (cũ)  → Delete
- NEXTAUTH_SECRET (cũ) → Delete
- Các biến khác → Delete hết
```

---

### **BƯỚC 4: Thêm 7 Biến Mới**

#### **Biến #1: DATABASE_URL**

1. Click nút **"Add New"** (hoặc "Add Environment Variable")
2. Nhập:
   - **Name:** `DATABASE_URL`
   - **Value:** Sao chép từ file `.env.local` ở máy bạn
     
   📍 Mở `.env.local` (trên máy Windows):
   ```
   # Mở file: d:\3subexo\test_CLI\test_personal\.env.local
   # Tìm dòng: DATABASE_URL=postgresql://...
   # Copy toàn bộ value sau dấu "="
   ```

3. **Scopes:** Chọn 3 checkboxes:
   - ☑️ Production
   - ☑️ Preview  
   - ☑️ Development

4. Click **"Add"**

✅ **Result:** DATABASE_URL được thêm vào

---

#### **Biến #2: NEXTAUTH_SECRET**

1. Click "Add New" lần nữa
2. Nhập:
   - **Name:** `NEXTAUTH_SECRET`
   - **Value:** Sao chép từ `.env.local` → Dòng `NEXTAUTH_SECRET=`

3. **Scopes:**
   - ☑️ Production
   - ☑️ Preview
   - ☑️ Development

4. Click **"Add"**

✅ **Result:** NEXTAUTH_SECRET được thêm vào

---

#### **Biến #3: NEXTAUTH_URL**

1. Click "Add New"
2. Nhập:
   - **Name:** `NEXTAUTH_URL`
   - **Value:** `https://spendwise5.vercel.app`
   
   ⚠️ **QUAN TRỌNG:** Phải là URL production, KHÔNG localhost!

3. **Scopes:** Chỉ chọn:
   - ☑️ Production
   - ☑️ Preview
   
   (KHÔNG chọn Development - vì local dùng localhost)

4. Click **"Add"**

✅ **Result:** NEXTAUTH_URL = https://spendwise5.vercel.app

---

#### **Biến #4: AUTH_TRUST_HOST**

1. Click "Add New"
2. Nhập:
   - **Name:** `AUTH_TRUST_HOST`
   - **Value:** `true`

3. **Scopes:**
   - ☑️ Production
   - ☑️ Preview
   - ☑️ Development

4. Click **"Add"**

✅ **Result:** AUTH_TRUST_HOST = true

---

#### **Biến #5: GROQ_API_KEY**

1. Click "Add New"
2. Nhập:
   - **Name:** `GROQ_API_KEY`
   - **Value:** Sao chép từ `.env.local` → Dòng `GROQ_API_KEY=`

3. **Scopes:**
   - ☑️ Production
   - ☑️ Preview

4. Click **"Add"**

✅ **Result:** GROQ_API_KEY được thêm vào

---

#### **Biến #6: GMAIL_USER**

1. Click "Add New"
2. Nhập:
   - **Name:** `GMAIL_USER`
   - **Value:** Sao chép từ `.env.local` → Dòng `GMAIL_USER=`

3. **Scopes:**
   - ☑️ Production
   - ☑️ Preview

4. Click **"Add"**

✅ **Result:** GMAIL_USER được thêm vào

---

#### **Biến #7: GMAIL_APP_PASSWORD**

1. Click "Add New"
2. Nhập:
   - **Name:** `GMAIL_APP_PASSWORD`
   - **Value:** Sao chép từ `.env.local` → Dòng `GMAIL_APP_PASSWORD=`

3. **Scopes:**
   - ☑️ Production
   - ☑️ Preview

4. Click **"Add"**

✅ **Result:** GMAIL_APP_PASSWORD được thêm vào

---

### **BƯỚC 5: Xác Nhận Tất Cả 7 Biến**

Bây giờ bạn sẽ thấy trong Vercel:

```
Name                   | Value        | Scopes
─────────────────────────────────────────────────
1. DATABASE_URL        | [hidden]     | Prod, Preview, Dev ✓
2. NEXTAUTH_SECRET     | [hidden]     | Prod, Preview, Dev ✓
3. NEXTAUTH_URL        | [hidden]     | Prod, Preview ✓
4. AUTH_TRUST_HOST     | true         | Prod, Preview, Dev ✓
5. GROQ_API_KEY        | [hidden]     | Prod, Preview ✓
6. GMAIL_USER          | [hidden]     | Prod, Preview ✓
7. GMAIL_APP_PASSWORD  | [hidden]     | Prod, Preview ✓
```

✅ **Nếu đúng như trên → Tiếp tục bước 6**

---

### **BƯỚC 6: Trigger Re-deployment**

**Cách 1 (Nhanh nhất):**

1. Vào tab **"Deployments"** 
2. Tìm deployment mới nhất (mà không có lỗi)
3. Click vào deployment đó
4. Click nút **"..."** (3 chấm ở góc phải)
5. Chọn **"Redeploy"**
6. Click **"Redeploy"** để xác nhận

📸 **Expected:** Thấy dòng mới:
```
Deployment Status: Building... → Deployed ✓
```

**Cách 2 (Alternative):** Nếu cách 1 không thấy 3 chấm:
- Click vào deployment
- Nhìn tìm nút **"Redeploy"** ở page chi tiết

---

### **BƯỚC 7: Chờ Deployment Hoàn Thành**

1. Ở tab "Deployments", theo dõi status:
   ```
   Building...
   ↓ (chờ 2-3 phút)
   Initializing Build
   ↓
   Installing dependencies
   ↓
   Building project
   ↓
   Exporting pages
   ↓
   Deployment Complete! ✓ Ready
   ```

2. **Dòng chữ:** Từ `Building` → `Ready` (xanh ✓)

⏱️ **Thời gian:** Thường mất 3-5 phút

---

### **BƯỚC 8: Kiểm Tra Trang Web**

1. Mở browser → Vào: **https://spendwise5.vercel.app**

2. ✅ **Kiểm tra những điều này:**
   - Trang load (không lỗi 429)
   - Logo/UI hiển thị đúp
   - Không có error message đỏ
   - Có nút "Sign in" hoặc form đăng nhập

3. **Nếu thấy lỗi 429:** 
   - F5 refresh trang
   - Xóa cache browser (Ctrl+Shift+Delete)
   - Chờ 2 phút lại thử

---

### **BƯỚC 9: Test Đầy Đủ (Tùy chọn)**

Sau khi trang load được:

```
1. Đăng nhập/Đăng ký tài khoản
   ✓ Form hoạt động
   ✓ Database kết nối

2. Vào Profile → Tải avatar
   ✓ Avatar upload hoạt động

3. Vào QR Code Dashboard
   ✓ QR code hiển thị
   ✓ Có thể quét QR

4. Test Transfer (Tùy chọn)
   ✓ Nhập tài khoản người nhận
   ✓ Tạo giao dịch
```

---

## 🆘 TROUBLESHOOTING

### ❌ Lỗi 1: "ERR_RATE_LIMIT" 429

**Nguyên nhân:** Vercel chưa load xong

**Cách sửa:**
```
1. F5 refresh trang
2. Xóa cache: Ctrl+Shift+Delete
3. Chờ 2-3 phút
4. Thử lại
```

### ❌ Lỗi 2: "NEXTAUTH_SECRET is missing"

**Nguyên nhân:** NEXTAUTH_SECRET chưa được thêm

**Cách sửa:**
```
1. Kiểm tra Vercel Environment Variables
2. Thêm lại NEXTAUTH_SECRET
3. Redeploy
4. Chờ 2 phút lại thử
```

### ❌ Lỗi 3: "Invalid hostname"

**Nguyên nhân:** NEXTAUTH_URL sai

**Cách sửa:**
```
1. Kiểm tra: NEXTAUTH_URL = https://spendwise5.vercel.app
2. KHÔNG là localhost!
3. KHÔNG thiếu "https://"
4. Redeploy
```

### ❌ Lỗi 4: "Database connection failed"

**Nguyên nhân:** DATABASE_URL sai

**Cách sửa:**
```
1. Kiểm tra .env.local - DATABASE_URL value
2. Copy chính xác vào Vercel
3. Redeploy
```

---

## 📞 Cần Xem Chi Tiết Hơn?

**Files để tham khảo:**
- `QUICK_START.md` - Tóm tắt nhanh
- `VERCEL_ENV_SETUP.md` - Chi tiết đầy đủ
- `FIX_DEPLOYMENT.md` - Hướng dẫn chính (tiếng Việt)

---

## ✅ Checklist Cuối Cùng

```
- [ ] Đã vào Vercel Dashboard
- [ ] Đã xoá biến cũ (nếu có)
- [ ] Đã thêm 7 biến mới:
    - [ ] DATABASE_URL
    - [ ] NEXTAUTH_SECRET
    - [ ] NEXTAUTH_URL
    - [ ] AUTH_TRUST_HOST
    - [ ] GROQ_API_KEY
    - [ ] GMAIL_USER
    - [ ] GMAIL_APP_PASSWORD
- [ ] Đã Redeploy
- [ ] Chờ deployment xong (Ready ✓)
- [ ] Test: https://spendwise5.vercel.app tải được
- [ ] Có thể đăng nhập
- [ ] QR Code dashboard hoạt động
```

---

## 🎉 HOÀN THÀNH!

Khi mọi thứ xong, bạn sẽ có:
- ✅ Web hoạt động bình thường
- ✅ Database kết nối thành công
- ✅ Credentials an toàn (không lộ)
- ✅ Avatar upload
- ✅ QR Code generation & scanning
- ✅ Transfer transactions

**Chúc bạn thành công! 🚀**

---

## 📝 Ghi Chú

- `.env.local` chứa credentials (không commit)
- Vercel Environment Variables cho production
- Automatic redeploy khi push code lên GitHub
- Pre-commit hook kiểm tra credentials (security)

---

## 💬 Sau khi hoàn thành, hãy báo cáo:

**Hãy gửi kết quả:**
1. ✅ Vercel deployment status (Ready?)
2. ✅ Website URL có tải được? (yes/no)
3. ✅ Có thể đăng nhập? (yes/no)
4. ❌ Nếu có lỗi: Error message là gì?

Tôi sẽ giúp debug nếu cần!
