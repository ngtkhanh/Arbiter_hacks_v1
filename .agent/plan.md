# Bộ điều phối tác vụ lập trình

## Mục đích

Điều phối toàn bộ một tác vụ lập trình từ lúc hiểu yêu cầu cho đến khi hoàn thành.

Vòng đời chính:

```text
START
  ↓
LOAD STATE
  ↓
BRAINSTORM
  ↓
DESIGN LOCK
  ↓
EXECUTE
  ↓
VERIFY
  ├── PASS → LEARNING GATE
  └── FAIL → RETRY / BLOCKED
                    ↓
              LEARNING GATE
                    ↓
              AI LEARNING
                    ↓
             HUMAN LEARNING
                    ↓
                   DONE
```

File này là **bộ điều phối chính**.

Các quy tắc chi tiết về việc trích xuất và lưu learning phải nằm trong các workflow chuyên biệt:

```text
.agents/workflows/ai-learning.md
.agents/workflows/human-learning.md
```

---

# 0. NGUYÊN TẮC CỐT LÕI

1. Không thay đổi code trước khi vấn đề và hướng giải quyết đã được hiểu đủ rõ.
2. Trạng thái của task phải được lưu trong `.agents/state/current-task.md`.
3. Code và configuration hiện tại của project là **nguồn sự thật chính (source of truth)**.
4. Learning cũ chỉ là kiến thức hỗ trợ và có thể đã lỗi thời; phải kiểm tra lại trước khi sử dụng.
5. Không đọc toàn bộ thư mục learning nếu không thực sự cần thiết.
6. Mọi lỗi verification phải có giới hạn retry.
7. Không lặp lại cùng một cách sửa đã thất bại nếu không có bằng chứng mới hoặc thay đổi có ý nghĩa.
8. Không tạo learning chỉ vì task đã hoàn thành.
9. Phân biệt rõ AI Learning và Human Learning.
10. Workflow phải có khả năng tiếp tục sau khi bị gián đoạn.

---

# 1. STATE MACHINE

Các trạng thái được phép:

```text
START
CONTEXT_LOADING
BRAINSTORMING
DESIGN_LOCK
EXECUTING
VERIFYING
BLOCKED
LEARNING_GATE
SAVING_AI_LEARNING
SAVING_HUMAN_LEARNING
DONE
```

Luồng chuyển trạng thái:

```text
START
→ CONTEXT_LOADING
→ BRAINSTORMING
→ DESIGN_LOCK
→ EXECUTING
→ VERIFYING
```

Tại `VERIFYING`:

```text
PASS
→ LEARNING_GATE
```

```text
FAIL + còn retry
→ EXECUTING
```

```text
FAIL + hết retry
→ BLOCKED
```

Tại `LEARNING_GATE`:

```text
Cần AI Learning
→ SAVING_AI_LEARNING
```

```text
Cần Human Learning
→ SAVING_HUMAN_LEARNING
```

```text
Không cần learning
→ DONE
```

Sau `SAVING_AI_LEARNING`:

```text
→ SAVING_HUMAN_LEARNING
hoặc
→ DONE
```

Sau `SAVING_HUMAN_LEARNING`:

```text
→ DONE
```

---

# 2. LOAD / RESUME STATE

Khi bắt đầu task:

1. Kiểm tra `.agents/state/current-task.md`.
2. Nếu tồn tại task chưa hoàn thành, phải đọc và hiểu trạng thái hiện tại trước khi bắt đầu task mới.
3. Đối chiếu state với project thực tế trước khi tiếp tục.
4. Không mù quáng tin vào state cũ nếu code hiện tại không còn khớp.
5. Nếu chưa có task đang hoạt động, tạo state file mới.

State file tối thiểu phải chứa:

```markdown
# Current Task

Task:
Status:
Phase:

## Checklist

[ ] ...

## Decisions

- ...

## Verification

Build:
Lint:
Tests:

## Retry

Count: 0
Maximum: 3

## Last Error

None

## Blockers

None
```

Cập nhật state sau mỗi thay đổi trạng thái có ý nghĩa.

---

# 3. BRAINSTORMING

Trước khi implementation:

## Bước 1 — Hiểu Context

