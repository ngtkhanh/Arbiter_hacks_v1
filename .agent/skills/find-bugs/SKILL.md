---
name: find-bugs
description: Tìm bug, lỗ hổng bảo mật và vấn đề chất lượng code trong các thay đổi của nhánh local. Sử dụng khi được yêu cầu review thay đổi, tìm bug, review bảo mật, hoặc kiểm tra code trên nhánh hiện tại.
risk: unknown
source: community
---

# Tìm Bug

Review các thay đổi trên nhánh này để tìm bug, lỗ hổng bảo mật và vấn đề chất lượng code.

## Khi nào sử dụng
- Bạn cần review tập trung vào bug, vấn đề bảo mật, hoặc thay đổi code rủi ro.
- Tác vụ liên quan đến kiểm tra diff của nhánh hiện tại thay vì triển khai hành vi mới.
- Bạn muốn quy trình review có cấu trúc với xác minh dựa trên checklist cho các file đã thay đổi.

## Giai đoạn 1: Thu thập đầu vào đầy đủ

1. Lấy TOÀN BỘ diff: `git diff $(gh repo view --json defaultBranchRef --jq '.defaultBranchRef.name')...HEAD`
2. Nếu đầu ra bị cắt ngắn, đọc từng file đã thay đổi riêng lẻ cho đến khi bạn đã xem mọi dòng thay đổi
3. Liệt kê tất cả các file được sửa đổi trong nhánh này trước khi tiến hành

## Giai đoạn 2: Lập bản đồ bề mặt tấn công

Cho mỗi file đã thay đổi, xác định và liệt kê:

* Tất cả đầu vào từ người dùng (request params, headers, body, URL components)
* Tất cả truy vấn database
* Tất cả kiểm tra xác thực/phân quyền
* Tất cả thao tác session/state
* Tất cả cuộc gọi bên ngoài
* Tất cả thao tác mã hóa

## Giai đoạn 3: Checklist bảo mật (kiểm tra MỌI mục cho MỌI file)

* [ ] **Injection**: SQL, command, template, header injection
* [ ] **XSS**: Tất cả đầu ra trong template đã được escape đúng cách?
* [ ] **Xác thực**: Kiểm tra auth trên tất cả thao tác được bảo vệ?
* [ ] **Phân quyền/IDOR**: Kiểm soát truy cập đã được xác minh, không chỉ auth?
* [ ] **CSRF**: Các thao tác thay đổi trạng thái đã được bảo vệ?
* [ ] **Race conditions**: TOCTOU trong bất kỳ pattern đọc-rồi-ghi nào?
* [ ] **Session**: Fixation, expiration, secure flags?
* [ ] **Mã hóa**: Secure random, thuật toán đúng, không có secrets trong logs?
* [ ] **Lộ thông tin**: Thông báo lỗi, logs, timing attacks?
* [ ] **DoS**: Thao tác không giới hạn, thiếu rate limits, cạn kiệt tài nguyên?
* [ ] **Logic nghiệp vụ**: Trường hợp biên, vi phạm state machine, tràn số?

## Giai đoạn 4: Xác minh

Cho mỗi vấn đề tiềm ẩn:

* Kiểm tra xem nó đã được xử lý ở nơi khác trong code đã thay đổi chưa
* Tìm kiếm test hiện có bao phủ kịch bản đó
* Đọc ngữ cảnh xung quanh để xác minh vấn đề là thực sự

## Giai đoạn 5: Kiểm tra trước kết luận

Trước khi hoàn thiện, bạn PHẢI:

1. Liệt kê mọi file bạn đã review và xác nhận bạn đã đọc hoàn toàn
2. Liệt kê mọi mục checklist và ghi chú bạn đã tìm thấy vấn đề hay xác nhận sạch
3. Liệt kê bất kỳ khu vực nào bạn KHÔNG THỂ xác minh đầy đủ và lý do
4. Chỉ sau đó mới đưa ra kết quả cuối cùng

## Định dạng đầu ra

**Ưu tiên**: lỗ hổng bảo mật > bug > chất lượng code

**Bỏ qua**: vấn đề phong cách/định dạng

Cho mỗi vấn đề:

* **File:Dòng** - Mô tả ngắn gọn
* **Mức độ**: Nghiêm trọng/Cao/Trung bình/Thấp
* **Vấn đề**: Sai ở đâu
* **Bằng chứng**: Tại sao đây là vấn đề thực sự (chưa được sửa, không có test hiện có, v.v.)
* **Cách sửa**: Đề xuất cụ thể
* **Tham khảo**: OWASP, RFCs, hoặc tiêu chuẩn khác nếu áp dụng

Nếu bạn không tìm thấy gì đáng kể, hãy nói như vậy - đừng bịa ra vấn đề.

Không thực hiện thay đổi - chỉ báo cáo kết quả. Tôi sẽ quyết định xử lý gì.

## Giới hạn
- Chỉ sử dụng skill này khi tác vụ rõ ràng phù hợp với phạm vi mô tả ở trên.
- Không coi kết quả đầu ra là thay thế cho việc xác thực, kiểm thử hoặc review chuyên gia theo môi trường cụ thể.
- Dừng lại và hỏi làm rõ nếu thiếu đầu vào cần thiết, quyền truy cập, ranh giới an toàn hoặc tiêu chí thành công.
