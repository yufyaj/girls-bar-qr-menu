"use server"

import { createServerSupabaseClient, createUnauthenticatedClient, createServiceRoleClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// 共通のCookie設定
const COOKIE_BASE_OPTIONS = {
  path: '/',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
};

export async function getAuthData() {
  const cookiesList = await cookies();
  const storeId = cookiesList.get('storeId');
  if (!storeId?.value) {
    return null;
  }
  return { storeId: storeId.value };
}

export async function getCurrentStoreId() {
  const authData = await getAuthData();
  if (!authData) {
    redirect('/admin/login');
  }
  return authData.storeId;
}

async function clearAuthCookies() {
  const cookiesList = await cookies();
  const options = {
    ...COOKIE_BASE_OPTIONS,
    maxAge: 0,
    value: '' // 空の値を設定
  };

  try {
    cookiesList.set({ ...options, name: 'sb-access-token' });
    cookiesList.set({ ...options, name: 'sb-refresh-token' });
    cookiesList.set({ ...options, name: 'storeId' });
  } catch (error) {
    console.error('Failed to clear auth cookies:', error);
  }
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
      ...COOKIE_BASE_OPTIONS,
      name: 'sb-access-token',
      value: session.access_token,
      maxAge: 60 * 60 * 24 // 1日
    });

    cookiesList.set({
      ...COOKIE_BASE_OPTIONS,
      name: 'sb-refresh-token',
      value: session.refresh_token,
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
  redirect('/admin/login');
}

type LoginState = {
  error: string | null;
  success?: boolean;
};

type UserCreateData = {
  email: string;
  password: string;
  storeId: string;
};

type UserManagementResponse = {
  error: string | null;
  success: boolean;
};

export async function createUser(data: UserCreateData): Promise<UserManagementResponse> {
  const supabase = await createServiceRoleClient();

  try {
    const { data: { user: createdUser }, error: userError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true
    });

    if (userError) {
      // AuthApiErrorの場合は、エラーコードに基づいてメッセージを設定
      if (userError.code === 'email_exists') {
        return {
          error: "このメールアドレスは既に登録されています",
          success: false
        };
      }
      // その他のAuthApiErrorの場合
      return {
        error: userError.message || "ユーザーの作成に失敗しました",
        success: false
      };
    }

    if (!createdUser) {
      return {
        error: "ユーザーの作成に失敗しました",
        success: false
      };
    }

    try {
      // store_usersテーブルに関連付けを作成
      const { error: linkError } = await supabase
        .from("store_users")
        .insert({
          user_id: createdUser.id,
          store_id: data.storeId
        });

      if (linkError) {
        // ロールバック：ユーザーを削除
        await supabase.auth.admin.deleteUser(createdUser.id);
        return {
          error: "店舗との関連付けに失敗しました",
          success: false
        };
      }

      return {
        error: null,
        success: true
      };
    } catch (linkError) {
      // エラー発生時はユーザーを削除してロールバック
      if (createdUser) {
        await supabase.auth.admin.deleteUser(createdUser.id);
      }
      return {
        error: "店舗との関連付けに失敗しました",
        success: false
      };
    }
  } catch (error) {
    console.error('Failed to create user:', error);
    if (error instanceof Error) {
      return {
        error: error.message,
        success: false
      };
    }
    return {
      error: "予期せぬエラーが発生しました",
      success: false
    };
  }
}

export async function deleteUser(userId: string): Promise<UserManagementResponse> {
  try {
    const supabase = await createServiceRoleClient();
    
    // ユーザーを削除（store_usersテーブルのレコードは外部キー制約により自動的に削除される）
    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
      return {
        error: "ユーザーの削除に失敗しました",
        success: false
      };
    }

    return {
      error: null,
      success: true
    };
  } catch (error) {
    console.error('Failed to delete user:', error);
    return {
      error: "ユーザーの削除に失敗しました",
      success: false
    };
  }
}

export async function getStoreUsers(storeId: string) {
  try {
    // 管理者権限のクライアントを使用
    const supabase = await createServiceRoleClient();
    
    // store_usersテーブルからユーザーIDを取得
    const { data: storeUsers, error: storeUsersError } = await supabase
      .from('store_users')
      .select('user_id')
      .eq('store_id', storeId);

    if (storeUsersError) {
      throw storeUsersError;
    }

    if (!storeUsers.length) {
      return [];
    }

    const userProfiles: any[] = [];
    
    // 各ユーザーのプロフィール情報を取得
    for (const { user_id } of storeUsers) {
      const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(user_id);
      if (!userError && user) {
        userProfiles.push(user);
      }
    }

    return userProfiles
      .filter(user => user.email)
      .map(user => ({
        id: user.id,
        email: user.email as string,
        createdAt: user.created_at || new Date().toISOString(),
        lastSignInAt: user.last_sign_in_at || null
      }));

  } catch (error) {
    console.error('Failed to get store users:', error);
    throw error;
  }
}

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

    // ユーザーが指定した店舗に所属しているか確認
    const { data: storeUser, error: storeUserError } = await supabase
      .from("store_users")
      .select("store_id")
      .eq("user_id", session.user.id)
      .eq("store_id", store.id)
      .single();

    if (storeUserError || !storeUser) {
      await supabase.auth.signOut();
      return {
        error: "このユーザーは指定された店舗にアクセスする権限がありません"
      };
    }

    // アクセストークンをhttpOnlyで保存
    cookiesList.set({
      ...COOKIE_BASE_OPTIONS,
      name: 'sb-access-token',
      value: session.access_token,
      maxAge: 60 * 60 * 24 // 1日
    });

    // リフレッシュトークンをhttpOnlyで保存
    cookiesList.set({
      ...COOKIE_BASE_OPTIONS,
      name: 'sb-refresh-token',
      value: session.refresh_token,
      maxAge: 60 * 60 * 24 * 7 // 1週間
    });

    // 店舗IDをhttpOnlyで保存
    cookiesList.set({
      ...COOKIE_BASE_OPTIONS,
      name: 'storeId',
      value: store.id,
      maxAge: 60 * 60 * 24 * 7 // 1週間
    });

    return {
      error: null,
      success: true
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      error: "ログインに失敗しました"
    };
  }
}
