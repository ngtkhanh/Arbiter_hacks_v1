---
description: Quy trình Human Learning Mục đích  Tạo một tài liệu learning chi tiết cho developer sau những task có reasoning, debugging, design hoặc decision-making đáng kể.
---

# Quy trình Human Learning

## Mục đích

Tạo một tài liệu learning chi tiết cho developer sau những task có reasoning, debugging, design hoặc decision-making đáng kể.

Human Learning là **bộ nhớ dành cho developer**.

Nó phải trả lời được câu hỏi:

> "Một developer khác đọc lại task này sẽ học được gì, đặc biệt là những thứ không thể nhìn thấy chỉ bằng cách đọc code?"

---

# 1. KHI NÀO CẦN TẠO

Tạo Human Learning khi task có ít nhất một trong các dấu hiệu:

* Có thay đổi architecture hoặc design.
* Có trade-off quan trọng.
* Root cause không hiển nhiên.
* Cần debugging đáng kể.
* Có dead end/approach bị loại bỏ.
* Cùng một failure xảy ra nhiều lần.
* Có insight về security hoặc performance.
* Phát hiện reasoning pattern có thể tái sử dụng.
* Có bài học quan trọng cho developer khác.

Bỏ qua Human Learning với các task thuần cơ học như:

* Đổi tên đơn giản.
* Formatting.
* Thay đổi text đơn giản.
* Các chỉnh sửa lặp lại không cần reasoning đáng kể.
* Task không tạo ra insight có giá trị.

---

# 2. INPUT

Nhận các thông tin:

* Mục tiêu task
* Understanding ban đầu
* Final approach
* Các alternative đã cân nhắc
* Decisions
* Trade-offs
* Debugging history
* Failed approaches
* Root cause
* Final solution
* Verification result
* Transferable lessons

Không tự bịa reasoning hoặc sự kiện chưa thực sự xảy ra trong task.

---

# 3. VỊ TRÍ FILE

Tạo file:

```text
.agents/learnings/human/FOR_DEVELOPER_YYYY-MM-DD_<task-name>.md
```

Sử dụng task name ngắn, dạng kebab-case.

Ví dụ:

```text
FOR_DEVELOPER_2026-10-01-fix-login-race-condition.md
```

---

# 4. CẤU TRÚC BẮT BUỘC

Tài liệu phải có 9 phần sau:

## 1. Approach & Reasoning

Giải thích:

* Vấn đề ban đầu là gì?
* Đã điều tra như thế nào?
* Tại sao chọn hướng cuối cùng?
* Có assumption quan trọng nào?

Viết như một developer có kinh nghiệm đang giải thích lại task cho developer khác.

---

## 2. Roads Not Taken

Giải thích các alternative đáng kể đã được cân nhắc nhưng không chọn.

Với mỗi alternative:

* Approach là gì?
* Tại sao ban đầu nó có vẻ hợp lý?
* Tại sao không chọn?
* Trong trường hợp nào nó vẫn có thể phù hợp?

Không cần liệt kê những alternative không có ý nghĩa.

---

## 3. How Things Connect

Giải thích mối quan hệ giữa:

* Components
* Modules
* Data
* State
* Dependencies
* Lifecycle
* External systems

Tập trung vào mental model giúp developer hiểu và debug hệ thống trong tương lai.

---

## 4. Tools & Methods

Giải thích các:

* Debugging technique
* Search technique
* Testing technique
* Logs
* Commands
* Development tools
* Investigation methods

Không chỉ ghi command; giải thích **tại sao phương pháp đó hữu ích**.

---

## 5. Tradeoffs

Giải thích các quyết định quan trọng như:

* Simplicity vs flexibility
* Performance vs maintainability
* Safety vs convenience
* Abstraction vs direct implementation
* Short-term vs long-term cost

Làm rõ hậu quả của mỗi quyết định.

---

## 6. Mistakes & Dead Ends

Ghi lại những failure có giá trị học tập.

Với mỗi failure:

* Đã thử gì?
* Tại sao cách đó ban đầu có vẻ hợp lý?
* Tại sao nó thất bại?
* Evidence nào cho thấy nó sai?
* Đã học được gì?

Không che giấu những mistake hữu ích.

---

## 7. Future Pitfalls

Giải thích những điều developer tương lai rất dễ làm sai.

Có thể bao gồm:

* Common misunderstanding
* Hidden dependency
* Lifecycle issue
* Edge case
* Configuration trap
* Regression risk

---

## 8. Expert vs Beginner

Giải thích cách một developer có kinh nghiệm sẽ tiếp cận vấn đề khác với beginner như thế nào.

Tập trung vào:

* Họ sẽ kiểm tra gì trước?
* Họ sẽ nghi ngờ assumption nào?
* Họ sẽ nhận ra signal nào?
* Họ sẽ tránh mistake nào?

Không biến phần này thành đánh giá con người; tập trung vào khác biệt trong phương pháp tiếp cận.

---

## 9. Transferable Lessons

Trích xuất những bài học có thể áp dụng ngoài task cụ thể.

Ví dụ:

* Debugging heuristic
* Architecture principle
* Investigation strategy
* Testing strategy
* Decision-making pattern

Phần này phải hữu ích ngay cả khi developer đang làm một feature khác.

---

# 5. PHONG CÁCH VIẾT

**Luôn viết bằng tiếng Việt.**

Có thể sử dụng technical English terminology khi đó là thuật ngữ chuẩn hoặc rõ nghĩa hơn tiếng Việt.

Giọng văn nên giống:

> Một developer có kinh nghiệm đang ngồi giải thích lại task cho một developer khác.

Ưu tiên:

* Ví dụ cụ thể.
* Những câu chuyện ngắn từ task thực tế.
* Analogy khi hữu ích.
* Giải thích cause → effect.
* Thảo luận trung thực về mistake.
* Giải thích tại sao quyết định được đưa ra.

Tránh:

* Văn phong textbook.
* Lời khuyên motivational chung chung.
* Giải thích phức tạp một cách không cần thiết.
* Chi tiết được tự bịa.
* Nội dung không có nguồn gốc từ task.

---

# 6. NGUYÊN TẮC CHẤT LƯỢNG

Tài liệu phải:

1. Dựa trên task thực tế.
2. Giải thích reasoning chứ không chỉ kết quả.
3. Giữ lại failed approach quan trọng.
4. Giải thích tại sao decision được đưa ra.
5. Phân biệt fact với assumption.
6. Không lặp lại nội dung của AI Learning.
7. Chứa lesson mà developer thực sự có thể áp dụng lại.

Sự khác biệt cốt lõi:

```text
AI Learning
→ "AI cần nhớ gì?"

Human Learning
→ "Developer cần hiểu gì?"
```

---

# 7. KẾT QUẢ

Nếu tạo Human Learning:

```text
Human Learning: created
File: .agents/learnings/human/FOR_DEVELOPER_YYYY-MM-DD_<task-name>.md
```

Nếu task không có đủ reasoning, debugging, design hoặc transferable insight:

```text
Human Learning: skipped
Reason: Task không tạo ra learning có giá trị đáng kể cho developer.
```
