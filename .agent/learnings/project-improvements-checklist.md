# Checklist Cải Tiến Dự Án Arbiter

> Danh sách các tính năng và cải tiến cần thực hiện để hoàn thiện dự án.
> Trạng thái: ✅ (Đã hoàn thành) | ❌ (Chưa hoàn thành)

## 1. Nâng cấp cốt lõi: Luồng AI & Merchant (Ưu tiên cao nhất)
- [x] ✅ **Cho phép chụp ảnh / tải ảnh thật:** Gỡ bỏ hoàn toàn luồng giả lập (mock), dùng 100% input camera/upload kết nối API `/api/analyze`.
- [x] ✅ **Cho phép Merchant chỉnh sửa (Override) kết quả AI:** Form cho phép sửa số lượng, giá gốc, giá sàn trước khi push lên Storefront.
- [x] ✅ **Lưu và hiển thị ảnh sản phẩm:** Cập nhật DB schema (`imageUrl` cho `ClearanceItem`) và render ảnh trên Storefront.
- [x] ✅ **Nhận diện dựa trên Danh mục (Catalog-based Recognition):** Áp dụng RAG nhúng danh mục `Product` từ DB vào Prompt, đảm bảo AI map đúng sản phẩm và lấy đúng giá gốc, loại bỏ hoàn toàn việc "đoán mò".
- [x] ✅ **Can thiệp lộ trình giá (Price Decay Override):** Tự động điều chỉnh mốc giá đáy của AI sao cho khớp với Giá sàn tùy chỉnh của người bán trước khi tạo đợt xả kho.

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

## 6. Chống trục lợi & Gian lận (Anti-Hoarding)
- [ ] ❌ **Thanh toán Online / Đặt cọc:** Yêu cầu thanh toán trước khi giữ chỗ để đánh vào kinh tế của người cố tình spam.
- [ ] ❌ **Hệ thống điểm tín nhiệm (Penalty System):** Khóa chức năng đặt hàng nếu người dùng có lịch sử "đặt nhưng không lấy" quá 2 lần.
- [ ] ❌ **Giới hạn Quota giữ chỗ:** Mỗi user chỉ được giữ tối đa 1 đơn hoặc 2 mặt hàng cùng lúc, phải hoàn tất đơn cũ mới được đặt tiếp.
- [ ] ❌ **Chống đầu cơ giá (Anti-Snipe):** Khi một đơn quá hạn bị hủy và hoàn lên kệ, khóa mức giá của món hàng đó ở mốc giá lúc bị đặt, không cho phép giảm thêm.
