'use client';

import { ReactNode } from 'react';

type PageShellProps = {
  children?: ReactNode;
  containerClassName?: string;
};

export default function PageShell({ children, containerClassName = '' }: PageShellProps) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#fffdf2] px-3">
      <div className="mx-auto h-[calc(100vh-4rem)] w-full">
        <div
          className={`mx-auto h-full w-[75%] border border-amber-100 bg-white/90 shadow-sm ${containerClassName}`.trim()}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
