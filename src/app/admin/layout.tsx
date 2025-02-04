import { checkAuth } from "@/app/actions/auth";
import AdminHeader from "@/components/admin/AdminHeader";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // ログインページ以外では認証チェックを行う
  if (!process.env.NODE_ENV?.startsWith('development')) {
    await checkAuth();
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminHeader />
      <div className="py-10">
        <main>
          <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
