import React from 'react';
import { LexiAIWorkspace } from '@/components/LexiAIWorkspace';

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LexiAIWorkspace>{children}</LexiAIWorkspace>;
}
