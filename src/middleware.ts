import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // /admin/* のパスのみを対象とする
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // ログインページへのアクセスは許可
  if (request.nextUrl.pathname === '/admin/login') {
    return NextResponse.next();
  }

  // storeIdと認証トークンの存在確認
  const storeId = request.cookies.get('storeId');
  const accessToken = request.cookies.get('sb-access-token');
  const refreshToken = request.cookies.get('sb-refresh-token');
  
  // 未認証の場合はログインページにリダイレクト
  if (!storeId?.value || !accessToken?.value || !refreshToken?.value) {
    const loginUrl = new URL('/admin/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    // 無効なCookieをクリア
    response.cookies.delete('storeId');
    response.cookies.delete('sb-access-token');
    response.cookies.delete('sb-refresh-token');
    return response;
  }

  try {
    // アクセストークンの有効期限をチェック
    const token = accessToken.value.replace(/^base64-/, ''); // プレフィックスを削除
    const tokenData = token.split('.');
    if (tokenData.length !== 3) {
      throw new Error('Invalid token format');
    }

    const decoded = JSON.parse(Buffer.from(tokenData[1], 'base64url').toString());
    const expirationTime = decoded.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();

    // トークンの有効期限が切れている場合は、ログインページにリダイレクト
    if (currentTime >= expirationTime) {
      const loginUrl = new URL('/admin/login', request.url);
      const response = NextResponse.redirect(loginUrl);
      // 無効なCookieをクリア
      response.cookies.delete('storeId');
      response.cookies.delete('sb-access-token');
      response.cookies.delete('sb-refresh-token');
      return response;
    }

    // トークンが有効な場合は次へ
    return NextResponse.next();
  } catch (error) {
    // トークンの検証に失敗した場合は、ログインページにリダイレクト
    const loginUrl = new URL('/admin/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    // 無効なCookieをクリア
    response.cookies.delete('storeId');
    response.cookies.delete('sb-access-token');
    response.cookies.delete('sb-refresh-token');
    return response;
  }
}

// /admin/* のパスに対してのみmiddlewareを適用
export const config = {
  matcher: '/admin/:path*'
};