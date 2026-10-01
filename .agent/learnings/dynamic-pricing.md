# Dynamic Pricing

> Các chiến thuật và kiến trúc kỹ thuật dành cho hệ thống AI định giá động trong môi trường Hackathon.

**Cập nhật lần cuối:** 2026-10-01

## Architecture

### Tối ưu gọi LLM (One-time Pricing Schedule)
Thay vì gọi AI liên tục mỗi chu kỳ cập nhật giá (gây trễ mạng, tốn tiền, dễ dính rate limit), hãy cấu trúc AI thành một bộ phận "Hoạch định". 
- AI chạy **1 lần duy nhất** lúc khởi tạo mặt hàng.
- AI trả về cấu trúc JSON `decay_schedule` (ví dụ: mảng các mốc thời gian và giá tương ứng).
- Client-side tự động nội suy (interpolate) giá trị hiện tại dựa trên `decay_schedule` và thời gian máy khách. Điều này giúp hệ thống chạy mượt mà, thời gian thực mà không phụ thuộc vào kết nối server.

## Bugs & Solutions

### Tránh vấp lỗi khi quay Demo (Demo Backup Mode)
Khi quay video demo hoặc thuyết trình trực tiếp, việc phụ thuộc vào tính năng phần cứng (camera) hoặc upload file dung lượng lớn có thể gây lỗi API bất chợt. 
- **Solution:** Luôn chuẩn bị sẵn các nút "Mock Data / Demo Backup" (vd: dùng ảnh mẫu có sẵn). Khi click sẽ gọi thẳng API với payload chuẩn, giúp bài thuyết trình mượt mà 100%.

## How-To

### Giả lập thời gian cho các ứng dụng Time-based (Time Simulator Slider)
Với các ứng dụng phụ thuộc vào thời gian dài (như giảm giá dần trong 2 tiếng), không thể bắt ban giám khảo chờ đợi.
- Cách làm: Thêm một biến `simulatedOffsetMinutes` vào hook hoặc logic tính toán thời gian. 
- Dùng thẻ `<input type="range">` cho phép người dùng (hoặc người demo) kéo thanh trượt để cộng dồn số phút tương lai vào `Date.now()`. Mọi UI thay đổi giá sẽ phản ứng ngay lập tức theo thanh trượt này.

## Patterns

### Explainable AI trong UI (Giải trình lý do AI)
BGK luôn đánh giá cao các hệ thống không chỉ là "Hộp đen" (Blackbox).
- Yêu cầu AI trả về thêm một trường `ai_rationale` trong schema (Vd: *"Trời mưa, tồn nhiều -> giảm giá sớm"*).
- In trường này lên UI một cách nổi bật để chứng minh AI thực sự phân tích logic kinh doanh chứ không chỉ là một hàm toán học.
