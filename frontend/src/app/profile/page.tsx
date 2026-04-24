'use client';

import AuthGuard from '@/components/auth-guard';
import PageShell from '@/components/page-shell';
import { useEffect, useState } from 'react';

const IDENTITY_API_BASE_URL = process.env.NEXT_PUBLIC_IDENTITY_API_URL ?? 'http://localhost:3001';

type MeResponse = {
  user: {
    id: string;
    publicId?: string;
    name: string;
    surname: string;
  };
};

type RefreshResponse = {
  accessToken: string;
  refreshToken: string;
  user?: {
    id: string;
    publicId?: string;
    name: string;
    surname: string;
  };
};

export default function ProfilePage() {
  const [fullName, setFullName] = useState('');
  const [uniqueId, setUniqueId] = useState('');

  useEffect(() => {
    const decodeJwtSub = (token: string): string => {
      try {
        const payloadPart = token.split('.')[1];
        if (!payloadPart) {
          return '';
        }

        const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
        const payload = JSON.parse(atob(padded)) as { sub?: string };
        return payload.sub?.trim() ?? '';
      } catch {
        return '';
      }
    };

    const accessToken = window.localStorage.getItem('accessToken') ?? '';
    if (!accessToken) {
      return;
    }

    const jwtSub = decodeJwtSub(accessToken);
    if (jwtSub) {
      setUniqueId(jwtSub);
    }

    const applyUser = (user?: { id: string; publicId?: string; name: string; surname: string }) => {
      if (!user) {
        return;
      }

      const name = user.name?.trim() ?? '';
      const surname = user.surname?.trim() ?? '';
      const resolvedUniqueId = user.publicId?.trim() || user.id?.trim() || jwtSub;

      setFullName(`${name} ${surname}`.trim());
      if (resolvedUniqueId) {
        setUniqueId(resolvedUniqueId);
      }
    };

    const fetchMe = async (token: string) => {
      const response = await fetch(`${IDENTITY_API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return null;
      }

      return (await response.json()) as MeResponse;
    };

    const refreshSession = async () => {
      const refreshToken = window.localStorage.getItem('refreshToken');
      if (!refreshToken) {
        return null;
      }

      const response = await fetch(`${IDENTITY_API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        return null;
      }

      const refreshed = (await response.json()) as RefreshResponse;
      if (refreshed.accessToken) {
        window.localStorage.setItem('accessToken', refreshed.accessToken);
      }
      if (refreshed.refreshToken) {
        window.localStorage.setItem('refreshToken', refreshed.refreshToken);
      }

      return refreshed;
    };

    const loadUser = async () => {
      try {
        const meData = await fetchMe(accessToken);
        if (meData?.user) {
          applyUser(meData.user);
          return;
        }

        const refreshed = await refreshSession();
        if (!refreshed) {
          return;
        }

        if (refreshed.user) {
          applyUser(refreshed.user);
          return;
        }

        if (!refreshed.accessToken) {
          return;
        }

        const meAfterRefresh = await fetchMe(refreshed.accessToken);
        if (meAfterRefresh?.user) {
          applyUser(meAfterRefresh.user);
        }
      } catch {
        // Keep UI stable when profile fetch fails.
      }
    };

    void loadUser();
  }, []);

  return (
    <AuthGuard>
      <PageShell containerClassName="flex items-start justify-start gap-5 px-10 py-10">
            <div className="h-28 w-28 overflow-hidden rounded-full bg-gray-200 ring-4 ring-white">
              {/* Placeholder image; replace src with user avatar when available */}
              <img
                src="/avatar-placeholder.png"
                alt="User avatar"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex flex-col justify-center gap-1">
              <span className="text-2xl font-semibold text-gray-900">{fullName || 'User'}</span>
              {uniqueId && (
                <span className="text-sm text-gray-900/55">@{uniqueId}</span>
              )}
            </div>
      </PageShell>
    </AuthGuard>
  );
}
