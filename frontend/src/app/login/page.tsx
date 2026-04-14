'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const IDENTITY_API_BASE_URL = process.env.NEXT_PUBLIC_IDENTITY_API_URL ?? 'http://localhost:3001';

type AuthResponse = {
  accessToken: string;
  refreshToken: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSwapped, setIsSwapped] = useState(false);
  const [showNotLoggedInMessage, setShowNotLoggedInMessage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const extractErrorMessage = (payload: unknown): string => {
    if (!payload || typeof payload !== 'object') {
      return 'Error';
    }

    const maybeMessage = (payload as { message?: unknown }).message;
    if (Array.isArray(maybeMessage) && maybeMessage.length > 0) {
      return String(maybeMessage[0]);
    }
    if (typeof maybeMessage === 'string' && maybeMessage.length > 0) {
      return maybeMessage;
    }

    return 'Error';
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setShowNotLoggedInMessage(params.get('reason') === 'not-logged-in');

    const accessTokenFromQuery = params.get('accessToken');
    const refreshTokenFromQuery = params.get('refreshToken');
    if (accessTokenFromQuery && refreshTokenFromQuery) {
      window.localStorage.setItem('accessToken', accessTokenFromQuery);
      window.localStorage.setItem('refreshToken', refreshTokenFromQuery);
      router.replace('/home');
      return;
    }

    if (params.get('error') === 'google-auth-failed') {
      setStatusMessage('Google sign-in failed. Please try again.');
      window.history.replaceState({}, '', '/login');
    }

    const accessToken = window.localStorage.getItem('accessToken');
    if (accessToken) {
      router.replace('/home');
    }
  }, [router]);

  const handleGoogleSignIn = () => {
    window.location.href = `${IDENTITY_API_BASE_URL}/auth/google?intent=login`;
  };

  const pageBackgroundClassName = isSwapped ? 'bg-orange-500' : 'bg-yellow-100';
  const textClassName = isSwapped ? 'text-yellow-100' : 'text-orange-500';
  const borderClassName = isSwapped ? 'border-orange-600' : 'border-yellow-200';
  const iconHoverClassName = isSwapped ? 'hover:text-yellow-200' : 'hover:text-orange-600';
  const buttonClassName = isSwapped
    ? 'w-full bg-yellow-100 text-orange-500 font-bold py-3 rounded-lg hover:bg-yellow-200 transition-colors'
    : 'w-full bg-orange-500 text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition-colors';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setStatusMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`${IDENTITY_API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = (await response.json()) as AuthResponse | { message?: unknown };

      if (!response.ok) {
        const errorMessage = extractErrorMessage(data).toLowerCase();
        if (errorMessage.includes('invalid credentials')) {
          setStatusMessage('You are not a member.');
          return;
        }

        setStatusMessage('Error');
        return;
      }

      const authData = data as AuthResponse;
      window.localStorage.setItem('accessToken', authData.accessToken);
      window.localStorage.setItem('refreshToken', authData.refreshToken);
      router.replace('/home');
    } catch {
      setStatusMessage('Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen ${pageBackgroundClassName} flex items-center justify-center px-4`}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <button
            type="button"
            onClick={() => setIsSwapped((prev) => !prev)}
            className={`text-5xl font-bold mb-2 ${textClassName}`}
            style={{ fontFamily: 'Righteous, sans-serif' }}
            aria-label="Toggle login page colors"
          >
            Mimi
          </button>
          <p className={`${textClassName} text-lg`}>Welcome back!</p>
          {showNotLoggedInMessage && (
            <p className="mt-2 text-sm text-red-600">you aren't logged in</p>
          )}
          {statusMessage && <p className="mt-2 text-sm text-red-600">{statusMessage}</p>}
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className={`block ${textClassName} font-medium mb-2`}>
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-2 border-2 ${borderClassName} rounded-lg focus:outline-none focus:border-orange-500 text-gray-800`}
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className={`block ${textClassName} font-medium mb-2`}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-2 pr-12 border-2 ${borderClassName} rounded-lg focus:outline-none focus:border-orange-500 text-gray-800`}
                  placeholder={showPassword ? "YourPassword123." : "••••••••"}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${textClassName} ${iconHoverClassName}`}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={buttonClassName}
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className={`${buttonClassName} flex items-center justify-center gap-3`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5">
                <path fill="currentColor" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"/>
              </svg>
              Sign in with Google
            </button>
          </form>

        <div className="mt-6 text-center">
          <p className={textClassName}>
            Don't have an account?{' '}
            <Link href="/register" className={`font-bold underline ${iconHoverClassName}`}>
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
