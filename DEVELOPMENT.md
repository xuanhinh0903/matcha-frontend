# Development Guide

📚 **Documentation Links:**

- [Main Documentation (README)](./README.md) - Project overview and setup
- [Contributing Guidelines](./CONTRIBUTING.md) - Team workflow and standards

This guide provides detailed technical instructions for creating new pages and modifying features in the Matcha mobile app. Make sure you've first read the [setup instructions](./README.md#-environment-setup) and [contribution guidelines](./CONTRIBUTING.md).

## Creating a New Page

### 1. Page Structure

Pages are created in the `src/app` directory using Expo Router. Here's how to create a new page:

```typescript
// src/app/(tabs)/example-page.tsx
import React from 'react';
import { BaseLayout } from '@/components/layouts';
import { ExampleFeature } from '@/features/example';

export default function ExamplePage() {
  return (
    <BaseLayout>
      <ExampleFeature />
    </BaseLayout>
  );
}
```

### 2. Feature Implementation

Features are organized in the `src/features` directory. Each feature should have its own directory with the following structure:

```
src/features/example/
├── components/           # Feature-specific components
├── hooks/               # Custom hooks
├── styles/              # Styling
├── types/              # TypeScript types
└── index.tsx           # Main feature component
```

Example implementation:

```typescript
// src/features/example/types/index.ts
export interface ExampleData {
  id: string;
  title: string;
}

// src/features/example/hooks/useExampleData.ts
import { useQuery } from '@tanstack/react-query';

export const useExampleData = () => {
  return useQuery({
    queryKey: ['example'],
    queryFn: async () => {
      // API call implementation
    },
  });
};

// src/features/example/components/ExampleItem.tsx
import React from 'react';
import { Text, View } from 'react-native';
import { tv } from 'tailwind-variants';

const styles = tv({
  base: 'p-4 bg-white rounded-lg',
  variants: {
    state: {
      active: 'bg-blue-100',
      inactive: 'bg-gray-100',
    },
  },
});

export const ExampleItem = ({ title, isActive }) => (
  <View className={styles({ state: isActive ? 'active' : 'inactive' })}>
    <Text>{title}</Text>
  </View>
);

// src/features/example/index.tsx
import React from 'react';
import { View } from 'react-native';
import { ExampleItem } from './components';
import { useExampleData } from './hooks';

export const ExampleFeature = () => {
  const { data, isLoading } = useExampleData();

  if (isLoading) {
    return <Loading />;
  }

  return (
    <View className="flex-1 p-4">
      {data?.map(item => (
        <ExampleItem key={item.id} {...item} />
      ))}
    </View>
  );
};
```

### 3. API Integration

Add API endpoints in the RTK Query setup:

```typescript
// src/rtk-query/example/index.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '../common/base-query';
import { ExampleData } from '@/types';

export const exampleApi = createApi({
  reducerPath: 'exampleApi',
  baseQuery,
  endpoints: (builder) => ({
    getExamples: builder.query<ExampleData[], void>({
      query: () => 'examples',
    }),
    addExample: builder.mutation<ExampleData, Partial<ExampleData>>({
      query: (body) => ({
        url: 'examples',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useGetExamplesQuery, useAddExampleMutation } = exampleApi;
```

## Modifying Existing Features

### 1. Locate the Feature

Features are organized by domain in `src/features/`. For example, authentication-related features are in `src/features/auth/`.

### 2. Understanding the Structure

Each feature typically includes:

- Components
- Hooks
- Styles
- Redux slices (if needed)
- API definitions
- Types

### 3. Making Changes

#### Adding a New Component

```typescript
// src/features/auth/login/components/social-login.tsx
import React from 'react';
import { View } from 'react-native';
import { MatchaButton } from '@/components/ui/Button';

export const SocialLogin = () => {
  return (
    <View className="gap-4">
      <MatchaButton
        variant="outline"
        onPress={() => handleGoogleLogin()}
      >
        Continue with Google
      </MatchaButton>
    </View>
  );
};
```

#### Modifying Redux State

```typescript
// src/store/global/auth/auth.slice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  // Add new state field
  socialProvider: 'google' | 'apple' | null;
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Add new reducer
    setSocialProvider(
      state,
      action: PayloadAction<AuthState['socialProvider']>
    ) {
      state.socialProvider = action.payload;
    },
  },
});
```

#### Adding New API Endpoints

```typescript
// src/api/auth/index.ts
import { client } from '../common/client';

export const socialLogin = (provider: string, token: string) =>
  client.post('/auth/social-login', { provider, token });
```

### 4. Testing Changes

Follow the testing guidelines in the [Contributing Guide](./CONTRIBUTING.md#6-testing) and run tests using the commands listed in [README.md](./README.md#-testing).

#### Component Tests

```typescript
// src/features/auth/login/components/__tests__/social-login.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import { SocialLogin } from '../social-login';

describe('SocialLogin', () => {
  it('handles google login correctly', () => {
    const { getByText } = render(<SocialLogin />);
    const button = getByText('Continue with Google');
    fireEvent.press(button);
    // Add assertions
  });
});
```

### 5. Styling Guidelines

#### Using NativeWind

```typescript
// Component styling
<View className="flex-1 p-4 bg-white">
  <Text className="text-lg font-medium text-gray-900">
    Title
  </Text>
</View>

// Custom variants
const styles = tv({
  base: 'p-4 rounded-lg',
  variants: {
    intent: {
      primary: 'bg-blue-500 text-white',
      secondary: 'bg-gray-100 text-gray-900',
    },
    size: {
      sm: 'text-sm',
      lg: 'text-lg',
    },
  },
});
```

#### Using Styled Components (when needed)

```typescript
import styled from 'styled-components/native';

export const StyledContainer = styled.View`
  padding: 16px;
  background-color: ${({ theme }) => theme.colors.background};
`;
```

### 6. Best Practices

1. **Component Organization**

   - Keep components focused and single-responsibility
   - Use composition over inheritance
   - Implement proper error boundaries

2. **State Management**

   - Use local state for UI-only state
   - Use Redux for global app state
   - Use React Query for server state

3. **Performance**

   - Implement proper list virtualization with FlashList
   - Use useMemo/useCallback appropriately
   - Optimize images and assets

4. **Type Safety**

   - Define proper interfaces for all props
   - Use strict type checking
   - Avoid any type

5. **Error Handling**
   - Implement proper error boundaries
   - Use toast messages for user feedback
   - Log errors appropriately

## Local IP address

##### For wireless: Use ipconfig getifaddr en1

##### For ethernet: Use ipconfig getifaddr en0.

##### ipconfig getifaddr en0 is default for the Wi-Fi network adapter

## Additional Resources

- Check the [Contributing Guidelines](./CONTRIBUTING.md) for team workflow and standards
- Refer to the [README](./README.md) for available scripts and commands
- For code style and review process, see [Contributing Guide - Code Review Guidelines](./CONTRIBUTING.md#9-code-review-guidelines)

Remember to:

- Follow the existing patterns in the codebase
- Update tests for any changes
- Document new features or significant changes
- Consider mobile-specific concerns (performance, offline support)