Xác định:

* Đang thay đổi điều gì?
* Tại sao cần thay đổi?
* Feature/module nào bị ảnh hưởng?
* Hành vi hiện tại nào phải được giữ nguyên?
* Có constraint nào?
* Có dependency nào liên quan?

---

## Bước 2 — Load Learning liên quan

Chỉ lấy kiến thức liên quan đến task hiện tại.

Thứ tự ưu tiên:

```text
1. Learning đúng feature/module
2. Learning có liên quan trực tiếp
3. Các convention dùng chung của project
```

Không quét toàn bộ `.agents/learnings/` mặc định.

Sử dụng cơ chế search/retrieval mà môi trường hiện tại cung cấp.

---

## Bước 3 — Đặt câu hỏi

Chỉ hỏi những câu hỏi có khả năng ảnh hưởng đáng kể đến implementation.

Nếu cần hỏi, hỏi từng câu một thay vì đưa ra quá nhiều câu hỏi cùng lúc.

---

## Bước 4 — Non-functional Requirements

Khi phù hợp, xem xét:

* Performance
* Security
* Reliability
* Maintainability
* Compatibility
* Testing
* Error handling

Không cần ép mọi task phải có đầy đủ các mục trên.

---

## Bước 5 — Understanding Lock

Tóm tắt:

* Problem
* Context liên quan
* Assumptions
* Constraints
* Expected behavior

Không chuyển sang implementation nếu vấn đề vẫn chưa được hiểu đủ rõ.

---

## Bước 6 — Design Options

Khi có nhiều hướng giải quyết hợp lý:

* Đưa ra 2–3 phương án.
* Giải thích trade-off quan trọng của từng phương án.
* Nếu quyết định có ảnh hưởng đáng kể, cần xác nhận hướng cuối cùng trước khi implementation.
* Ghi quyết định cuối cùng vào task state.

---

# 4. EXECUTE

Tạo checklist persistent trong:

```text
.agents/state/current-task.md
```

Trạng thái checklist:

```text
[ ] Chưa bắt đầu
[/] Đang thực hiện
[x] Hoàn thành
[!] Bị block
```

Trước khi thay đổi code, thực hiện context audit.

## Context Scan

Kiểm tra các:

* File liên quan
* Module liên quan
* Configuration
* Behavior hiện tại
* Test hiện có

---

## Variable & State Tracing

Hiểu các thành phần quan trọng:

* Input
* Output
* State
* Side effect
* Lifecycle

---

## Function & Dependency Check

Xác định:

* Caller
* Dependency
* Shared utility
* Related test
* Integration point

---

## Impact Verification

Đánh giá những phần khác có thể bị ảnh hưởng bởi thay đổi.

Sau đó implementation theo convention hiện tại của project.

Sau mỗi bước có ý nghĩa, cập nhật checklist trong state file.

---

# 5. VERIFY

Chạy các bước verification phù hợp với project.

Đối với Android project, nếu các command này tồn tại:

```bash
./gradlew assembleDebug
./gradlew lintDebug
./gradlew testDebugUnitTest
```

Đối với project khác, sử dụng build/lint/type-check/test command đã được project thiết lập.

Không tự bịa ra command không tồn tại trong project.

---

# 6. VERIFICATION FAILURE / RETRY POLICY

Số lần retry verification tối đa:

```text
3
```

Theo dõi:

```text
retry_count
last_error
attempted_fix
evidence
```

Sau mỗi failure:

1. Xác định lỗi.
2. Xác định root cause hoặc hypothesis có khả năng nhất.
3. Ghi lại cách sửa đã thử.
4. Chỉ retry khi có hướng tiếp cận mới hoặc bằng chứng mới.
5. Tăng `retry_count`.
6. Cập nhật persistent state.

---

## Same Failure Rule

Nếu cùng một lỗi xuất hiện lại mà không có bằng chứng mới:

```text
VERIFY FAIL
→ Không lặp lại mù quáng
→ Điều tra nguyên nhân
→ BLOCKED nếu không còn hướng xử lý hợp lý
```

Không được lặp lại vô hạn cùng một cách sửa.

---

## Retry Exhaustion

Khi:

```text
retry_count >= 3
```

