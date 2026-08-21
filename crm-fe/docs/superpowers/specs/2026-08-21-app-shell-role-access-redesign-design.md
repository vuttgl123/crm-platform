# App Shell và Vai trò & Phân quyền: Design Specification

**Ngày:** 2026-08-21  
**Phạm vi:** `crm-fe`  
**Trạng thái:** Đã duyệt thiết kế trong hội thoại, chờ duyệt tài liệu  
**Hướng thiết kế:** Unified Access Control Shell

## 1. Bối cảnh

App shell sau đăng nhập và màn Vai trò & Phân quyền hiện có nhiều thành phần mang tính minh họa thay vì hành vi production. Sidebar dùng liên kết giả và không lấy dữ liệu từ cấu hình navigation tập trung. Header hiển thị các nút chưa có chức năng thật. Kiểm soát quyền giữa menu, route và action chưa đồng nhất.

Màn Vai trò hiện tập trung quá nhiều trách nhiệm trong một file, có trạng thái tải và lỗi chưa rõ ràng, đồng thời tồn tại các luồng không phản ánh đúng dữ liệu backend. Đáng chú ý:

- route Vai trò đang dùng quyền legacy `platform_user.manage` thay vì `platform_role.read`;
- so sánh vai trò suy đoán quyền thay vì tải role detail;
- lỗi xóa có thể bị nuốt và UI vẫn báo thành công;
- clone không sao chép đầy đủ quyền và data scope;
- data scope `TEAM` và `TEAM_TREE` không thu thập `teamId` bắt buộc;
- lỗi tải danh sách có thể bị biến thành dữ liệu rỗng;
- nội dung, icon, trạng thái và hành động trong shell còn hardcode.

Thiết kế này nâng cấp giao diện và tính đúng đắn của frontend để phù hợp môi trường production, không thay đổi backend hoặc hợp đồng API.

## 2. Mục tiêu

1. Tạo một app shell thống nhất cho toàn bộ route sau đăng nhập.
2. Dùng một manifest tập trung để điều khiển sidebar, breadcrumb, command palette, active state và frontend route access.
3. Chuẩn hóa quyền đọc và quản lý vai trò theo `platform_role.read` và `platform_role.manage`.
4. Thiết kế lại màn Vai trò & Phân quyền thành một workspace quản trị quyền rõ ràng, responsive và dễ truy cập.
5. Bảo đảm mọi kết quả thành công, lỗi, so sánh và dữ liệu phạm vi đều phản ánh response thật từ API.
6. Giữ nguyên framework, route public, backend API và các thay đổi landing/authentication đang tồn tại.

## 3. Ngoài phạm vi

- Không thiết kế lại toàn bộ các trang Platform như Người dùng, Nhóm hoặc Membership.
- Không thay đổi endpoint, DTO hoặc hành vi backend.
- Không tạo notification center, AI assistant, global create hoặc tenant switcher mới.
- Không thêm thư viện UI, state, form, table, icon hoặc animation.
- Không triển khai dark mode.
- Không đổi mã role nghiệp vụ hoặc suy diễn capability từ thứ bậc role.
- Không chạy test, build, dev server, browser test hoặc gọi API theo quy định repository.

## 4. Ràng buộc và nguồn sự thật

- Stack hiện tại: React, Vite, Tailwind CSS 3 và shadcn/Radix.
- UI hiển thị tiếng Việt mặc định và có bản dịch tiếng Anh.
- `docs/api-reference.md` là nguồn sự thật cho hợp đồng Role Management.
- GET permission/role yêu cầu `platform_role.read`.
- POST/PUT/DELETE role yêu cầu `platform_role.manage`.
- Permission catalogue là read-only.
- System role chỉ được xem; custom role mới được tạo, thay thế hoặc xóa mềm.
- Backend tiếp tục là lớp bảo mật có thẩm quyền cuối cùng. Frontend gating phục vụ điều hướng đúng và ngăn thao tác không hợp lệ trên UI.
- Thiết kế không thay đổi API nên không cần sửa `docs/api-reference.md`. Nếu implementation phát hiện phải sửa API, phải dừng và mở một phạm vi riêng có cập nhật tài liệu API đồng thời.

## 5. Kiến trúc tổng thể

