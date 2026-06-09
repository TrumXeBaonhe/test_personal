#!/usr/bin/env bash
# 🚀 VERCEL UPDATE GUIDE - DATABASE_URL FIX

# DATABASE_URL MỚI (cập nhật Apr 9, 2026):
# ==========================================

DATABASE_URL_NEW="postgresql://neondb_owner:npg_rsBv76axbnuV@ep-restless-frost-a12mmvhk-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# ✅ BƯỚC 1: Update Vercel Environment Variables
# ============================================
# 1. Vào: https://vercel.com/dashboard
# 2. Chọn: spendwise5 project
# 3. Vào: Settings → Environment Variables
# 4. Tìm: DATABASE_URL
# 5. Click: Edit
# 6. Copy & Paste value dưới đây:

# 📋 COPY VALUE NÀY:
postgresql://neondb_owner:npg_rsBv76axbnuV@ep-restless-frost-a12mmvhk-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# ✅ BƯỚC 2: Redeploy
# ==================
# 1. Vào: Deployments tab
# 2. Click: Latest deployment
# 3. Click: "..." → Redeploy
# 4. Wait: Status = "Ready" ✓ (3-5 minutes)

# ✅ BƯỚC 3: Test
# ===============
# 1. Visit: https://spendwise5.vercel.app
# 2. F5 Refresh
# 3. Xóa cache: Ctrl+Shift+Delete
# 4. Test login/features

# ✅ HOÀN THÀNH!
# Website sẽ hoạt động bình thường
