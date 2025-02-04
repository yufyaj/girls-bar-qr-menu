"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { login } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type State = {
  error: string | null;
  success?: boolean;
};

const initialState: State = {
  error: null
};

// サブミットボタンコンポーネント
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button 
      type="submit" 
      className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
      disabled={pending}
    >
      {pending ? "ログイン中..." : "ログイン"}
    </button>
  );
}

const AdminLoginPage = () => {
  const [state, formAction] = useActionState(login, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      router.push('/admin/dashboard');
    }
  }, [state?.success, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">管理者ログイン</h2>
        {state?.error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {state.error}
          </div>
        )}
        <form action={formAction}>
          <div className="mb-4">
            <label htmlFor="storeCode" className="block text-gray-700">店舗コード</label>
            <input
              type="text"
              id="storeCode"
              name="storeCode"
              className="w-full p-2 border border-gray-300 rounded mt-1"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="userId" className="block text-gray-700">ユーザーID</label>
            <input
              type="email"
              id="userId"
              name="userId"
              className="w-full p-2 border border-gray-300 rounded mt-1"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700">パスワード</label>
            <input
              type="password"
              id="password"
              name="password"
              className="w-full p-2 border border-gray-300 rounded mt-1"
              required
            />
          </div>
          <SubmitButton />
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
