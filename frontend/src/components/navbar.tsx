'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  HomeIcon as HomeSolid,
  ChatBubbleLeftRightIcon as ChatSolid,
  UserIcon as UserSolid,
} from '@heroicons/react/24/solid';
import {
  HomeIcon as HomeOutline,
  ChatBubbleLeftRightIcon as ChatOutline,
  UserIcon as UserOutline,
} from '@heroicons/react/24/outline';

const iconClassName = 'h-6 w-6';

export default function Navbar() {
  const pathname = usePathname();
  const [isSwapped, setIsSwapped] = useState(false);

  const isHome = pathname === '/home';
  const isChat = pathname === '/chat';
  const isProfile = pathname === '/profile';

  const headerClassName = isSwapped
    ? 'h-16 border-b border-orange-600 bg-orange-500'
    : 'h-16 border-b border-yellow-200 bg-yellow-100';
  const brandColorClassName = isSwapped ? 'text-yellow-100' : 'text-orange-500';
  const iconColorClassName = isSwapped
    ? 'text-yellow-100 hover:text-yellow-200 transition-colors'
    : 'text-orange-500 hover:text-orange-600 transition-colors';

  return (
    <header className={headerClassName}>
      <nav className="mx-auto flex h-full max-w-5xl items-center justify-between px-4">
        <button
          type="button"
          aria-label="Toggle navbar colors"
          onClick={() => setIsSwapped((prev) => !prev)}
          className={`text-3xl font-bold ${brandColorClassName}`}
          style={{ fontFamily: 'Righteous, sans-serif' }}
        >
          Mimi
        </button>
        
        <div className="flex items-center gap-8">
          <Link href="/home" aria-label="Home" className={iconColorClassName}>
            {isHome ? <HomeSolid className={iconClassName} /> : <HomeOutline className={iconClassName} />}
          </Link>

          <Link href="/chat" aria-label="Chat" className={iconColorClassName}>
            {isChat ? <ChatSolid className={iconClassName} /> : <ChatOutline className={iconClassName} />}
          </Link>

          <Link href="/profile" aria-label="Profile" className={iconColorClassName}>
            {isProfile ? <UserSolid className={iconClassName} /> : <UserOutline className={iconClassName} />}
          </Link>
        </div>
      </nav>
    </header>
  );
}
