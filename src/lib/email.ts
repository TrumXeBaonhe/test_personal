import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

function getOtpEmailHtml(code: string, purpose: "LOGIN" | "PASSWORD_CHANGE", name?: string) {
  const purposeText =
    purpose === "LOGIN" ? "xác nhận đăng nhập từ thiết bị mới" : "xác nhận đổi mật khẩu";
  const purposeIcon = purpose === "LOGIN" ? "🔐" : "🔑";

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mã OTP SpendWise</title>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:480px;margin:40px auto;background:#1e293b;border-radius:24px;overflow:hidden;border:1px solid #334155;">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#6d28d9,#4f46e5,#0891b2);padding:32px 24px;text-align:center;">
      <div style="font-size:40px;margin-bottom:8px;">${purposeIcon}</div>
      <h1 style="color:#fff;margin:0;font-size:22px;font-weight:800;letter-spacing:-0.5px;">SpendWise Security</h1>
      <p style="color:rgba(255,255,255,0.7);margin:6px 0 0;font-size:13px;">Mã xác thực bảo mật</p>
    </div>

    <!-- Body -->
    <div style="padding:32px 28px;">
      <p style="color:#94a3b8;font-size:14px;margin:0 0 8px;">Xin chào${name ? ` <strong style="color:#e2e8f0;">${name}</strong>` : ""},</p>
      <p style="color:#cbd5e1;font-size:14px;margin:0 0 28px;line-height:1.6;">
        Bạn đã yêu cầu <strong style="color:#a78bfa;">${purposeText}</strong>.<br>
        Đây là mã OTP của bạn:
      </p>

      <!-- OTP Code -->
      <div style="background:#0f172a;border:2px solid #6d28d9;border-radius:16px;padding:24px;text-align:center;margin-bottom:28px;">
        <div style="letter-spacing:12px;font-size:40px;font-weight:900;color:#a78bfa;font-family:'Courier New',monospace;">
          ${code}
        </div>
        <p style="color:#64748b;font-size:12px;margin:12px 0 0;">Mã có hiệu lực trong <strong style="color:#f59e0b;">10 phút</strong></p>
      </div>

      <!-- Warning -->
      <div style="background:#422006;border:1px solid #92400e;border-radius:12px;padding:14px 16px;margin-bottom:24px;">
        <p style="color:#fcd34d;font-size:12px;margin:0;line-height:1.5;">
          ⚠️ <strong>Không chia sẻ mã này với bất kỳ ai.</strong> SpendWise sẽ không bao giờ yêu cầu mã OTP qua điện thoại hoặc chat.
        </p>
      </div>

      <p style="color:#475569;font-size:12px;margin:0;line-height:1.6;">
        Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email này và <strong style="color:#f87171;">đổi mật khẩu ngay</strong> để bảo vệ tài khoản.
      </p>
    </div>

    <!-- Footer -->
    <div style="border-top:1px solid #1e293b;padding:16px 28px;text-align:center;background:#0f172a;">
      <p style="color:#334155;font-size:11px;margin:0;">© 2025 SpendWise · Ứng dụng quản lý tài chính cá nhân</p>
    </div>
  </div>
</body>
</html>`;
}

export async function sendOtpEmail(
  to: string,
  code: string,
  purpose: "LOGIN" | "PASSWORD_CHANGE",
  name?: string
) {
  const subject =
    purpose === "LOGIN"
      ? `[SpendWise] Mã OTP đăng nhập thiết bị mới: ${code}`
      : `[SpendWise] Mã OTP xác nhận đổi mật khẩu: ${code}`;

  await transporter.sendMail({
    from: `"SpendWise Security" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html: getOtpEmailHtml(code, purpose, name),
  });
}
