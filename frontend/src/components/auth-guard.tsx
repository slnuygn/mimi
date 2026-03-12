'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type AuthGuardProps = {
  children: ReactNode;
};

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const handleSignOut = () => {
    window.localStorage.removeItem('accessToken');
    window.localStorage.removeItem('refreshToken');
    router.replace('/login');
  };

  useEffect(() => {
    setIsMounted(true);
    const accessToken = window.localStorage.getItem('accessToken');

    if (!accessToken) {
      router.replace('/login?reason=not-logged-in');
      return;
    }

    setIsAuthorized(true);
    setIsChecking(false);
  }, [router]);

  if (!isMounted || isChecking) {
    return null;
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <>
      <div className="fixed right-4 top-4 z-50">
        <button
          type="button"
          onClick={handleSignOut}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 cursor-pointer"
        >
          Sign out
        </button>
      </div>
      {children}
    </>
  );
}
