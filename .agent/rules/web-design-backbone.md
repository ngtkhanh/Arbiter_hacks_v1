---

description: Rule cốt lõi về thiết kế web. AI agent PHẢI tuân thủ theo mức độ MUST, SHOULD và CONTEXTUAL khi tạo/chỉnh sửa file web.
globs: "**/*.{html,css,js,jsx,tsx,ts,vue,svelte,astro}"
trigger: always_on
------------------

# Web Design Backbone Rule

> Đây là bộ nguyên tắc thiết kế web mặc định.
>
> Các rule được chia thành 3 mức:
>
> * **MUST** — bắt buộc, không được bỏ qua nếu không có lý do kỹ thuật rõ ràng.
> * **SHOULD** — mặc định nên tuân thủ.
> * **CONTEXTUAL** — chỉ áp dụng khi phù hợp với loại sản phẩm, nội dung và mục tiêu thiết kế.
>
> Khi một rule Contextual không phù hợp, AI phải ưu tiên context thực tế của project thay vì áp dụng máy móc.

---

# 1. Design Philosophy — Triết lý thiết kế

## MUST

* Giao diện phải có chủ đích thiết kế rõ ràng.
* Không tạo giao diện generic, plain hoặc flat nếu project yêu cầu trải nghiệm cao cấp.
* Visual hierarchy phải rõ ràng.
* Design phải phù hợp với mục tiêu và đối tượng sử dụng của sản phẩm.

## SHOULD

* **Premium First** — ưu tiên cảm giác cao cấp khi phù hợp.
* **Alive, Not Static** — sử dụng motion và interaction để giao diện có sức sống khi chúng cải thiện trải nghiệm.
* Tạo ấn tượng tốt ngay từ lần đầu nhìn thấy.
* Ưu tiên thiết kế có bản sắc thay vì chỉ ghép các component mặc định.

## CONTEXTUAL

* Mức độ "WOW", premium hoặc visual complexity phải phụ thuộc vào loại website.
* Website corporate, dashboard, documentation hoặc utility app không nhất thiết phải có cùng mức độ visual như landing page.

---

# 2. Layout & Spacing — Bố cục & Khoảng cách

## MUST

* Ưu tiên CSS Grid hoặc Flexbox cho layout.
* Không sử dụng `float` hoặc table layout cho bố cục hiện đại.
* Layout phải responsive.
* Không sử dụng `position: absolute` một cách tùy tiện gây khó maintain.

## SHOULD

* Container:

```css
max-width: 1200px - 1400px;
margin: 0 auto;
```

* Sử dụng spacing theo hệ thống 4px/8px:

```text
4, 8, 12, 16, 24, 32, 48, 64, 80, 96, 128
```

* Section padding nên đủ rộng để tạo hierarchy rõ ràng.
* Ưu tiên spacing nhất quán thay vì các giá trị ngẫu nhiên.

## CONTEXTUAL

* Không bắt buộc mọi spacing phải là bội số 4/8 nếu một giá trị khác thực sự cần thiết.
* Section padding `≥80px` desktop và `≥48px` mobile là guideline, không phải hard requirement.
* Container có thể nhỏ hơn hoặc lớn hơn tùy loại website.

---

# 3. Typography — Kiểu chữ

## MUST

* Typography phải có hierarchy rõ ràng.
* Body text phải dễ đọc.
* Không dùng font-size quá nhỏ gây ảnh hưởng readability.
* Heading và body phải có sự phân cấp rõ ràng.

## SHOULD

* Sử dụng web font phù hợp thay vì phụ thuộc hoàn toàn vào browser default font.
* Có thể sử dụng:

```text
Modern:
Inter
Plus Jakarta Sans
Outfit
Space Grotesk

Elegant:
Playfair Display
Cormorant Garamond

Friendly:
Poppins
DM Sans
Nunito
```

* Tối đa khoảng 2 font family.
* Body line-height khoảng `1.6–1.8`.
* Heading line-height khoảng `1.1–1.3`.
* Heading lớn có thể sử dụng letter-spacing âm nhẹ.
* Font-weight nên tạo hierarchy rõ ràng.

## CONTEXTUAL

* Google Fonts không bắt buộc nếu project có brand font riêng.
* Có thể dùng 1 font hoặc hơn 2 font nếu design system yêu cầu.
* Font-size `<14px` chỉ nên dùng cho metadata hoặc nội dung phụ có chủ đích; body text chính không nên quá nhỏ.

---

# 4. Color System — Hệ thống màu sắc

## MUST

* Màu sắc phải nhất quán.
* Contrast phải đáp ứng yêu cầu accessibility phù hợp.
* Không hardcode màu một cách tùy tiện khi project đã có design tokens.

