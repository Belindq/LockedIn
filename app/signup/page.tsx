'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/Button';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.details || data.error || 'Signup failed');
      }

      // New users go to onboarding
      router.push('/onboarding');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-md w-full space-y-8 bg-card p-8 border-2 border-border shadow-none">
        <div>
          <h2 className="mt-6 text-center text-3xl font-pixel text-primary uppercase tracking-widest">
            Create Account
          </h2>
          <p className="mt-2 text-center text-sm text-card-text font-pixel">
            Or{' '}
            <Link href="/login" className="font-medium text-secondary hover:text-accent underline decoration-2 underline-offset-4">
              sign in to existing account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border-2 border-red-500 text-red-700 px-4 py-3 font-pixel text-sm" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                name="email"
                type="email"
                required
                className="appearance-none relative block w-full px-3 py-3 border-2 border-border placeholder-gray-400 text-input-text bg-input-bg focus:outline-none focus:border-primary focus:z-10 sm:text-sm font-pixel"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                name="password"
                type="password"
                required
                className="appearance-none relative block w-full px-3 py-3 border-2 border-border placeholder-gray-400 text-input-text bg-input-bg focus:outline-none focus:border-primary focus:z-10 sm:text-sm font-pixel"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]"
            >
              {loading ? 'Creating...' : 'Get Started'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

