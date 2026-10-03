# Checklist Cải Tiến Dự Án Arbiter

> Danh sách các tính năng và cải tiến cần thực hiện để hoàn thiện dự án.
> Trạng thái: ✅ (Đã hoàn thành) | ❌ (Chưa hoàn thành)

## 1. Nâng cấp cốt lõi: Luồng AI & Merchant (Ưu tiên cao nhất)
- [ ] ❌ **Cho phép chụp ảnh / tải ảnh thật:** Thêm input camera/upload ảnh thực tế kết nối vào API `/api/analyze` (thay vì chỉ dùng nút mock).
- [ ] ❌ **Cho phép Merchant chỉnh sửa (Override) kết quả AI:** Form cho phép sửa tên, số lượng, thời gian, giá sàn trước khi push lên Storefront.
- [ ] ❌ **Lưu và hiển thị ảnh sản phẩm:** Cập nhật DB schema (`imageUrl` cho `ClearanceItem`) và render ảnh trên Storefront.

## 2. Trải nghiệm người mua (Storefront) & Yếu tố kích cầu (FOMO)
- [ ] ❌ **Hiển thị biểu đồ / mốc lộ trình giá (Price Decay Curve):** Hiển thị trực quan các mốc giá tiếp theo để tạo tâm lý giằng co cho khách.
- [ ] ❌ **Hiệu ứng & âm thanh khi giá biến động:** Flash highlight hoặc âm thanh nhẹ khi giá vừa tụt bước mới.
- [ ] ❌ **Tạo mã QR cho đơn giữ chỗ:** Render QR code hiển thị mã nhận hàng (pickup code).

## 3. Vận hành & Logic Backend
- [ ] ❌ **Cơ chế tự động hoàn kho khi hết hạn (Auto-release expired stock):** Chuyển status đơn quá hạn (20 phút không lấy) sang `EXPIRED` và cộng lại `currentQuantity` vào kho.
- [ ] ❌ **Lịch sử đơn hàng & Bộ lọc đơn:** Tab xem danh sách các đơn đã `COMPLETED` và `CANCELLED` để đối soát doanh thu.

## 4. Báo cáo tác động (Impact & Analytics)
- [ ] ❌ **Thẻ chỉ số xanh (Food Waste Impact Counter):** Hiển thị tổng số lượng giải cứu, doanh thu vớt vát được, lượng CO2 giảm thiểu.

## 5. Tối ưu UI/UX & Điều hướng
- [ ] ❌ **Header / Navigation chung:** Thêm Navbar điều hướng giữa Storefront và Merchant, kèm nút chuyển đổi vai trò.
- [ ] ❌ **Responsive Mobile cho Merchant Dashboard:** Tối ưu layout về 1 cột trên giao diện điện thoại.
