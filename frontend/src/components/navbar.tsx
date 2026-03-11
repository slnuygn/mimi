'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  HomeIcon as HomeSolid,
  ChatBubbleLeftRightIcon as ChatSolid,
} from '@heroicons/react/24/solid';
import {
  HomeIcon as HomeOutline,
  ChatBubbleLeftRightIcon as ChatOutline,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

const iconClassName = 'h-6 w-6';

export default function Navbar() {
  const pathname = usePathname();
  const [isSwapped, setIsSwapped] = useState(false);

  const isHome = pathname === '/home';
  const isChat = pathname === '/chat';

  const headerClassName = isSwapped
    ? 'h-16 border-b border-orange-600 bg-orange-500'
    : 'h-16 border-b border-yellow-200 bg-yellow-100';
  const brandColorClassName = isSwapped ? 'text-yellow-100' : 'text-orange-500';
  const searchInputClassName = isSwapped
    ? 'w-96 max-w-[60vw] rounded-lg border border-orange-600 bg-white py-1.5 pl-9 pr-3 text-sm text-orange-600 placeholder-orange-400 focus:outline-none focus:ring-1 focus:ring-yellow-200'
    : 'w-96 max-w-[60vw] rounded-lg border border-yellow-200 bg-white py-1.5 pl-9 pr-3 text-sm text-orange-600 placeholder-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-500';
  const iconColorClassName = isSwapped
    ? 'text-yellow-100 hover:text-yellow-200 transition-colors'
    : 'text-orange-500 hover:text-orange-600 transition-colors';
  const avatarBorderClassName = isSwapped ? 'border-yellow-100' : 'border-orange-500';

  return (
    <header className={headerClassName}>
      <nav className="mx-auto flex h-full max-w-5xl items-center justify-between px-4">
        <div className="flex items-center">
          <button
            type="button"
            aria-label="Toggle navbar colors"
            onClick={() => setIsSwapped((prev) => !prev)}
            className={`text-3xl font-bold ${brandColorClassName}`}
            style={{ fontFamily: 'Righteous, sans-serif' }}
          >
            Mimi
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="relative">
            <input
              type="search"
              aria-label="Search"
              placeholder="Search subjects, classes, study rooms, people..."
              className={searchInputClassName}
            />
            <MagnifyingGlassIcon
              className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-orange-400"
              aria-hidden="true"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <Link href="/home" aria-label="Home" className={iconColorClassName}>
            {isHome ? <HomeSolid className={iconClassName} /> : <HomeOutline className={iconClassName} />}
          </Link>

          <Link href="/chat" aria-label="Chat" className={iconColorClassName}>
            {isChat ? <ChatSolid className={iconClassName} /> : <ChatOutline className={iconClassName} />}
          </Link>

          <Link href="/profile" aria-label="Profile" className="transition-opacity hover:opacity-80">
            <div className={`h-6 w-6 rounded-full overflow-hidden border-2 ${avatarBorderClassName} bg-gray-200`}>
              <img
                src="/avatar-placeholder.png"
                alt="Profile"
                className="h-full w-full object-cover"
              />
            </div>
          </Link>
        </div>
      </nav>
    </header>
  );
}
