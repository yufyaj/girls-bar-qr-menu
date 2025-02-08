-- store_usersテーブルのポリシー
ALTER TABLE store_users ENABLE ROW LEVEL SECURITY;

-- 店舗に所属するユーザーのみが閲覧可能
CREATE POLICY "View store users" ON store_users
FOR SELECT
TO authenticated
USING (EXISTS (
    SELECT 1 FROM store_users su 
    WHERE su.store_id = store_users.store_id 
    AND su.user_id = auth.uid()
));

-- 店舗に所属するユーザーのみが新規ユーザーを作成可能
CREATE POLICY "Insert store users" ON store_users
FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
    SELECT 1 FROM store_users su 
    WHERE su.store_id = store_id 
    AND su.user_id = auth.uid()
));

-- 店舗に所属するユーザーのみが削除可能
CREATE POLICY "Delete store users" ON store_users
FOR DELETE
TO authenticated
USING (EXISTS (
    SELECT 1 FROM store_users su 
    WHERE su.store_id = store_users.store_id 
    AND su.user_id = auth.uid()
));

-- 権限を設定
GRANT ALL ON store_users TO service_role;
GRANT SELECT ON store_users TO authenticated;

-- service_roleに対するポリシー（全ての操作を許可）
CREATE POLICY "Service role has full access" ON store_users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 認証済みユーザーに対するポリシー（読み取りのみ許可）
CREATE POLICY "Authenticated users can view" ON store_users
FOR SELECT
TO authenticated
USING (true);


-- Add business hours columns to stores table
ALTER TABLE stores
ADD COLUMN opening_time TIME,
ADD COLUMN closing_time TIME;

-- Add deleted_at column to menu_items table for soft delete
ALTER TABLE menu_items
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add deleted_at column to staff table for soft delete
ALTER TABLE staff
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Remove staff_code column from staff table
ALTER TABLE staff
DROP COLUMN staff_code;