```text
AppShell
├── SkipLink
├── SidebarProvider
│   ├── GlobalSidebar
│   └── ShellContent
│       ├── GlobalHeader
│       └── RouteAccessBoundary
│           └── MainContent / Outlet
└── CommandPalette
```

### 5.1 Route và navigation manifest

Một manifest tập trung mô tả các route sau đăng nhập. Mỗi entry có tối thiểu:

- ID ổn định;
- path điều hướng;
- pattern dùng để nhận diện route hiện tại và route detail;
- nhãn Việt/Anh hoặc translation key;
- icon từ bộ icon đã có;
- nhóm sidebar;
- quyền đọc cần thiết;
- cờ hiển thị trong sidebar và command palette.

`NAVIGATION_GROUPS`, sidebar, breadcrumb, command palette và route access đều được tạo hoặc tra cứu từ manifest này. Route detail không xuất hiện trong sidebar vẫn phải có metadata hoặc match vào entry cha. Không nhân bản danh sách quyền ở nhiều component.

`RouteAccessBoundary` lấy pathname hiện tại, resolve policy phù hợp và gọi permission evaluator tập trung. Route đã đăng ký nhưng không đủ quyền chuyển sang trang 403. Route chưa đăng ký trong khu vực authenticated phải đi qua xử lý not-found, không tự suy diễn quyền từ tên URL.

Logic tenant-admin bypass phải được gom về một helper duy nhất và dùng nhất quán trong evaluator, route guard và `PermissionGate`.

### 5.2 App shell

`AppLayout` chỉ chịu trách nhiệm ghép shell và render outlet. Component không dùng phép tính margin thủ công theo chiều rộng sidebar và không tạo nhiều vùng cuộn cạnh tranh.

- Shell dùng `min-height: 100dvh`.
- Header sticky cao khoảng 56px.
- Main content là landmark duy nhất và có ID làm đích cho skip-link.
- Padding nội dung responsive: khoảng 16px mobile, 24px tablet và 32px desktop.
- Nội dung trang rộng có max-width khoảng 1600px và căn giữa.

## 6. Global Sidebar

Sidebar tái sử dụng `src/components/ui/sidebar.tsx` và được tinh chỉnh trong stack hiện tại.

### 6.1 Hành vi

- Desktop mở rộng khoảng 16rem và có chế độ thu gọn về icon.
- Trạng thái thu gọn được lưu cục bộ và phục hồi ở lần truy cập sau.
- Tablet mặc định thu gọn nhưng người dùng có thể mở rộng.
- Mobile hiển thị drawer có overlay, đóng khi chọn route hoặc nhấn Escape.
- `Ctrl/Cmd + B` tiếp tục là shortcut thu gọn nếu không xung đột với input.
- Mục đang active có nền, chữ và chỉ báo rõ ràng, gồm cả khi đang ở route detail.
- Tooltip xuất hiện cho item ở trạng thái icon-only.

### 6.2 Nội dung

- Logo/product mark và tenant hiện tại ở phần đầu.
- Tenant chỉ là thông tin ngữ cảnh, không hiển thị affordance đổi tenant khi chưa có contract.
- Menu lấy từ manifest và được lọc qua permission evaluator.
- Group và item dùng nhãn theo ngôn ngữ hiện tại.
- Không có `href="#"`, menu giả hoặc user name hardcode.
- Thông tin tài khoản chính nằm ở header để tránh lặp lại footer sidebar.

## 7. Global Header và Command Palette

### 7.1 Header

Header chỉ hiển thị chức năng có hành vi thật:

- nút mở hoặc thu gọn sidebar;
- breadcrumb và tiêu đề lấy từ route manifest;
- nút mở Command Palette, kèm shortcut `Ctrl/Cmd + K`;
- language menu Việt/Anh;
- account menu có display name, active role, profile và logout;
- role switcher chỉ xuất hiện khi mock mode và feature flag tương ứng cùng bật.

Các phần AI badge, notification count, Projects, Filters, Dashboard, Settings hoặc global Create hiện tại phải bị loại bỏ nếu không có route và hành vi thật.

### 7.2 Command Palette

Command Palette dùng primitive command/dialog hiện có thay vì overlay hand-written.

