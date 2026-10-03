# Checklist Tối Ưu Sản Phẩm Cho Hackathon

> Trọng tâm: Tạo hiệu ứng "WOW", demo mượt mà, nhấn mạnh Core Value (AI & Dynamic Pricing), bỏ qua các tính năng rườm rà của sản phẩm thực tế (thanh toán, chống gian lận, quản lý dài hạn).

## 1. Nâng cấp cốt lõi (Đã hoàn thành) ✅
- [x] Chụp/Tải ảnh thật kết nối API AI.
- [x] Merchant được quyền sửa kết quả AI trước khi đăng.
- [x] Nhận diện chính xác dựa trên danh mục (Catalog-based RAG).

## 2. Tối ưu Trải nghiệm Demo & Hiệu ứng FOMO (Ưu tiên Cao) 🔥
- [ ] **Hiển thị lộ trình giá trực quan:** Đồ thị hoặc thanh tiến trình cho thấy giá sẽ giảm đến mức nào tiếp theo.
- [ ] **Hiệu ứng thời gian thực:** Flash/highlight nhấp nháy hoặc âm thanh nhẹ khi giá nhảy xuống mức mới để tạo cảm giác giằng co và hối thúc người mua.
- [ ] **Mã QR nhận hàng giả lập:** Nhấn "Đặt trước" -> Hiện QR Code ngay lập tức để hoàn thành luồng (không cần thanh toán hay đăng nhập phức tạp).

## 3. Giao diện & Trải nghiệm (UI/UX Polish) 🎨
- [ ] **Mobile-first cho Storefront:** Đảm bảo giao diện người mua cực kỳ mượt và bắt mắt trên màn hình điện thoại (ban giám khảo thường quét QR test trực tiếp bằng điện thoại của họ).
- [ ] **Điều hướng liền mạch:** Thêm nút chuyển đổi nhanh (Toggle) giữa góc nhìn "Người bán" (Merchant) và "Người mua" (Storefront) để demo qua lại không bị gián đoạn.
- [ ] **Làm nổi bật thông điệp môi trường (Impact):** Thêm thẻ chỉ số "Đã giải cứu X kg thức ăn" và "Giảm Y lượng CO2" ở trang chủ để tăng điểm cộng về mặt xã hội.

## 4. Kịch bản Pitching & Vận hành Demo ⚙️
- [ ] **Cơ chế "Time-lapse" (Ép giá giảm):** Thay vì bắt giám khảo đợi 5-10 phút để thấy giá giảm, cần có một nút ẩn (hoặc phím tắt) để kích hoạt giảm giá ngay lập tức, phô diễn luồng FOMO.
- [ ] **Nút "Reset Demo":** Một endpoint/nút ẩn giúp xóa các đơn đã đặt và phục hồi số lượng kho về ban đầu để nhanh chóng chuẩn bị cho lượt pitch tiếp theo.
- [ ] **Dữ liệu mẫu rực rỡ (Seed Data):** Chuẩn bị sẵn một tập dữ liệu cửa hàng, món ăn có hình ảnh sắc nét, tên gọi hấp dẫn để giao diện luôn ở trạng thái tốt nhất.
