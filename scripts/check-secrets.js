#!/usr/bin/env node
/**
 * 🔐 Credential Security Checker
 * 
 * Script này kiểm tra xem các credentials nhạy cảm có bị lộ trong code không.
 * Chạy trước khi push lên GitHub để đảm bảo an toàn.
 * 
 * Usage: node scripts/check-secrets.js
 */

const fs = require('fs');
const path = require('path');

// Các mẫu cần tìm kiếm
const secretPatterns = [
  { name: 'API Keys', pattern: /api[_-]key['\"]?\s*[:=]\s*['\"]([a-z0-9]{20,})['\"]?/gi },
  { name: 'Database URLs', pattern: /(postgresql|mysql|mongodb):\/\/.*?(password|secret)/gi },
  { name: 'Auth Secrets', pattern: /auth[_-]?secret['\"]?\s*[:=]\s*['\"]([a-z0-9]{20,})['\"]?/gi },
  { name: 'Email Passwords', pattern: /email[_-]?password['\"]?\s*[:=]\s*['\"](.+?)['\"]?/gi },
];

// Các file cần check
const filesToCheck = [
  'src/**/*.{ts,tsx,js,jsx}',
  'app/**/*.{ts,tsx,js,jsx}',
  'lib/**/*.{ts,tsx,js,jsx}',
  'vercel.json',
  'next.config.js',
];

// Các file nên bỏ qua
const ignoreFiles = [
  'node_modules',
  '.next',
  '.env.example',
  '.env',
  '.git',
  'dist',
  'build',
];

let foundSecrets = false;

console.log('🔐 Kiểm Tra Credentials...\n');

// Hàm kiểm tra file
function checkFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    secretPatterns.forEach(({ name, pattern }) => {
      const matches = content.match(pattern);
      if (matches) {
        foundSecrets = true;
        console.log(`❌ ${name} tìm thấy trong: ${filePath}`);
        matches.forEach(match => {
          console.log(`   → ${match.substring(0, 50)}...`);
        });
      }
    });
  } catch (err) {
    // Bỏ qua file không đọc được
  }
}

// Hàm lấy danh sách file
function getFiles(dir = '.') {
  let files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  items.forEach(item => {
    const fullPath = path.join(dir, item.name);
    
    // Bỏ qua các folder ignore
    if (item.isDirectory()) {
      if (!ignoreFiles.some(ignore => fullPath.includes(ignore))) {
        files = [...files, ...getFiles(fullPath)];
      }
    } else {
      // Kiểm tra file
      if (
        fullPath.endsWith('.ts') || 
        fullPath.endsWith('.tsx') || 
        fullPath.endsWith('.js') ||
        fullPath.endsWith('.jsx') ||
        fullPath.endsWith('vercel.json') ||
        fullPath.endsWith('next.config.js')
      ) {
        files.push(fullPath);
      }
    }
  });
  
  return files;
}

// Thực hiện kiểm tra
const files = getFiles();
console.log(`📁 Kiểm tra ${files.length} file...\n`);

files.forEach(file => checkFile(file));

// Kết quả
console.log('\n' + '='.repeat(50));
if (foundSecrets) {
  console.log('❌ CẢNH BÁO: Tìm thấy credentials trong code!');
  console.log('   Vui lòng:');
  console.log('   1. Di chuyển sang .env.local');
  console.log('   2. Import từ process.env thay vì hardcode');
  console.log('   3. Chạy lại script này trước khi push');
  process.exit(1);
} else {
  console.log('✅ OK: Không tìm thấy credentials lộ trong code');
  console.log('   Sẵn sàng push lên GitHub!');
  process.exit(0);
}
