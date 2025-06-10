# Ứng dụng Di động Matcha

<div align="center">
  <img alt="logo" src="./assets/icon.png" width="124px" style="border-radius:10px"/><br/>
</div>

## 📚 Liên kết Tài liệu Nhanh

- [Tài liệu Quy trình Nghiệp vụ](./DOCS.vi.md) - Tổng quan chi tiết về tính năng và quy trình ứng dụng
- [Hướng dẫn Đóng góp](./CONTRIBUTING.md) - Quy trình Git, tiêu chuẩn mã và thực hành nhóm
- [Hướng dẫn Phát triển](./DEVELOPMENT.md) - Hướng dẫn kỹ thuật để xây dựng tính năng và trang

## Tổng quan

Matcha là một ứng dụng hẹn hò di động được xây dựng bằng React Native và Expo. Ứng dụng có các tính năng kết nối người dùng, trò chuyện thời gian thực, quản lý hồ sơ và hệ thống khám phá dựa trên vuốt.

### Kho Lưu trữ Liên quan

- Frontend (Hiện tại): Ứng dụng di động được xây dựng bằng React Native + Expo
- [Backend](https://github.com/toandev95/matcha-be): Ứng dụng máy chủ được xây dựng bằng Node.js + NestJS

## 🛠 Công nghệ Sử dụng

- **Framework:** React Native + Expo
- **Ngôn ngữ:** TypeScript
- **Quản lý State:** Redux Toolkit + Jotai
- **Tích hợp API:** React Query + Axios
- **Điều hướng:** Expo Router
- **Giao diện:** NativeWind (TailwindCSS) + Styled Components
- **Xử lý Form:** React Hook Form + Zod
- **Đa ngôn ngữ:** i18next
- **Kiểm thử:** Jest + React Testing Library
- **Chất lượng Mã:** ESLint + Prettier + Husky

## 📁 Cấu trúc Dự án

```
src/
├── api/              # Tích hợp API và kiểu dữ liệu
├── app/              # Thư mục ứng dụng Expo Router
├── components/       # Components UI có thể tái sử dụng
├── features/         # Modules theo tính năng
├── helpers/         # Hàm tiện ích
├── hooks/           # Custom React hooks
├── rtk-query/       # Cấu hình Redux Toolkit Query
├── store/           # Cấu hình Redux store
├── translations/    # File dịch i18n
└── types/           # Định nghĩa kiểu TypeScript
```

## 🚀 Thiết lập Môi trường

### Yêu cầu

- [Node.js LTS](https://nodejs.org/en/)
- [pnpm](https://pnpm.io/installation) (v9.12.3 trở lên)
- [Môi trường phát triển React Native](https://reactnative.dev/docs/environment-setup)
- [Watchman](https://facebook.github.io/watchman/docs/install) (cho macOS/Linux)
- Xcode (phát triển iOS)
- Android Studio (phát triển Android)

### Công cụ Phát triển

- [VS Code](https://code.visualstudio.com/) hoặc [Cursor](https://www.cursor.com/)
- Cài đặt các extension VS Code được đề xuất từ `.vscode/extensions.json`

## 🔧 Cài đặt

1. Clone repository:

```bash
git clone <repository-url>
cd matcha-fe
```

2. Cài đặt dependencies:

```bash
pnpm install
```

3. Thiết lập biến môi trường (liên hệ trưởng nhóm để truy cập)

## 📱 Chạy Ứng dụng

### Phát triển

```bash
# iOS
pnpm ios                  # Development
pnpm ios:staging         # Staging
pnpm ios:production      # Production

# Android
pnpm android            # Development
pnpm android:staging    # Staging
pnpm android:production # Production

# Khởi động máy chủ phát triển Expo
pnpm start              # Development
pnpm start:staging      # Staging
pnpm start:production   # Production
```

### Build

```bash
# Build iOS Development
pnpm build:development:ios

# Build Android Development
pnpm build:development:android

# Các môi trường khác theo mẫu tương tự với :staging hoặc :production
```

## 🧪 Kiểm thử

```bash
# Chạy tất cả test
pnpm test

# Chế độ theo dõi
pnpm test:watch

# Báo cáo độ phủ
pnpm test:ci

# Test E2E (yêu cầu Maestro)
pnpm install-maestro    # Cài đặt Maestro trước
pnpm e2e-test          # Chạy test E2E
```

## 🔍 Chất lượng Mã

```bash
# Lint code
pnpm lint

# Kiểm tra kiểu
pnpm type-check

# Kiểm tra bản dịch
pnpm lint:translations

# Chạy tất cả kiểm tra (lint + type-check + translations + tests)
pnpm check-all
```

## 📖 Tài liệu Bổ sung

- [Hướng dẫn Phát triển](./DEVELOPMENT.md) - Hướng dẫn chi tiết để tạo trang và tính năng mới
- [Hướng dẫn Đóng góp](./CONTRIBUTING.md) - Quy trình làm việc nhóm và tiêu chuẩn mã

## 🔐 Bảo mật

- Giữ bí mật các biến môi trường và không bao giờ commit chúng
- Sử dụng secure storage cho dữ liệu nhạy cảm
- Tuân theo các thực hành bảo mật tốt nhất trong `src/helpers/auth.helper.tsx`

## 🐛 Xử lý Sự cố

1. Reset môi trường phát triển:

   ```bash
   pnpm install
   pnpm prebuild
   ```

2. Xóa cache metro bundler:

   ```bash
   pnpm start --clear
   ```

3. Chạy doctor để kiểm tra các vấn đề phổ biến:
   ```bash
   pnpm doctor
   ```

## 🤝 Đóng góp

Chúng tôi hoan nghênh các đóng góp! Vui lòng xem [Hướng dẫn Đóng góp](./CONTRIBUTING.md) để biết chi tiết về:

- Quy trình phát triển
- Hướng dẫn phong cách code
- Quy trình pull request
- Yêu cầu kiểm thử

Để biết hướng dẫn kỹ thuật chi tiết về việc thêm tính năng hoặc trang, xem [Hướng dẫn Phát triển](./DEVELOPMENT.md).

## 👥 Nhóm Matcha

- **Email:** kenzo.devweb@gmail.com
- **Điện thoại:** 0383017053
- **Liên hệ:** Lê Bá Toàn

## 📞 Hỗ trợ

- Tài liệu nội bộ nhóm và hướng dẫn trong Drive (yêu cầu quyền truy cập)
- Liên hệ trưởng nhóm cho các vấn đề khẩn cấp
- Sử dụng GitHub Issues để theo dõi lỗi
- Giao tiếp nhóm qua Zalo

Hãy nhớ cập nhật tài liệu này khi dự án phát triển.

[English Version](./README.md)
