-- サンプル店舗データの挿入
INSERT INTO stores (code, name, address, phone, service_charge, table_charge)
VALUES ('STORE001', 'Girls Bar Sweet', '東京都渋谷区XX-XX', '03-XXXX-XXXX', 1000, 1000);

-- 店舗IDを変数に保存
DO $$
DECLARE
    v_store_id UUID;
BEGIN
    SELECT id INTO v_store_id FROM stores WHERE code = 'STORE001';

    -- サンプル店員データの挿入
    INSERT INTO staff (store_id, name, staff_code) VALUES
    (v_store_id, '山田 花子', 'STAFF001'),
    (v_store_id, '鈴木 美咲', 'STAFF002'),
    (v_store_id, '佐藤 愛', 'STAFF003'),
    (v_store_id, '田中 さくら', 'STAFF004');

    -- サンプルメニューカテゴリの挿入
    INSERT INTO menu_categories (store_id, name, display_order) VALUES
    (v_store_id, 'ビール', 1),
    (v_store_id, 'カクテル', 2),
    (v_store_id, 'ウイスキー', 3),
    (v_store_id, 'ソフトドリンク', 4);

    -- カテゴリIDを取得してメニュー項目を挿入
    WITH categories AS (
        SELECT id, name FROM menu_categories WHERE store_id = v_store_id
    )
    INSERT INTO menu_items (category_id, name, description, price, is_available)
    SELECT 
        c.id,
        item.name,
        item.description,
        item.price,
        true
    FROM categories c,
    (VALUES
        ('ビール', 'プレミアムモルツ', '香り高い最上級の生ビール', 800),
        ('ビール', 'アサヒスーパードライ', 'キレ味さえる辛口ビール', 700),
        ('カクテル', 'ジントニック', 'ジンとトニックウォーターのカクテル', 700),
        ('カクテル', 'モスコミュール', 'ウォッカとジンジャーエールのカクテル', 800),
        ('ウイスキー', '山崎12年', '日本を代表するシングルモルト', 1500),
        ('ウイスキー', 'ジャックダニエル', 'テネシーウイスキーの代表銘柄', 800),
        ('ソフトドリンク', 'コーラ', '炭酸飲料の定番', 500),
        ('ソフトドリンク', 'ジンジャーエール', 'スッキリした味わい', 500)
    ) AS item(category_name, name, description, price)
    WHERE c.name = item.category_name;

    -- サンプルテーブルデータの挿入
    INSERT INTO tables (store_id, table_number) VALUES
    (v_store_id, '1'),
    (v_store_id, '2'),
    (v_store_id, '3'),
    (v_store_id, '4'),
    (v_store_id, '5'),
    (v_store_id, 'VIP1'),
    (v_store_id, 'VIP2');
END $$;
