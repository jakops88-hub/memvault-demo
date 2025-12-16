"use client";

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';

export function DemoUserSetup() {
  const { user, setUser } = useAuth();

  useEffect(() => {
    // Set up demo user if no user exists
    if (!user) {
      setUser({
        id: 'demo-user-001',
        email: 'jacob@memvault.com',
        apiKey: 'sk_live_demo_key_for_testing',
        tier: 'HOBBY'
      });
    }
  }, [user, setUser]);

  return null;
}
