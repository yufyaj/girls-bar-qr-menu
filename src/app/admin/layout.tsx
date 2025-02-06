import { getAuthData } from "@/app/actions/auth";
import AdminHeader from "@/components/admin/AdminHeader";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // ログインページ以外では認証チェックを行う
  if (!process.env.NODE_ENV?.startsWith('development')) {
    const authData = await getAuthData();
    if (!authData) {
      redirect('/admin/login');
    }
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
