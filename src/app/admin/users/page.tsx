import { getCurrentStoreId } from "@/app/actions/auth";
import { UserManager } from "@/components/admin/users/UserManager";

export default async function UsersPage() {
  // 認証チェック
  const storeId = await getCurrentStoreId();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">ユーザー管理</h1>
      <UserManager storeId={storeId} />
    </div>
  );
}