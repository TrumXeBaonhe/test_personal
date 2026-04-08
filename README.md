# 💰 APP Quản lý Chi tiêu - Financial Management Solution (MVP)

![Next.js](https://img.shields.io/badge/Next.js-15%2B-black?style=for-the-badge&logo=next.js)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-6.0-2D3748?style=for-the-badge&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-AI-orange?style=for-the-badge&logo=google-gemini)

Chào mừng bạn đến với dự án **Quản lý Chi tiêu Cá nhân**. Đây là nền tảng quản lý tài chính hiện đại được xây dựng nhằm giúp người dùng tối ưu hóa dòng tiền, lập kế hoạch tiết kiệm và nhận lời khuyên thông minh từ trí tuệ nhân tạo (AI).

---

## 🏗️ Kiến trúc & Công nghệ (Tech Stack)

Dự án được xây dựng trên nền tảng Fullstack hiện đại, ưu tiên tính linh hoạt và khả năng mở rộng cho nhóm phát triển 5 người.

*   **Core**: [Next.js 16/15 (App Router)](https://nextjs.org/) với Turbopack (Dev server siêu tốc).
*   **Ngôn ngữ**: [TypeScript](https://www.typescriptlang.org/) (Type-safe 100%).
*   **Cơ sở dữ liệu**: [PostgreSQL](https://www.postgresql.org/) (Quản lý dữ liệu quan hệ).
*   **ORM**: [Prisma](https://www.prisma.io/) (Xử lý truy vấn dữ liệu mạnh mẽ).
*   **Xác thực (Auth)**: [NextAuth.js v5 (Beta 30)](https://authjs.dev/) - Credentials Provider.
*   **UI/UX**: [Base UI](https://base-ui.com/), [Shadcn UI](https://ui.shadcn.com/), [Framer Motion](https://www.framer.com/motion/) (Animation).
*   **Biểu đồ**: [Recharts](https://recharts.org/) (Trực quan hóa dữ liệu).
*   **AI**: [Google Gemini 1.5 Flash](https://aistudio.google.com/) (Phân tích tài chính thông minh).
*   **PWA**: [next-pwa](https://github.com/shadowwalker/next-pwa) (Hỗ trợ cài đặt như ứng dụng Mobile).

---

## ✨ Tính năng chính (Feature Modules)

1.  **📊 Dashboard Tổng quan**: Trực quan hóa tài sản thực tế, thu nhập, chi tiêu và dòng tiền 30 ngày.
2.  **🤖 Cố vấn AI**: Phân tích thói quen chi tiêu và đưa ra 3 lời khuyên tài chính cá nhân hóa từ Gemini AI.
3.  **💳 Quản lý Ví (Wallets)**: Theo dõi số dư đa ví, chuyển khoản linh hoạt giữa các ví.
4.  **📝 Giao dịch (Transactions)**: Ghi chép chi tiêu/thu nhập chi tiết, phân loại theo danh mục (Icons/Colors).
5.  **📅 Ngân sách (Budgets)**: Thiết lập hạn mức chi tiêu hàng tháng cho từng danh mục với cảnh báo tiến độ (Xanh/Vàng/Đỏ).
6.  **🎯 Mục tiêu Tiết kiệm (Saving Goals)**: Lập kế hoạch tiết kiệm dài hạn, tự động trừ tiền từ ví và theo dõi tiến độ hoàn thành.
7.  **📈 Báo cáo (Reports)**: Biểu đồ xu hướng tài chính chuyên sâu và tính năng **Xuất báo cáo Excel (.xlsx)**.
8.  **⚙️ Cài đặt (Profile)**: Cập nhật thông tin cá nhân, Avatar và cấu hình tiền tệ mặc định (VND, USD, EUR...).

---

## 🛠️ Hướng dẫn cài đặt & Chạy dự án (Getting Started)

Dành cho các thành viên mới pull code về máy:

### 1. Yêu cầu hệ thống
*   Node.js 20+
*   PostgreSQL (Local hoặc Remote như Neon/Supabase)

### 2. Cài đặt Dependencies
```bash
git clone [URL_RE_CUA_TRUONG_NHOM]
cd APP-Quan-Ly-Chi-Tieu
npm install
```

### 3. Cấu hình Biến môi trường (Environment Variables)
Sao chép tệp mẫu và điền thông tin của bạn:
```bash
cp .env.example .env
```
*   `DATABASE_URL`: Đường dẫn kết nối PostgreSQL.
*   `NEXTAUTH_SECRET`: Chạy `openssl rand -base64 32` để tạo mã bảo mật.
*   `GEMINI_API_KEY`: Lấy key từ [Google AI Studio](https://aistudio.google.com/).

### 4. Thiết lập Cơ sở dữ liệu (Prisma)
Đẩy cấu trúc bảng lên DB của bạn:
```bash
npx prisma db push
# Hoặc chạy migration nếu cần
# npx prisma migrate dev --name init
```

### 5. Chạy dự án
```bash
npm run dev
```
Truy cập: [http://localhost:3000](http://localhost:3000)

---

## 📂 Cấu trúc thư mục (Folder Structure)

*   `src/app`: Định tuyến App Router.
    *   `(dashboard)`: Toàn bộ trang chức năng chính (auth-protected).
    *   `(auth)`: Trang Đăng nhập/Đăng ký.
    *   `api`: Các Endpoint server-side (AI analyze, Auth API).
    *   `actions`: Server Actions (Cấp độ logic DB).
*   `src/components`: Các thành phần giao diện tái sử dụng.
*   `src/lib`: Cấu hình Prisma, Auth, Utils.
*   `prisma`: Schema định nghĩa cơ sở dữ liệu.
*   `public`: Tài sản tĩnh, Icons PWA, Manifest.

---

## 🤝 Quy trình phát triển (Backend Patterns)

*   **Server Actions**: Luôn sử dụng Server Actions cho các thao tác CRUD và Transaction phức tạp (đặt tại `src/app/actions`).
*   **Type Safety**: Luôn định nghĩa types cho dữ liệu trả về từ DB.
*   **UI Consistency**: Sử dụng hệ thống shadcn và theme-tokens có sẵn trong `index.css`.
*   **Auth**: Luôn bảo vệ Route trong file `middleware.ts` (nếu cần) hoặc kiểm tra `auth()` trong layout/page.

---

## 👥 Nhóm phát triển (The Team)

Dự án được khởi tạo và xây dựng kiến trúc bởi **[Tên Của Bạn]**.
Các thành viên tiếp tục phát triển:
1.  **Thành viên 1**
2.  **Thành viên 2**
3.  **Thành viên 3**
4.  **Thành viên 4**

---

## 📄 Giấy phép (License)
Dự án được phát triển nội bộ cho mục đích học tập và công việc nhóm.