## SHOULD

Sử dụng CSS Custom Properties:

```css
:root {
  --color-primary: ...;
  --color-primary-light: ...;
  --color-primary-dark: ...;

  --color-gray-50: ...;
  --color-gray-950: ...;

  --color-success: ...;
  --color-warning: ...;
  --color-error: ...;

  --color-bg: ...;
  --color-surface: ...;
  --color-surface-elevated: ...;

  --color-border: ...;

  --color-text-primary: ...;
  --color-text-secondary: ...;
  --color-text-muted: ...;
}
```

* Ưu tiên palette được curate.
* Giữ số lượng màu chủ đạo ở mức có kiểm soát.
* Sử dụng gradient một cách có chủ đích.

## CONTEXTUAL

* Tối đa 3 màu chủ đạo chỉ là guideline.
* Glassmorphism, gradient hoặc glow không bắt buộc.
* Dark mode có thể dùng nhiều mức màu khác nhau thay vì một công thức cố định.

---

# 5. Effects & Depth — Hiệu ứng & Chiều sâu

## MUST

* Shadow, border và radius phải nhất quán trong cùng một design.
* Không sử dụng hiệu ứng làm giảm readability hoặc usability.

## SHOULD

* Xây dựng shadow system:

```text
xs → sm → md → lg → xl → 2xl
```

* Xây dựng radius system:

```text
sm → md → lg → xl → full
```

* Sử dụng depth để phân biệt surface, card và interactive element.

## CONTEXTUAL

Có thể sử dụng:

```css
backdrop-filter: blur(12px);
```

hoặc subtle glow, gradient, glassmorphism khi phù hợp.

Không ép các hiệu ứng này vào mọi website.

---

# 6. Animation & Micro-interactions — Hoạt ảnh & Tương tác vi mô

## MUST

* Interactive element phải có feedback rõ ràng.
* Transition không được gây cảm giác giật hoặc lag.
* Phải hỗ trợ:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## SHOULD

* Interactive element nên có hover/focus state phù hợp.
* Transition có thể sử dụng:

