'use client';

import AuthGuard from '@/components/auth-guard';

export default function HomePage() {
  return (
    <AuthGuard>
      <div className="h-full" />
    </AuthGuard>
  );
}
