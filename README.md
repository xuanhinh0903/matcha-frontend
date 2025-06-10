# Matcha Mobile App

<div align="center">
  <img alt="logo" src="./assets/icon.png" width="124px" style="border-radius:10px"/><br/>
</div>

[Phiên bản Tiếng Việt](./README.vi.md)

## 📚 Documentation Quick Links

- [Business Process Documentation](./DOCS.md) - Detailed overview of app features and workflows
- [Contributing Guidelines](./CONTRIBUTING.md) - Git workflow, code standards, and team practices
- [Development Guide](./DEVELOPMENT.md) - Technical guides for building features and pages

## Overview

Matcha is a mobile dating application built with React Native and Expo. The app features user matching, real-time chat, profile management, and a swipe-based discovery system.

### Related Repositories

- Frontend (Current): Mobile application built with React Native + Expo
- [Backend](https://github.com/toandev95/matcha-be): Server application built with Node.js + NestJS

## 🛠 Tech Stack

- **Framework:** React Native + Expo
- **Language:** TypeScript
- **State Management:** Redux Toolkit + Jotai
- **API Integration:** React Query + Axios
- **Navigation:** Expo Router
- **Styling:** NativeWind (TailwindCSS) + Styled Components
- **Form Handling:** React Hook Form + Zod
- **Internationalization:** i18next
- **Testing:** Jest + React Testing Library
- **Code Quality:** ESLint + Prettier + Husky

## 📁 Project Structure

```
src/
├── api/              # API integration and types
├── app/              # Expo Router app directory
├── components/       # Reusable UI components
├── features/         # Feature-based modules
├── helpers/         # Utility functions
├── hooks/           # Custom React hooks
├── rtk-query/       # Redux Toolkit Query setup
├── store/           # Redux store configuration
├── translations/    # i18n translation files
└── types/           # TypeScript type definitions
```

## 🚀 Environment Setup

### Prerequisites

- [Node.js LTS](https://nodejs.org/en/)
- [pnpm](https://pnpm.io/installation) (v9.12.3 or later)
- [React Native development environment](https://reactnative.dev/docs/environment-setup)
- [Watchman](https://facebook.github.io/watchman/docs/install) (for macOS/Linux)
- Xcode (for iOS development)
- Android Studio (for Android development)

### Development Tools

- [VS Code](https://code.visualstudio.com/) or [Cursor](https://www.cursor.com/)
- Install recommended VS Code extensions from `.vscode/extensions.json`

## 🔧 Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd matcha-fe
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables (ask team lead for access)

## 📱 Running the App

### Development

```bash
# iOS
pnpm ios                  # Development
pnpm ios:staging         # Staging
pnpm ios:production      # Production

# Android
pnpm android            # Development
pnpm android:staging    # Staging
pnpm android:production # Production

# Start Expo development server
pnpm start              # Development
pnpm start:staging      # Staging
pnpm start:production   # Production
```

### Building

```bash
# iOS Development Build
pnpm build:development:ios

# Android Development Build
pnpm build:development:android

# Other environments follow similar pattern with :staging or :production
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:ci

# E2E tests (requires Maestro)
pnpm install-maestro    # Install Maestro first
pnpm e2e-test          # Run E2E tests
```

## 🔍 Code Quality

```bash
# Lint code
pnpm lint

# Type check
pnpm type-check

# Check translations
pnpm lint:translations

# Run all checks (lint + type-check + translations + tests)
pnpm check-all
```

## 📖 Additional Documentation

- [Development Guide](./DEVELOPMENT.md) - Detailed guide for creating new pages and features
- [Contributing Guidelines](./CONTRIBUTING.md) - Team workflow and coding standards

## 🔐 Security

- Keep environment variables secure and never commit them
- Use the secure storage for sensitive data
- Follow authentication best practices in `src/helpers/auth.helper.tsx`

## 🐛 Troubleshooting

1. Reset the development environment:

   ```bash
   pnpm install
   pnpm prebuild
   ```

2. Clear metro bundler cache:

   ```bash
   pnpm start --clear
   ```

3. Run doctor to check for common issues:
   ```bash
   pnpm doctor
   ```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details on:

- Development workflow
- Code style guide
- Pull request process
- Testing requirements

For detailed technical guides on adding features or pages, check our [Development Guide](./DEVELOPMENT.md).

## 👥 Matcha Team

- **Email:** kenzo.devweb@gmail.com
- **Phone:** 0383017053
- **Contact:** Le Ba Toan

## 📞 Support

- Internal team documentation and guides in Drive (ask for access)
- Contact team lead for urgent issues
- Use GitHub Issues for bug tracking
- Team communication in Zalo

Remember to keep this documentation up to date as the project evolves.
