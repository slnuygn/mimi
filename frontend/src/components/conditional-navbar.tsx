'use client';

import { usePathname } from 'next/navigation';
import Navbar from './navbar';

export default function ConditionalNavbar() {
  const pathname = usePathname();
  
  // Don't show navbar on login and register pages
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }
  
  return <Navbar />;
}