```css
transition:
  transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
  box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

* Button có thể nâng nhẹ khi hover.
* Card có thể thay đổi elevation khi hover.
* `scroll-behavior: smooth` khi phù hợp.

## CONTEXTUAL

* Scroll animation như fade-in/slide-up có thể sử dụng khi nó thực sự cải thiện trải nghiệm.
* Hero load animation/staggered animation không bắt buộc.
* Không cần animation cho mọi element.

Không sử dụng animation chỉ để "trang web có animation".

---

# 7. Responsive Design — Thiết kế đáp ứng

## MUST

* Website phải hoạt động tốt trên mobile và desktop.
* Không được có horizontal scroll ngoài ý muốn.
* Touch target phải đủ lớn để sử dụng bằng ngón tay.
* Hình ảnh phải responsive.

## SHOULD

* Ưu tiên mobile-first:

```css
min-width
```

* Có thể sử dụng breakpoint:

```text
640px
1024px
1280px
1536px
```

* Sử dụng fluid typography khi phù hợp:

```css
font-size: clamp(2rem, 5vw, 4.5rem);
```

* Touch target khoảng `44x44px` hoặc lớn hơn.
* Ảnh:

```css
img {
  max-width: 100%;
  height: auto;
}
```

## CONTEXTUAL

* Breakpoint không bắt buộc phải đúng các giá trị trên.
* Có thể dùng breakpoint khác dựa trên layout thực tế.

---

# 8. Component Patterns — Mẫu thành phần giao diện

## SHOULD

### Navbar

* Sticky khi phù hợp.
* Logo và navigation hierarchy rõ ràng.
* Mobile có navigation phù hợp.

### Hero

* Heading rõ ràng.
* Sub-heading có độ dài hợp lý.
* CTA nổi bật.
* Visual hierarchy rõ.

### Card

* Radius nhất quán.
* Padding hợp lý.
* Có hover/focus state khi interactive.

### Button

* Có kích thước dễ thao tác.
* Font-weight đủ rõ.
* Hover/focus/active state.

### Footer

* Nội dung được phân nhóm rõ.
* Spacing hợp lý.
* Contrast tốt.

## CONTEXTUAL

Không phải website nào cũng cần:

* Sticky navbar
* Hero ≥80vh
* Gradient text
* Multi-column footer
* Card-based layout

Chỉ sử dụng khi phù hợp với product và content.

---

# 9. Image & Media — Hình ảnh & Đa phương tiện

## MUST

* Không sử dụng placeholder trống trong sản phẩm hoàn thiện.
* Nội dung hình ảnh phải có ý nghĩa.
* `alt` text phải có cho ảnh cần accessibility.
* Icon phải phù hợp với hệ thống UI.

## SHOULD

* Sử dụng:

```text
SVG
Lucide
Phosphor
```

hoặc icon system phù hợp.

* Sử dụng:

```html
loading="lazy"
```

cho hình ảnh dưới fold khi phù hợp.

* Giữ tỷ lệ và kích thước ảnh ổn định để tránh layout shift.

## CONTEXTUAL

* Có thể sử dụng image generation tool khi project cần hình ảnh custom.
* Không bắt buộc mọi icon phải là SVG inline nếu project đã có icon system khác.

---

# 10. Accessibility & SEO — Khả năng truy cập & SEO

## MUST

* Ưu tiên semantic HTML:

```html
<header>
<nav>
<main>
<section>
<footer>
```

* Một `<h1>` chính cho mỗi trang khi phù hợp.
* Heading hierarchy phải hợp lý.
* Focus state phải rõ ràng.
* Không sử dụng:

```css
outline: none;
```

mà không cung cấp focus replacement phù hợp.

* Icon button phải có accessible name/`aria-label` khi cần.
* Form input phải có label hoặc accessible labeling tương đương.
* Hình ảnh cần alt text phù hợp.
* Contrast phải đáp ứng mức accessibility phù hợp.

## SHOULD

Meta cơ bản:

```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>...</title>
<meta name="description" content="...">
```

* OG tags khi website cần social sharing.
* Favicon.
* `font-display: swap`.
* `defer`/`async` cho JavaScript khi phù hợp.
* Set `width`/`height` hoặc aspect ratio cho image để hạn chế layout shift.

## CONTEXTUAL

* OG tags, favicon và SEO metadata có mức độ ưu tiên khác nhau tùy loại project.
* Không áp dụng SEO rule của public website một cách máy móc cho internal application.

---

# 11. Code Structure — Cấu trúc mã nguồn

## MUST

* CSS phải có cấu trúc dễ đọc và maintain.
* Không để CSS dư thừa hoặc duplicate mà không có lý do.
* Không hardcode design token nếu project đã có CSS variables.

## SHOULD

CSS có thể được tổ chức theo thứ tự:

```text
Reset
→ Tokens
→ Base
→ Layout
→ Components
→ Utilities
→ Animations
→ Responsive
```

* Class:

```text
kebab-case
```

* ID:

```text
camelCase
```

* Có thể dùng BEM cho component phức tạp.
* Với project đơn giản:

```text
index.html
css/
js/
assets/
  images/
  icons/
  fonts/
```

## CONTEXTUAL

* File structure có thể thay đổi theo framework/build system.
* Không ép cấu trúc HTML/CSS/JS thuần lên React, Vue, Svelte hoặc framework khác.

---

# 12. Checklist bắt buộc trước khi hoàn thành

## MUST

* [ ] Visual hierarchy rõ ràng?
* [ ] Responsive?
* [ ] Không horizontal scroll ngoài ý muốn?
* [ ] Accessibility cơ bản đầy đủ?
* [ ] Interactive element có feedback?
* [ ] Focus state hoạt động?
* [ ] Không có CSS/JS lỗi hoặc dư thừa rõ ràng?

## SHOULD

* [ ] Color palette nhất quán?
* [ ] Typography hierarchy tốt?
* [ ] Spacing system nhất quán?
* [ ] Button/link/card có hover state phù hợp?
* [ ] Mobile 375px hoạt động tốt?
* [ ] Tablet 768px hoạt động tốt?
* [ ] Desktop 1440px hoạt động tốt?
* [ ] Image lazy loading khi phù hợp?
* [ ] `prefers-reduced-motion` được hỗ trợ?

## CONTEXTUAL

* [ ] Premium visual?
* [ ] Gradient?
* [ ] Glassmorphism?
* [ ] Scroll animation?
* [ ] Hero animation?
* [ ] Hero ≥80vh?
* [ ] Google Font?
* [ ] Multi-column footer?

Chỉ đánh dấu các mục Contextual nếu chúng phù hợp với loại website đang xây dựng.

---

# 13. Nguyên tắc ưu tiên

Khi các rule xung đột nhau, ưu tiên theo thứ tự:

```text
1. Accessibility
2. Functional correctness
3. User experience
4. Responsive behavior
5. Project design system
6. Maintainability
7. Visual polish
8. Optional visual effects
```

Không hy sinh functionality, accessibility hoặc maintainability chỉ để đáp ứng một guideline về visual design.