chuyển sang:

```text
BLOCKED
```

Không tiếp tục implementation vô hạn.

---

# 7. BLOCKED

Khi task bị block, dừng implementation.

Ghi lại:

```markdown
## Blocked

### Vấn đề hiện tại

...

### Root Cause / Hypothesis

...

### Các cách đã thử

1. ...
2. ...
3. ...

### Evidence

...

### Những điều chưa biết

...

### Cần con người quyết định

...
```

Task ở trạng thái `BLOCKED` tuyệt đối không được báo cáo là đã hoàn thành.

---

# 8. LEARNING GATE

Sau khi verification thành công, xác định task có tạo ra learning hay không.

## AI Learning

Tạo hoặc cập nhật AI Learning nếu task tạo ra kiến thức có thể tái sử dụng cho project, ví dụ:

* Architecture
* Bug/root cause
* Reusable implementation pattern
* Project convention
* Configuration behavior
* Integration knowledge không hiển nhiên

Nếu không có kiến thức có giá trị tái sử dụng, bỏ qua AI Learning.

---

## Human Learning

Tạo Human Learning nếu task có ít nhất một yếu tố đáng học:

* Thay đổi architecture/design.
* Có trade-off quan trọng.
* Root cause không hiển nhiên.
* Có debugging đáng kể.
* Có dead end/approach bị loại bỏ.
* Cùng một failure xảy ra nhiều lần.
* Có insight về security/performance.
* Có reasoning pattern có thể tái sử dụng.
* Có bài học quan trọng cho developer khác.

Task thuần cơ học không cần Human Learning.

Ví dụ:

```text
Đổi tên biến
→ Không cần Human Learning
```

Trong khi:

```text
Điều tra race condition và thay đổi lifecycle handling
→ Nên tạo Human Learning
```

---

# 9. SAVE AI LEARNING

Khi cần AI Learning, sử dụng:

```text
.agents/workflows/ai-learning.md
```

Cung cấp:

* Task hiện tại
* Feature/module liên quan
* File đã thay đổi
* Quyết định quan trọng
* Bug và solution
* Pattern mới
* Learning cũ có liên quan

AI Learning workflow chịu trách nhiệm:

* Xác định feature file phù hợp.
* Tìm learning liên quan.
* Merge kiến thức.
* Loại bỏ duplicate.
* Sửa kiến thức lỗi thời.
* Ghi lại learning.

---

# 10. SAVE HUMAN LEARNING

Khi cần Human Learning, sử dụng:

```text
.agents/workflows/human-learning.md
```

Cung cấp:

* Mục tiêu task
* Reasoning
* Các quyết định
* Alternative đã cân nhắc
* Trade-off
* Debugging history
* Dead end
* Root cause
* Final solution
* Transferable lessons

---

# 11. FINALIZATION

Trước khi đánh dấu task `DONE`:

1. Xác nhận implementation đã hoàn thành.
2. Xác nhận verification đã pass.
3. Xác nhận không còn blocker.
4. Xác nhận task state đã được cập nhật.
5. Lưu các learning cần thiết.
6. Đặt:

```text
Status: DONE
Phase: COMPLETE
```

Sau đó archive hoặc clear active task state theo convention của project.

Final report phải chứa:

```markdown
## Hoàn thành

- ...

## Verification

- Build: PASS / ...
- Lint: PASS / ...
- Tests: PASS / ...

## Learning

- AI Learning: created / updated / skipped
- Human Learning: created / skipped

## Ghi chú

- ...
```

---

# 12. NGUYÊN TẮC KHI FAILURE

Không được:

* Loop vô hạn.
* Lặp lại cùng một cách sửa đã thất bại mà không có evidence mới.
* Đọc toàn bộ historical learning mặc định.
* Xem learning cũ là source of truth.
* Đánh dấu task `DONE` khi đang `BLOCKED`.
* Tạo duplicate learning.
* Che giấu những debugging failure quan trọng khỏi Human Learning.
* Làm mất task state khi workflow bị gián đoạn.

Mục tiêu của workflow:

```text
Có thể resume
Có giới hạn
Tiết kiệm context
Dựa trên evidence
Có khả năng học
```
