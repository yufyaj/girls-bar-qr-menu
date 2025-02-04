# Supabaseストレージセットアップ手順

## メニュー画像用バケットの作成

1. Supabaseダッシュボードにログイン
2. 左サイドメニューから「Storage」を選択
3. 「Create new bucket」をクリック
4. バケット名を `menu` と入力
5. 「Make bucket public」にチェックを入れる
6. 「Create bucket」をクリック

## アクセスポリシーの設定

### パブリック読み取りポリシー
1. 作成したメニューバケットの「Policies」タブを選択
2. 「New Policy」をクリック
3. 「Get objects (SELECT)」を選択
4. ポリシー名: `Public read access`
5. アクセス許可: `SELECT`
6. ポリシー定義:
```sql
true
```
7. 「Review」→「Save policy」をクリック

### 認証済みユーザーのアップロードポリシー
1. 再度「New Policy」をクリック
2. 「Insert objects (INSERT)」を選択
3. ポリシー名: `Authenticated user upload`
4. アクセス許可: `INSERT`
5. ポリシー定義:
```sql
auth.role() = 'authenticated'
```
6. 「Review」→「Save policy」をクリック

## ファイルの制限
- MIME Type: `image/*`のみ許可
- 最大ファイルサイズ: 5MB

## 注意事項
- アップロードされた画像は自動的にパブリックアクセス可能になります
- 画像のアップロードは認証済みユーザーのみが可能です
- アップロードされた画像のパスは `menu-images/` ディレクトリ以下に保存されます