- Mở được từ header hoặc `Ctrl/Cmd + K`.
- Danh sách lấy từ cùng manifest và lọc theo quyền.
- Tìm kiếm theo nhãn Việt/Anh và từ khóa route.
- Hỗ trợ Arrow Up/Down, Enter và Escape.
- Focus bị giữ trong dialog và trả lại trigger khi đóng.
- Kết quả điều hướng tới route thật, không gắn nhãn “Sắp ra mắt” cho route đã tồn tại.
- Empty state được dịch và không giả lập tính năng.

## 8. Workspace Vai trò & Phân quyền

Giữ ba view chính để không phá vỡ mental model hiện tại:

1. Vai trò
2. Danh mục quyền
3. So sánh vai trò

### 8.1 Page header và summary

Trang có tiêu đề, mô tả ngắn và dải thống kê gọn gồm tổng vai trò, system role, custom role và tổng permission. Không dùng bốn card lớn giống dashboard marketing.

### 8.2 Danh sách vai trò

Toolbar gồm:

- tìm kiếm theo tên hoặc role code;
- lọc status `ACTIVE`/`INACTIVE`;
- lọc system/custom;
- nút Tạo vai trò, chỉ hiển thị khi có `platform_role.manage`.

Bảng desktop có các cột:

- identity: name, role code và system/custom;
- permission count;
- data-scope summary;
- status;
- updated time;
- actions.

Chọn dòng mở role detail/editor sheet. System role chỉ có View. Custom role có Edit, Clone và Delete khi người dùng có quyền manage. Trên mobile, bảng chuyển thành các row/card xếp chồng, không ép cuộn ngang qua toàn bộ cột.

### 8.3 Role detail và editor sheet

Sheet rộng khoảng 680px trên desktop và full-screen trên mobile. Cùng một component hỗ trợ bốn mode: view, create, edit và clone.

Editor có ba bước:

1. **Thông tin cơ bản**
   - Create/clone: role code, name, description.
   - Edit: role code readonly, name, description và status.
   - System role: toàn bộ readonly.
2. **Quyền truy cập**
   - Search theo code hoặc description.
   - Filter theo module và risk level.
   - Group permission theo module.
   - Checkbox có label thật và trạng thái indeterminate đúng semantic.
3. **Phạm vi dữ liệu**
   - Cấu hình từng entity độc lập.
   - Type chỉ nhận `OWN`, `TEAM`, `TEAM_TREE` hoặc `TENANT`.
   - `TEAM`/`TEAM_TREE` bắt buộc chọn active team.
   - `OWN`/`TENANT` xóa và không gửi `teamId`.

Footer luôn có Back/Next hoặc Cancel/Save phù hợp với bước. Save bị disable khi payload không hợp lệ hoặc mutation đang chạy. Đóng sheet khi có thay đổi chưa lưu phải mở xác nhận discard.

### 8.4 Quy tắc form

- `roleCode`: trim, uppercase, tối đa 191 ký tự, pattern `^[A-Z][A-Z0-9_]*$` và immutable sau create.
- `name`: bắt buộc, tối đa 255 ký tự.
- `description`: tùy chọn, tối đa 4.000 ký tự; blank được gửi theo cách backend chuẩn hóa về `null`.
- `status`: chỉ `ACTIVE` hoặc `INACTIVE` khi replace.
- permission codes được trim, unique và phải tồn tại trong catalogue đã tải.
- data scopes unique theo bộ `(entityType, type, teamId)` sau normalize.
- entity type trim, uppercase, tối đa 191 ký tự và dùng pattern backend quy định.
- Form không gửi trường create-level `scopeType` không có trong Role Management contract.

Role mới bắt đầu với permission và data scope rỗng. Nếu người dùng dùng bulk select chứa quyền `PRIVILEGED`, UI phải cảnh báo và yêu cầu xác nhận trước khi áp dụng selection.

### 8.5 Clone

Clone tải role detail thật trước khi mở editor. Draft sao chép:

- name và description;
- permission codes;
- từng data scope cùng teamId hợp lệ.

Draft không sao chép ID, version, audit fields hoặc role code. Người dùng bắt buộc nhập role code mới. Nếu detail load thất bại, không mở một draft thiếu dữ liệu.

