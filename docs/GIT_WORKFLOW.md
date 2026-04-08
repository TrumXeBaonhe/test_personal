# Git Workflow Guide

## Quy trình làm việc chuẩn

### 1. Chuẩn bị (Setup)

```bash
# Clone repository
git clone <repository-url>

# Tạo virtual environment
python -m venv venv

# Kích hoạt
venv\Scripts\activate  # Windows

# Cài dependencies
pip install -r requirements.txt
```

### 2. Bắt đầu feature mới

```bash
# Update code mới nhất
git pull origin main

# Tạo branch
git checkout -b feature/ten-feature
# Hoặc: git checkout -b fix/ten-fix
```

### 3. Phát triển

```bash
# Thêm file vào staging
git add .

# Commit với message rõ ràng
git commit -m "feat: Thêm tính năng ghi chi tiêu"
```

### 4. Gửi Pull Request

```bash
# Push code lên server
git push origin feature/ten-feature
```

Sau đó:
1. Vào GitHub
2. Tạo Pull Request
3. Viết mô tả chi tiết
4. Chờ review từ Team Lead

### 5. Merge

Sau khi được approve:
```bash
# Merge trên GitHub (hoặc local)
git checkout main
git pull origin main
git merge feature/ten-feature
```

## Quy tắc Commit Message

```
feat: Thêm tính năng mới
fix: Sửa lỗi bug
docs: Cập nhật tài liệu
style: Định dạng code
refactor: Tái cấu trúc code
test: Thêm test cases
chore: Các thay đổi khác
```

## Tránh conflicts

1. **Pull thường xuyên**: `git pull origin main` 
2. **Commit nhỏ và thường**: Tránh conflict lớn
3. **Giao tiếp với nhóm**: Báo cho team biết khi làm việc với file chung

## Các lệnh hữu ích

```bash
# Xem status
git status

# Xem commit history
git log --oneline

# Xem branches
git branch -a

# Xem thay đổi
git diff

# Hủy thay đổi chưa commit
git checkout -- .

# Reset về commit trước
git reset --hard HEAD~1
```

## Xử lý Conflicts

Nếu xuất hiện conflict:

```bash
# 1. Resolve conflicts trong files
# 2. Sau khi fix, stage files
git add .

# 3. Commit merge
git commit -m "Merge branch 'main' into feature/x"

# 4. Push
git push origin feature/x
```
