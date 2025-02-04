"use server"

import { createServerSupabaseClient, createUnauthenticatedClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function checkAuth() {
  const cookiesList = await cookies();
  const storeId = cookiesList.get('storeId');
  
  if (!storeId || !storeId.value) {
    redirect('/admin/login');
  }
  
  // 認証済みの場合は、そのまま処理を続行
  return storeId.value;
}

export async function getCurrentStoreId() {
  // 先に認証チェックを行う
  await checkAuth();
  
  const cookiesList = await cookies();
  const storeId = cookiesList.get('storeId');
  
  if (!storeId) {
    redirect('/admin/login');
  }
  
  return storeId.value;
}

async function clearAuthCookies() {
  const cookiesList = await cookies();
  cookiesList.delete('sb-access-token');
  cookiesList.delete('sb-refresh-token');
}

export async function refreshAuthSession() {
  const cookiesList = await cookies();
  const refreshToken = cookiesList.get('sb-refresh-token')?.value;
  const accessToken = cookiesList.get('sb-access-token')?.value;

  if (!refreshToken) {
    await clearAuthCookies();
    throw new Error('リフレッシュトークンが見つかりません');
  }

  try {
    const supabase = await createUnauthenticatedClient();
    
    // 現在のセッションを無効化
    if (accessToken) {
      await supabase.auth.admin.signOut(accessToken);
    }

    // 新しいセッションを取得
    const { data: { session }, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken
    });

    if (error) {
      await clearAuthCookies();
      throw error;
    }
    
    if (!session) {
      await clearAuthCookies();
      throw new Error('セッションの更新に失敗しました');
    }

    // 新しいトークンを設定
    cookiesList.set({
      name: 'sb-access-token',
      value: session.access_token,
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 1日
    });

    cookiesList.set({
      name: 'sb-refresh-token',
      value: session.refresh_token,
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 1週間
    });

    return session;
  } catch (error) {
    await clearAuthCookies();
    throw error;
  }
}

export async function logout() {
  const supabase = await createUnauthenticatedClient();
  await supabase.auth.signOut();
  
  await clearAuthCookies();
  const cookiesList = await cookies();
  cookiesList.delete('storeId');
  
  redirect('/admin/login');
}

type LoginState = {
  error: string | null;
  success?: boolean;
};

export async function login(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const storeCode = formData.get("storeCode") as string;
  const userId = formData.get("userId") as string;
  const password = formData.get("password") as string;
  const cookiesList = await cookies();

  try {
    // 店舗コードの検証
    const supabase = await createUnauthenticatedClient();
    const { data: store, error: storeError } = await supabase
      .from("stores")
      .select("id")
      .eq("code", storeCode)
      .single();

    if (storeError || !store) {
      return {
        error: "店舗コードが無効です"
      };
    }

    // SupabaseのAuth機能を使用してログイン
    const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
      email: userId,
      password: password,
    });

    if (signInError || !session) {
      return {
        error: "ユーザーIDまたはパスワードが無効です"
      };
    }

    // 認証トークンをcookieに保存
    cookiesList.set({
      name: 'sb-access-token',
      value: session.access_token,
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 1日
    });

    cookiesList.set({
      name: 'sb-refresh-token',
      value: session.refresh_token,
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 1週間
    });

    // 店舗IDをセッションに保存
    cookiesList.set({
      name: 'storeId',
      value: store.id,
      path: '/',
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 1週間
    });

    return {
      error: null,
      success: true
    };
  } catch (error) {
    console.log(error);
    return {
      error: "ログインに失敗しました"
    };
  }
}