### 8.6 Danh mục quyền

- Permission được nhóm theo `moduleCode`.
- Mỗi row hiển thị `permissionCode`, description và risk level.
- Risk level chỉ dùng các giá trị `NORMAL`, `SENSITIVE`, `PRIVILEGED` từ API.
- Search và filter không thay đổi selection trong editor.
- Permission catalogue là read-only và không có action tạo/sửa/xóa.

### 8.7 So sánh vai trò

- Người dùng chọn hai role ID khác nhau.
- Frontend tải cả hai role detail thật bằng `GET /api/roles/{id}`.
- Permission matrix được nhóm theo module và so sánh membership trong hai tập `permissionCodes`.
- Data scope được so sánh riêng theo entity, type và team.
- Có toggle Chỉ xem khác biệt.
- Không suy đoán permission hoặc risk từ prefix của role code.
- Nếu một trong hai detail lỗi, vùng tương ứng hiển thị lỗi và Retry; không hiển thị kết quả một phần như thể hoàn chỉnh.

## 9. Component boundaries

`RolesPage.tsx` hiện tại được tách thành các đơn vị có trách nhiệm rõ ràng. Tên cuối cùng có thể theo convention sẵn có, nhưng ranh giới phải tương đương:

- `RolesPage`: route-level composition và view/tab state.
- `useRoleManagement`: query state, mutation state và coordination với `roleApi`/`teamApi`.
- `RolesSummary`: dải số liệu.
- `RolesToolbar`: search/filter/create trigger.
- `RolesTable`: desktop/mobile collection rendering.
- `RoleEditorSheet`: mode và navigation giữa ba bước.
- `RoleBasicsStep`: metadata form.
- `PermissionMatrix`: permission search/filter/group/selection.
- `DataScopeEditor`: entity scopes và conditional team selection.
- `PermissionCatalogue`: view read-only.
- `RoleComparison`: chọn role, tải detail và render diff.
- `RoleDeleteDialog`: confirmation và destructive mutation.
- `roleMappers`: map API DTO sang view model/form draft và ngược lại.
- `roleErrors`: map error code sang i18n key và recovery action.

`PermissionGroupSelector` không import type từ `RolesPage`. Shared role types nằm ở module type/schema riêng để tránh reverse dependency.

Không đưa business logic Role Management vào các primitive `components/ui` dùng chung.

## 10. Data flow

### 10.1 Initial load

Role list và permission catalogue có loading/error state độc lập. Không dùng `.catch(() => [])` để chuyển lỗi thành empty data.

- Role list thành công và permission catalogue lỗi: tab Vai trò vẫn có thể xem; editor và catalogue hiển thị lỗi có Retry.
- Permission catalogue thành công và role list lỗi: catalogue vẫn xem được; danh sách và comparison báo lỗi.
- Team list chỉ tải khi editor cần `TEAM` hoặc `TEAM_TREE`, hoặc tải theo cơ chế cache hiện có nếu project đã chuẩn hóa như vậy.

### 10.2 Detail and comparison

- Detail tải on demand theo selected role ID.
- Editor chỉ hydrate sau khi detail thành công.
- Comparison tải hai detail song song và chỉ tính diff khi cả hai đã thành công.
- Thay role selection hủy hoặc bỏ qua response cũ để tránh hiển thị dữ liệu stale.

### 10.3 Mutations

- Create gửi đúng Create Role request và dùng complete role aggregate trả về để cập nhật UI.
- Edit gửi complete replacement gồm version, metadata, status, permission codes và data scopes.
- Delete gửi strong quoted `If-Match` từ version hiện tại.
- Không cập nhật UI thành công trước response server.
- Sau success, upsert hoặc refetch theo pattern hiện có nhưng kết quả hiển thị phải dựa trên response/canonical server data.

## 11. Authorization behavior

| Bề mặt | Quyền |
|---|---|
| Sidebar item Vai trò | `platform_role.read` |
| Route Vai trò | `platform_role.read` |
| Xem role list/detail/catalogue/comparison | `platform_role.read` |
| Tạo, sửa, clone, xóa | `platform_role.manage` |
| System role mutation | Luôn cấm, kể cả khi có manage |

