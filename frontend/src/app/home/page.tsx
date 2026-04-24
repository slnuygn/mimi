'use client';

import AuthGuard from '@/components/auth-guard';
import PageShell from '@/components/page-shell';

export default function HomePage() {
  return (
    <AuthGuard>
      <PageShell />
    </AuthGuard>
  );
}
