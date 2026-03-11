'use client';

import Link from 'next/link';
import { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSwapped, setIsSwapped] = useState(false);

  const pageBackgroundClassName = isSwapped ? 'bg-orange-500' : 'bg-yellow-100';
  const textClassName = isSwapped ? 'text-yellow-100' : 'text-orange-500';
  const borderClassName = isSwapped ? 'border-orange-600' : 'border-yellow-200';
  const iconHoverClassName = isSwapped ? 'hover:text-yellow-200' : 'hover:text-orange-600';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement login logic
    console.log('Login:', { email, password });
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
              className="w-full bg-orange-500 text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Login
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
