import React from 'react';
import { LikesScreen } from '@/features/likes';
import { useProtectedRoute } from '@/hooks/use-protected-route';

export default function LikesPage() {
  // Protect this route - only authenticated users can access it
  useProtectedRoute();

  return <LikesScreen />;
}
