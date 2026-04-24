'use client';

import AuthGuard from '@/components/auth-guard';
import PageShell from '@/components/page-shell';

export default function ChatPage() {
  return (
    <AuthGuard>
      <PageShell />
    </AuthGuard>
  );
}
