'use client';

import Link from 'next/link';
import { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSwapped, setIsSwapped] = useState(false);

  const pageBackgroundClassName = isSwapped ? 'bg-orange-500' : 'bg-yellow-100';
  const textClassName = isSwapped ? 'text-yellow-100' : 'text-orange-500';
  const borderClassName = isSwapped ? 'border-orange-600' : 'border-yellow-200';
  const iconHoverClassName = isSwapped ? 'hover:text-yellow-200' : 'hover:text-orange-600';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    // TODO: Implement registration logic
    console.log('Register:', { name, surname, email, password });
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
            aria-label="Toggle register page colors"
          >
            Mimi
          </button>
          <p className={`${textClassName} text-lg`}>Create your account!</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className={`block ${textClassName} font-medium mb-2`}>
                Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-4 py-2 border-2 ${borderClassName} rounded-lg focus:outline-none focus:border-orange-500 text-gray-800`}
                placeholder="Your Name"
                required
              />
            </div>

            <div>
              <label htmlFor="surname" className={`block ${textClassName} font-medium mb-2`}>
                Surname
              </label>
              <input
                type="text"
                id="surname"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                className={`w-full px-4 py-2 border-2 ${borderClassName} rounded-lg focus:outline-none focus:border-orange-500 text-gray-800`}
                placeholder="Your Surname"
                required
              />
            </div>

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

            <div>
              <label htmlFor="confirmPassword" className={`block ${textClassName} font-medium mb-2`}>
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-4 py-2 pr-12 border-2 ${borderClassName} rounded-lg focus:outline-none focus:border-orange-500 text-gray-800`}
                  placeholder={showConfirmPassword ? "YourPassword123." : "••••••••"}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${textClassName} ${iconHoverClassName}`}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
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
              Register
            </button>
          </form>

        <div className="mt-6 text-center">
          <p className={textClassName}>
            Already have an account?{' '}
            <Link href="/login" className={`font-bold underline ${iconHoverClassName}`}>
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
