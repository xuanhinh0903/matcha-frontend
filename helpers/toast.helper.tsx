import { showMessage } from 'react-native-flash-message';

type ToastType = 'success' | 'danger' | 'warning' | 'info';

export const showToast = (message: string, type: ToastType = 'info') => {
  showMessage({
    message,
    type,
    duration: 3000,
    statusBarHeight: 30,
    floating: true,
  });
};

export const showErrorToast = (error: any) => {
  // Extract error message based on RTK Query error structure
  const message =
    error?.data?.message || // Standard NestJS error format
    error?.error?.data?.message || // Nested error structure
    error?.message || // Direct error message
    error?.error?.error || // Legacy format
    'Network error occurred. Please try again.';
  showToast(message, 'danger');
};

export const showSuccessToast = (message: string) => {
  showToast(message, 'success');
};
