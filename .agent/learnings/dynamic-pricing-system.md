# Kinh nghiệm & Kiến trúc hệ thống AI Dynamic Pricing

## 1. Kiến trúc định giá
- AI (Gemini) chỉ gọi 1 lần khi Merchant tạo đợt xả hàng để sinh mảng `decay_schedule`.
- Client-side tự nội suy giá (Interpolation) theo đồng hồ thực tế để tránh trễ mạng (latency) và tránh nghẽn API rate-limit.
- Có hỗ trợ tính năng thanh trượt Time Simulator để tua nhanh thời gian khi demo.

## 2. Lưu ý về Cơ sở dữ liệu & Cấu hình
- Sử dụng Prisma + SQLite cục bộ (`dev.db`).
- Không tạo hoặc import từ `prisma/config` vì dễ gây lỗi TypeScript compilation.
- Key API của Gemini được cấu hình qua biến môi trường `GEMINI_API_KEY` trong file `.env`.