# VUM CRM — Frontend Foundation

Nền tảng giao diện người dùng (React SPA Frontend Foundation) dành cho hệ thống **VUM Multi-Tenant CRM**, tuân thủ nghiêm ngặt 100% cấu trúc sơ đồ dữ liệu SQL tại `docs/crm_mysql80.sql` và `docs/crm_mysql80_auth.sql`.

---

## 1. Scope & Capabilities

### Thêm mới & Đã triển khai (Included)
- **App Shell**: Thanh điều hướng Sidebar đáp ứng (thủ thu gọn/mở rộng, drawer trên Mobile), Header với breadcrumb, thẻ tổ chức tenant, công cụ tìm kiếm nhanh (Command Palette `Ctrl+K`), danh mục thông báo, menu tài khoản.
- **Xác thực & SSO**: Đăng nhập Email/Mật khẩu với React Hook Form & Zod, mô phỏng Google SSO (`GOOGLE`) & Microsoft SSO (`MICROSOFT`), tự động khôi phục phiên làm việc, hết hạn phiên (Session Expiration), đăng xuất.
- **Phân quyền RBAC & Data Scope**: Đánh giá 19 permissions được seed trong SQL schema và 4 phạm vi dữ liệu (`OWN`, `TEAM`, `TEAM_TREE`, `TENANT`) trên 5 vai trò demo (Quản trị viên, Quản lý vùng, Trưởng nhóm, Nhân viên, Chỉ xem).
- **Navigation & Placeholder Routes**: 9 nhóm điều hướng chuẩn SQL (`crm`, `catalog`, `sales`, `marketing`, `service`, `privacy`, `integration`, `audit`, `platform`) với giao diện "Sắp ra mắt" nhất quán cho các route chưa triển khai nghiệp vụ chi tiết.
- **Đa ngôn ngữ (i18n)**: Cấu hình i18next sẵn sàng, hoàn thiện bộ tài nguyên tiếng Việt (`vi`) và khung cấu trúc tiếng Anh (`en`).
- **Trạng thái hệ thống**: Loading Skeleton, Empty State, Service Error (với chức năng Thử lại), Offline State, Forbidden (`403`), Not Found (`404`), Session Expired.
- **Bộ Kiểm thử Automated Tests**: Vitest + React Testing Library cho toàn bộ luồng xác thực, phân quyền, data scope và trạng thái giao diện.

### Phạm vi loại trừ (Explicit Non-Goals)
- Không kết nối trực tiếp MySQL, không xây dựng backend server / ORM.
- Không triển khai các nghiệp vụ chuyên sâu như quản lý khách hàng, quy trình cơ hội, báo giá, đơn hàng, chiến dịch marketing, ticket hỗ trợ.
- Không thêm Redux, Zustand, MobX, MUI, Ant Design, Chakra, Tailwind Table hay Charting library trong giai đoạn này.

---

## 2. Prerequisites & Environment Variables

- **Node.js**: `v20.19.5` (hoặc mới hơn)
- **npm**: `v11.6.4` (hoặc mới hơn)

### Cấu hình môi trường (`.env`)
```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_USE_MOCKS=true
VITE_MOCK_DELAY_MS=300
VITE_ENABLE_ROLE_SWITCHER=true
```

---

## 3. Demo Accounts & Role Mappings

Tất cả tài khoản thử nghiệm sử dụng chung một mật khẩu duy nhất: **`Demo@123456`**

| Vai trò (Role) | Scope | Email Đăng nhập | Mô tả & Phân quyền |
| --- | --- | --- | --- |
| **Quản trị viên Hệ thống** | `TENANT` | `admin@vum.vn` | Toàn quyền tổ chức (`is_tenant_admin: true`), sở hữu tất cả 19 permissions |
| **Quản lý Vùng (Miền Bắc)** | `TEAM_TREE` | `manager@vum.vn` | Quản lý nhóm Miền Bắc và các nhóm con (TEAM_TREE scope) |
| **Trưởng nhóm Kinh doanh** | `TEAM` | `leader@vum.vn` | Quản lý dữ liệu trong nhóm Hà Nội 1 (TEAM scope) |
| **Nhân viên Kinh doanh** | `OWN` | `staff@vum.vn` | Chỉ truy cập bản ghi do mình tạo/phụ trách (OWN scope) |
| **Người xem (Read-only)** | `TENANT` | `viewer@vum.vn` | Xem dữ liệu toàn tổ chức, không có quyền ghi/chỉnh sửa/phê duyệt |

> **Lưu ý**: Công cụ **Role Switcher** hiển thị trên Header (khi `VITE_ENABLE_ROLE_SWITCHER=true`) giúp reviewer trải nghiệm nhanh giữa cả 5 vai trò mà không cần đăng xuất.

---

## 4. Architecture & Data Flow

```text
UI Component ──> Feature Hook / Query ──> IAuthService Contract ──> MockAuthService ──> StorageAdapter (localStorage)
```

### Nguyên tắc kiến trúc:
1. **Dependency Injection**: Giao diện chỉ giao tiếp thông qua hợp đồng `IAuthService`. Việc thay thế bằng adapter gọi REST API / GraphQL tương lai sẽ không làm thay đổi các UI components.
2. **Centralized Permissions**: Toàn bộ logic phân quyền (Route guards, Menu items, Command palette, UI PermissionGates, Mock service filtering) đều gọi chung hàm đánh giá `can()` và `canAccessEntity()` tại `src/core/permissions/evaluator.ts`.
3. **Data Scope Enforcement**: Logic phạm vi dữ liệu được áp dụng trực tiếp tại tầng service trước khi trả về client.
4. **Server-Side Requirement**: Client-side RBAC là mô phỏng trải nghiệm người dùng; tương lai Backend BẮT BUỘC phải thực hiện lại tất cả các bước kiểm tra này.

---

## 5. Available Scripts

Chạy các lệnh kiểm thử và đóng gói non-interactive trong thư mục `crm-fe`:

```bash
# 1. Kiểm tra cú pháp và code quality
npm run lint

# 2. Kiểm tra kiểu dữ liệu TypeScript strict mode
npm run typecheck

# 3. Chạy bộ unit / integration test tự động (Vitest)
npm run test

# 4. Đóng gói bản build sản phẩm
npm run build

# 5. Khởi chạy dev server cục bộ
npm run dev
```

---

## 6. External Components & Licensing

- **Icons**: `lucide-react` (MIT License)
- **Toast Notifications**: `sonner` (MIT License)
- **Design System Tokens**: CSS Variables & Custom Palette dựa trên Tailwind CSS v3 (Light mode only, `#2563EB`). Không có thư viện component bên thứ ba trùng lặp.
