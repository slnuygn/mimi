'use client';

import AuthGuard from '@/components/auth-guard';

export default function ChatPage() {
  return (
    <AuthGuard>
      <div className="h-full" />
    </AuthGuard>
  );
}
