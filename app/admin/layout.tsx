import { AuthGuard } from '@/components/auth/auth-guard';
import { LogoutButton } from '@/components/auth/logout-button';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Admin Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-900">Admin Panel</h1>
              <LogoutButton />
            </div>
          </div>
        </header>

        {/* Admin Content */}
        <main className="container mx-auto px-4 py-6">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
} 