'use client';

import AuthGuard from '@/components/auth-guard';
import PageShell from '@/components/page-shell';
import { useEffect, useState } from 'react';
import { PencilLine, X } from 'lucide-react';

const IDENTITY_API_BASE_URL = process.env.NEXT_PUBLIC_IDENTITY_API_URL ?? 'http://localhost:3001';

type MeResponse = {
  user: {
    id: string;
    publicId?: string;
    username?: string | null;
    profilePhotoUrl?: string | null;
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
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [username, setUsername] = useState('');
  const [initialUsername, setInitialUsername] = useState('');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const accessToken = window.localStorage.getItem('accessToken') ?? '';
    if (!accessToken) {
      return;
    }

    const applyUser = (user?: { id: string; publicId?: string; name: string; surname: string; username?: string | null; profilePhotoUrl?: string | null }) => {
      if (!user) {
        return;
      }

      const name = user.name?.trim() ?? '';
      const surname = user.surname?.trim() ?? '';

      setFirstName(name);
      setSurname(surname);
      const resolvedUsername = user.username?.trim() ?? '';
      setUsername(resolvedUsername);
      setInitialUsername(resolvedUsername);
      if (user.profilePhotoUrl) setProfilePhotoUrl(user.profilePhotoUrl);
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
      <PageShell containerClassName="relative flex items-start justify-start gap-5 px-10 py-10">
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="absolute right-8 top-8 z-10 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900 shadow-sm transition hover:border-amber-300 hover:bg-amber-100"
          aria-label="Edit profile"
        >
          <PencilLine className="h-4 w-4" />
          Edit profile
        </button>

        <div className="h-28 w-28 overflow-hidden rounded-full bg-gray-200 ring-4 ring-white">
          <img
            src={profilePhotoUrl ? `${IDENTITY_API_BASE_URL}${profilePhotoUrl}` : '/avatar-placeholder.png'}
            alt="User avatar"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex flex-col justify-center gap-1 pt-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-semibold text-gray-900">{`${firstName} ${surname}`.trim() || 'User'}</span>
          </div>
          <span className="text-sm text-gray-900/55">
            {username ? `@${username}` : 'Set a username'}
          </span>
        </div>
      </PageShell>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Edit Profile</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-md p-1 hover:bg-gray-100 transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <form
              className="flex flex-col gap-3"
              onSubmit={async (e) => {
                e.preventDefault();
                const accessToken = window.localStorage.getItem('accessToken') ?? '';
                if (!accessToken) return;

                const form = e.currentTarget as HTMLFormElement;
                const formData = new FormData(form);

                const currentName = String(formData.get('name') ?? '').trim();
                const currentSurname = String(formData.get('surname') ?? '').trim();
                const currentUsername = String(formData.get('username') ?? '').trim();
                const photo = formData.get('photo');
                const hasPhoto = photo instanceof File && photo.size > 0;

                const payload = new FormData();
                if (currentName && currentName !== firstName) {
                  payload.append('name', currentName);
                }
                if (currentSurname && currentSurname !== surname) {
                  payload.append('surname', currentSurname);
                }
                if (currentUsername && currentUsername !== initialUsername) {
                  payload.append('username', currentUsername);
                }
                if (hasPhoto) {
                  payload.append('photo', photo);
                }

                if (payload.entries().next().done) {
                  setIsEditModalOpen(false);
                  return;
                }

                const response = await fetch(`${IDENTITY_API_BASE_URL}/auth/me`, {
                  method: 'PATCH',
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                  },
                  body: payload,
                });

                if (!response.ok) {
                  // TODO: surface error
                  return;
                }

                const data = await response.json();
                const updated = data?.user;
                if (updated) {
                  const name = updated.name?.trim() ?? '';
                  const surname = updated.surname?.trim() ?? '';
                  setFirstName(name);
                  setSurname(surname);
                  const resolvedUsername = updated.username?.trim() ?? '';
                  setUsername(resolvedUsername);
                  setInitialUsername(resolvedUsername);
                  if (updated.profilePhotoUrl) setProfilePhotoUrl(updated.profilePhotoUrl);
                }

                window.dispatchEvent(new Event('profile-updated'));

                setIsEditModalOpen(false);
              }}
            >
              <label className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">Profile picture</span>
                <input name="photo" type="file" accept="image/*" className="mt-2" />
              </label>

              <label className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">Username</span>
                <input name="username" defaultValue={username} className="mt-2 rounded border px-2 py-1" />
              </label>

              <label className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">Name</span>
                <input name="name" defaultValue={firstName} className="mt-2 rounded border px-2 py-1" />
              </label>

              <label className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">Surname</span>
                <input name="surname" defaultValue={surname} className="mt-2 rounded border px-2 py-1" />
              </label>

              <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="rounded bg-gray-100 px-3 py-1">Cancel</button>
                <button type="submit" className="rounded bg-amber-600 px-3 py-1 text-white">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AuthGuard>
  );
}
