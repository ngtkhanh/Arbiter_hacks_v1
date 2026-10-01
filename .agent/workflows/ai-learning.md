---
description: Quy trình AI Learning Mục đích  Trích xuất kiến thức có thể tái sử dụng từ task hiện tại và lưu lại để AI có thể sử dụng trong các task tương lai.
---

# Quy trình AI Learning

## Mục đích

Trích xuất kiến thức có thể tái sử dụng từ task hiện tại và lưu lại để AI có thể sử dụng trong các task tương lai.

AI Learning là **bộ nhớ dành cho AI**.

Nó phải trả lời được câu hỏi:

> "Nếu AI gặp một task tương tự trong tương lai, cần nhớ điều gì để làm nhanh hơn và chính xác hơn?"

---

# 1. INPUT

Nhận các thông tin:

* Task hiện tại
* Feature/module liên quan
* Các file đã thay đổi
* Quyết định quan trọng
* Bug và solution
* Pattern mới
* Learning hiện có liên quan

Không yêu cầu toàn bộ conversation nếu các thông tin cần thiết đã có sẵn.

---

# 2. XÁC ĐỊNH FEATURE

Xác định feature/module chính mà task đại diện.

Sử dụng tên ổn định dạng kebab-case:

```text
authentication
payment
user-profile
push-notification
database-migration
```

Ưu tiên nguyên tắc:

> Một feature → một learning file.

Đường dẫn:

```text
.agents/learnings/<feature-name>.md
```

Không tạo nhiều file cho cùng một feature nếu không có ranh giới feature rõ ràng.

---

# 3. TARGETED RETRIEVAL

Trước khi ghi learning:

1. Tìm learning file đúng feature.
2. Tìm knowledge liên quan trực tiếp.
3. Chỉ tìm cross-cutting knowledge khi task thực sự cần.

Không load toàn bộ `.agents/learnings/` mặc định.

Sử dụng cơ chế search/retrieval mà môi trường hiện tại cung cấp.

---

# 4. SOURCE OF TRUTH

Learning file chỉ là kiến thức hỗ trợ.

**Code và configuration hiện tại của project là source of truth.**

Trước khi giữ lại một learning cũ:

* Kiểm tra nó còn đúng với project hiện tại hay không.
* Sửa kiến thức đã lỗi thời.
* Không giữ lại assumption sai chỉ vì nó đã tồn tại trong learning file.

---

# 5. TRÍCH XUẤT KIẾN THỨC CÓ THỂ TÁI SỬ DỤNG

Chỉ trích xuất thông tin có khả năng giúp ích cho task tương lai.

Ưu tiên:

## Architecture

Cấu trúc quan trọng, responsibility, dependency hoặc boundary.

## Bugs & Solutions

Failure không hiển nhiên, root cause và solution đáng tin cậy.

## How-To

Quy trình có thể tái sử dụng cho những thao tác lặp lại.

## Patterns

Implementation pattern, convention hoặc design decision có thể tái sử dụng.

Không lưu:

* Tên biến tạm thời
* Giá trị one-off
* Conversation chatter
* Ý kiến cá nhân không có technical value
* Chi tiết sẽ nhanh chóng lỗi thời
* Thông tin đã tồn tại dưới dạng entry tốt hơn

---

# 6. MERGE LEARNING HIỆN CÓ

Nếu feature file đã tồn tại:

1. Đọc file hiện tại.
2. So sánh knowledge mới với các entry hiện có.
3. Cùng topic → cập nhật entry cũ.
4. Topic mới → thêm entry mới.
5. Knowledge lỗi thời → sửa hoặc loại bỏ.
6. Knowledge trùng lặp → merge.
7. Giữ lại historical context quan trọng nếu nó vẫn hữu ích.
8. Cập nhật ngày sửa đổi.

Không append mù quáng.

---

# 7. IDEMPOTENCY

Nếu workflow được chạy hai lần cho cùng một task, không được tạo duplicate entry.

Trước khi ghi:

```text
Kiến thức tương đương đã tồn tại chưa?
```

Nếu có:

```text
→ Update / Merge
```

Không được:

```text
→ Append duplicate
```

---

# 8. CẤU TRÚC FILE

Sử dụng cấu trúc:

```markdown
# <Tên Feature>

> Mô tả ngắn.

**Cập nhật lần cuối:** YYYY-MM-DD

## Architecture

### <Chủ đề>

Kiến thức có thể tái sử dụng.

## Bugs & Solutions

### <Chủ đề>

Kiến thức có thể tái sử dụng.

## How-To

### <Chủ đề>

Kiến thức có thể tái sử dụng.

## Patterns

### <Chủ đề>

Kiến thức có thể tái sử dụng.
```

Mỗi entry thông thường không quá khoảng 150 từ.

Có thể giữ technical terminology bằng English khi đó là thuật ngữ chuẩn hoặc rõ nghĩa hơn tiếng Việt.

---

# 9. CHẤT LƯỢNG KNOWLEDGE

Một entry tốt phải:

* Có khả năng tái sử dụng.
* Đủ cụ thể để AI có thể hành động.
* Tương đối ổn định theo thời gian.
* Khớp với code hiện tại.
* Dễ được tìm kiếm.
* Không chứa conversation context không cần thiết.

Ưu tiên cách viết:

```text
Khi X xảy ra, kiểm tra Y vì Z.
```

thay vì:

```text
Chúng ta đã thử rất nhiều thứ và cuối cùng thay đổi...
```

Chi tiết debugging và câu chuyện của quá trình xử lý thuộc về Human Learning.

---

# 10. QUẢN LÝ KÍCH THƯỚC

Không sử dụng một giới hạn cứng để xóa knowledge.

Khi feature file lớn dần:

1. Tìm information trùng lặp.
2. Merge các entry chồng lấn.
3. Loại bỏ knowledge đã lỗi thời.
4. Gộp các pattern lặp lại.
5. Giữ lại decision và constraint quan trọng.
6. Compact các entry dài nhưng không làm mất ý nghĩa.

Nếu file trở nên khó retrieval:

* Xem xét chia theo boundary feature rõ ràng.
* Không chia file chỉ vì số lượng dòng tăng.

Mục tiêu là **giảm redundancy**, không phải xóa knowledge có giá trị.

---

# 11. GHI FILE

Sau khi extract và merge:

1. Rewrite toàn bộ feature file.
2. Giữ cấu trúc 4 section.
3. Không tạo duplicate.
4. Cập nhật ngày sửa đổi.
5. Lưu vào:

```text
.agents/learnings/<feature-name>.md
```

Không tạo file mới nếu feature file phù hợp đã tồn tại.

---

# 12. KẾT QUẢ

Báo cáo:

```text
AI Learning: created | updated | skipped
Feature: <feature-name>
Entries created: <number>
Entries updated: <number>
Entries removed/merged: <number>
```

Nếu không có reusable knowledge:

```text
AI Learning: skipped
Reason: Task không tạo ra kiến thức có khả năng tái sử dụng.
```
