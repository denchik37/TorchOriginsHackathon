'use client';

import {
  ClerkProvider,
  SignInButton,
  SignOutButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from '@clerk/nextjs';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';

const ADMIN_EMAILS = ['balajdariussebastian@gmail.com'];

export default function AdminPageWrapper() {
  return (
    <ClerkProvider>
      <AdminPage />
    </ClerkProvider>
  );
}

function AdminPage() {
  const { user } = useUser();

  const email = user?.primaryEmailAddress?.emailAddress;

  if (email && !ADMIN_EMAILS.includes(email)) {
    return (
      <div className="min-h-screen bg-black">
        <Header />

        <div className="flex flex-col items-center justify-center my-12 w-full space-y-2 ">
          <h1 className="text-2xl font-semibold text-text-high-em">Access Denied</h1>
          <p className="text-text-low-em">
            You do not have permission to access the admin dashboard.
          </p>
          <Button variant="torch" className="w-48">
            <SignOutButton />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <SignedIn>
        <div className="flex flex-col items-center justify-center my-12 w-full space-y-2 ">
          <h1 className="text-2xl font-semibold text-text-high-em">Admin Dashboard</h1>
          <p className="text-text-low-em">Manage your application settings and user accounts.</p>

          <UserButton />
        </div>
      </SignedIn>

      <SignedOut>
        <div className="flex flex-col items-center justify-center my-12 w-full space-y-2 ">
          <h1 className="text-2xl font-semibold text-text-high-em">
            You need to sign in to access the admin dashboard.
          </h1>
          <p className="text-text-low-em">
            Please sign in with an account that has admin privileges.
          </p>

          <Button variant="torch" className="w-48">
            <SignInButton />
          </Button>
        </div>
      </SignedOut>
    </div>
  );
}
