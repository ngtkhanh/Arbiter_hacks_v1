---

description: Tự động load learnings liên quan từ .agents/learnings/ ở đầu mỗi session
globs: "**/*.{kt,java,xml,gradle,kts}"
trigger: always_on
------------------

# Load Learnings Rule

## Khi nào áp dụng

Rule này áp dụng **tự động** mỗi khi bắt đầu một session hoặc conversation mới liên quan đến dự án này.

---

## Hành vi bắt buộc

### Đầu mỗi session, AI PHẢI:

1. **Đọc danh sách file** trong `.agents/learnings/` (chỉ tên file, KHÔNG đọc nội dung).

2. **Xác định các file có khả năng liên quan** đến task/câu hỏi hiện tại dựa trên tên file.

   Ví dụ:

   ```text
   Task về notification
   → notification.md

   Task về splash screen
   → splash-screen.md

   Task về authentication
   → authentication.md
   ```

   Tên file chỉ được dùng để tạo **candidate list**, không phải là tiêu chí duy nhất để quyết định learning có liên quan.

3. **Kiểm tra nội dung các candidate file** để xác định learning thực sự liên quan đến task.

   Ví dụ:

   ```text
   Task: Fix token refresh

   Candidate từ tên file:
   - authentication.md
   - api.md
   - networking.md

   Sau khi kiểm tra nội dung:
   - authentication.md → liên quan
   - api.md → có section liên quan
   - networking.md → không liên quan

   → Chỉ load knowledge cần thiết từ authentication.md và api.md
   ```

4. **Chỉ đọc nội dung learning thực sự liên quan**.

   Không đọc toàn bộ các file chỉ vì chúng tồn tại trong `.agents/learnings/`.

5. **Nếu task liên quan đến nhiều feature/module**, có thể đọc learning từ nhiều file tương ứng.

6. **Áp dụng ngầm** các learning đã đọc vào việc trả lời/thực thi — không cần hỏi lại những gì đã biết.

---

## Quy tắc

* Nếu `.agents/learnings/` không tồn tại hoặc không có file → bỏ qua, không báo lỗi.
* Nếu learning file rỗng → bỏ qua.
* Không đọc lại cùng một learning nếu đã đọc trong cùng một session, trừ khi cần kiểm tra phần nội dung mới được cập nhật.
* **Không đọc tất cả file learning mặc định.**
* Filename chỉ là **bước lọc đầu tiên**.
* Nội dung learning phải được kiểm tra trước khi quyết định sử dụng.
* Chỉ load phần knowledge thực sự liên quan khi có thể, thay vì đọc toàn bộ file liên quan.
* Nếu learning mâu thuẫn với code/configuration hiện tại, ưu tiên code/configuration hiện tại vì đó là source of truth.