`platform_user.manage` không được dùng để gate Role Management. Permission constants phải phản ánh các code đang dùng thật và không tiếp tục khẳng định một danh sách cũ là “exact” nếu backend catalogue đã mở rộng.

Tenant admin bypass phải giống nhau ở `canAccessRoute`, `PermissionGate` và action evaluation. UI không suy diễn capability từ role hierarchy hoặc display name.

## 12. Loading, empty, error và mutation states

### 12.1 Loading

- Page initial load dùng skeleton row và summary placeholder đúng kích thước.
- Sheet detail dùng skeleton theo ba vùng nội dung.
- Save/Delete hiển thị pending ngay trên action tương ứng và khóa submit lặp.

### 12.2 Empty

- First-use empty: giải thích chưa có custom role và hiển thị CTA nếu có manage.
- Filtered empty: nói rõ không có kết quả và cho phép xóa filter.
- Permission search empty: giữ filter state và cung cấp Clear search.
- Comparison initial: hướng dẫn chọn hai vai trò.

### 12.3 Error mapping

Không hiển thị raw backend message. Map tối thiểu các code sau sang Việt/Anh và recovery action phù hợp:

- `REQUEST_VALIDATION_FAILED`;
- `AUTHENTICATION_REQUIRED`;
- `ACCESS_DENIED`;
- `ROLE_NOT_FOUND`;
- `ROLE_CODE_ALREADY_EXISTS`;
- `SYSTEM_ROLE_IMMUTABLE`;
- `ROLE_VERSION_CONFLICT`;
- `ROLE_PERMISSION_UNKNOWN`;
- `ROLE_DATA_SCOPE_INVALID`;
- `INTERNAL_ERROR`.

Với `ROLE_VERSION_CONFLICT`, giữ draft hiện tại, thông báo dữ liệu đã thay đổi và cho phép tải bản mới nhất. Không tự ghi đè. Với lỗi authentication/access, dùng luồng auth/403 đã có thay vì lặp toast liên tục.

### 12.4 Delete correctness

Delete dialog hiển thị name và role code. Chỉ xóa row và toast success sau `204`. Nếu request lỗi, dialog hoặc row giữ nguyên, hiển thị lỗi và cho phép retry. Không swallow promise rejection.

## 13. Visual system

- Light-only enterprise CRM.
- Nền slate rất nhẹ, surface trắng và một accent xanh.
- Không gradient, neon, glassmorphism, texture nặng hoặc motion kiểu marketing.
- Dùng font đã được load trong project, không thêm font dependency.
- Heading dùng weight và tracking có chủ đích; body ưu tiên tiếng Việt dễ đọc.
- Số liệu và count dùng `tabular-nums`.
- Label dùng sentence case, hạn chế uppercase microcopy.
- Border và shadow nhẹ, nhất quán một hướng chiếu sáng.
- Radius container lớn hơn control bên trong; không dùng cùng một radius cho mọi thành phần.
- Card chỉ xuất hiện khi cần phân cấp. Tránh card lồng card và badge/pill dư thừa.
- Transition 150–200ms cho hover, active, sidebar và sheet; tôn trọng `prefers-reduced-motion`.

CRM lifecycle/account/lead/priority badges nếu xuất hiện ở app shell hoặc nội dung khác vẫn phải import từ `@/config/crmStatusConfig`. Role status và permission risk không được giả làm các CRM badge đó.

## 14. Responsive behavior

### Desktop lớn

- Sidebar expanded.
- Main content max-width khoảng 1600px.
- Role table đầy đủ cột.
- Editor sheet khoảng 680px.

### Tablet

- Sidebar mặc định icon-only.
- Header ưu tiên page title và command trigger; breadcrumb dài được rút gọn có accessible label.
- Filter toolbar wrap theo nhóm hợp lý.

### Mobile

- Sidebar là drawer.
- Header chỉ giữ sidebar trigger, page title rút gọn và account menu.
- Command Palette vẫn mở được từ menu/shortcut khi keyboard tồn tại.
- Role list chuyển sang stacked rows/cards.
- Role editor full-screen.
- Step navigation và save action luôn truy cập được mà không che field đang focus.

## 15. Accessibility

