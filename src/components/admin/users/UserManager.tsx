'use client';

import { createUser, deleteUser, getStoreUsers } from "@/app/actions/auth";
import { CardContainer } from "@/components/ui/containers/CardContainer";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/notifications/Toast";

type User = {
  id: string;
  email: string;
  createdAt: string;
  lastSignInAt: string | null;
};

type UserManagerProps = {
  storeId: string;
};

export function UserManager({ storeId }: UserManagerProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();
  const { Toast, showToast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const users = await getStoreUsers(storeId);
      setUsers(users);
    } catch (error) {
      showToast({
        type: 'error',
        title: 'ユーザー情報の取得に失敗しました'
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsCreating(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const result = await createUser({
        email,
        password,
        storeId
      });

      if (result.error) {
        showToast({
          type: 'error',
          title: result.error
        });
        return;
      }

      showToast({
        type: 'success',
        title: 'ユーザーを作成しました'
      });
      loadUsers();
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      showToast({
        type: 'error',
        title: 'ユーザーの作成に失敗しました'
      });
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('このユーザーを削除してもよろしいですか？')) {
      return;
    }

    try {
      const result = await deleteUser(userId);

      if (result.error) {
        showToast({
          type: 'error',
          title: result.error
        });
        return;
      }

      showToast({
        type: 'success',
        title: 'ユーザーを削除しました'
      });
      loadUsers();
    } catch (error) {
      showToast({
        type: 'error',
        title: 'ユーザーの削除に失敗しました'
      });
      console.error(error);
    }
  };

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  return (
    <>
      <div className="space-y-6">
      <CardContainer>
        <h2 className="text-lg font-semibold mb-4">新規ユーザー作成</h2>
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              メールアドレス
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              パスワード
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              minLength={8}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={isCreating}
            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isCreating ? '作成中...' : 'ユーザーを作成'}
          </button>
        </form>
      </CardContainer>

      <CardContainer>
        <h2 className="text-lg font-semibold mb-4">ユーザー一覧</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">メールアドレス</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">作成日</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">最終ログイン</th>
                <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{user.email}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {user.lastSignInAt ? new Date(user.lastSignInAt).toLocaleString() : '-'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-right">
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-4 text-sm text-gray-500 text-center">
                    ユーザーが存在しません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContainer>
    </div>
    {Toast}
    </>
  );
}