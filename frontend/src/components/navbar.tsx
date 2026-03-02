'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

  const isHome = pathname === '/';
  const isChat = pathname === '/chat';
  const isProfile = pathname === '/profile';

  return (
    <header className="h-16 border-b border-yellow-200 bg-yellow-100">
      <nav className="mx-auto flex h-full max-w-5xl items-center justify-between px-4">
        <span className="text-3xl font-bold text-orange-500" style={{ fontFamily: 'Righteous, sans-serif' }}>
          Mimi
        </span>
        
        <div className="flex items-center gap-8">
          <Link href="/" aria-label="Home" className="text-orange-500 hover:text-orange-600 transition-colors">
            {isHome ? <HomeSolid className={iconClassName} /> : <HomeOutline className={iconClassName} />}
          </Link>

          <Link href="/chat" aria-label="Chat" className="text-orange-500 hover:text-orange-600 transition-colors">
            {isChat ? <ChatSolid className={iconClassName} /> : <ChatOutline className={iconClassName} />}
          </Link>

          <Link href="/profile" aria-label="Profile" className="text-orange-500 hover:text-orange-600 transition-colors">
            {isProfile ? <UserSolid className={iconClassName} /> : <UserOutline className={iconClassName} />}
          </Link>
        </div>
      </nav>
    </header>
  );
}