- Có skip-link tới `main`.
- Sidebar dùng `nav`, header dùng `header`, nội dung chính dùng một `main`.
- Heading hierarchy không bỏ cấp.
- Mọi icon-only button có accessible name.
- Focus ring rõ trên keyboard interaction.
- Dialog, sheet, menu và command palette quản lý focus đúng Radix behavior.
- Escape đóng overlay phù hợp; focus trả lại trigger.
- Tab, checkbox, filter chip và menu item dùng element semantic, không dùng clickable `div`.
- Màu không phải tín hiệu duy nhất cho active, status hoặc risk.
- Text và control đáp ứng contrast; target chạm mobile tối thiểu khoảng 44px.
- Animation tôn trọng reduced-motion.

## 16. I18n và nội dung

- Thêm namespace/key cho app shell, command palette và Role Management trong cả Việt và Anh.
- Không ghi đè các thay đổi i18n landing/auth hiện có.
- Navigation title, breadcrumb và command result lấy từ cùng translation source.
- Error copy ngắn, trực tiếp, không dùng “Oops” hoặc dấu chấm than trong success message.
- Không hardcode tenant, user, role name hoặc notification count.

## 17. Tiêu chí nghiệm thu

### App shell

- Không còn link `#` hoặc control giả trong sidebar/header.
- Sidebar render từ manifest, lọc đúng quyền và có active state cho route hiện tại/detail.
- Header hiển thị session, tenant, language và logout thật.
- Command Palette mở bằng UI và `Ctrl/Cmd + K`, lọc theo quyền và điều hướng bằng bàn phím.
- Direct URL vào route đã đăng ký nhưng thiếu quyền hiển thị 403.
- Sidebar responsive và trạng thái collapse được giữ.

### Role Management

- Route/view dùng `platform_role.read`; mutation dùng `platform_role.manage`.
- System role luôn readonly.
- Loading không còn render một bảng trống khó hiểu.
- API failure không bị chuyển thành empty data.
- Clone dùng role detail và sao chép đầy đủ permission/data scopes.
- TEAM/TEAM_TREE bắt buộc có team; OWN/TENANT không gửi team.
- Comparison dựa trên hai role detail thật.
- Delete failure không loại bỏ row hoặc báo success.
- Version conflict giữ draft và cung cấp reload.
- Mọi text mới có Việt/Anh.

### Chất lượng source

- `RolesPage.tsx` chỉ còn vai trò composition ở cấp route.
- Shared types không phụ thuộc ngược vào page component.
- Không thêm dependency.
- Không chỉnh sửa backend hoặc API reference trong phạm vi này.
- Không làm mất các thay đổi landing/auth/i18n hiện có.

## 18. Chiến lược kiểm tra theo repository rules

Agent triển khai chỉ được thực hiện kiểm tra tĩnh:

- đọc diff theo phạm vi;
- tìm link `#`, copy giả, permission legacy và catch nuốt lỗi còn sót;
- đối chiếu DTO/payload với `docs/api-reference.md`;
- đối chiếu translation key giữa Việt và Anh;
- kiểm tra import tồn tại và không có dependency mới;
- kiểm tra route manifest, permission constant và guard dùng cùng code;
- kiểm tra cấu trúc semantic và accessible label bằng source inspection.

Không chạy unit test, integration test, E2E, smoke test, browser/manual runtime test, dev server hoặc build. Các tình huống runtime và visual được bàn giao thành checklist để người dùng nghiệm thu hoặc cho phép chạy ở một yêu cầu riêng.

## 19. Thứ tự triển khai đề xuất

1. Chuẩn hóa route/navigation manifest và permission evaluation.
2. Xây app shell, sidebar, header và command palette.
3. Chuẩn hóa i18n cho shell.
4. Tách domain types, mappers và error mapping của Role Management.
5. Xây danh sách vai trò và các trạng thái dữ liệu.
6. Xây role detail/editor sheet, permission matrix và data-scope editor.
7. Sửa clone, delete và version-conflict flows.
8. Xây permission catalogue và comparison từ dữ liệu thật.
9. Hoàn thiện responsive, accessibility và kiểm tra tĩnh toàn phạm vi.

Thứ tự chi tiết theo file và checkpoint sẽ được viết trong implementation plan sau khi tài liệu này được duyệt.
