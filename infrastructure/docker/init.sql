-- Khởi tạo Extension cho UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Bảng Danh mục sản phẩm (Phân cấp cha-con)
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng Sản phẩm (Thông tin chung)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Bảng Biến thể sản phẩm (Nơi lưu SKU, Giá, và Tồn kho thực tế)
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    sku VARCHAR(100) UNIQUE NOT NULL,
    price DECIMAL(12, 2) NOT NULL DEFAULT 0,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    attributes JSONB, -- Ví dụ: {"color": "Blue", "ram": "8GB"}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Bảng Đơn hàng
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name VARCHAR(255),
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, COMPLETED, CANCELLED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Chi tiết đơn hàng (Mua sản phẩm nào, biến thể nào)
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id),
    quantity INTEGER NOT NULL,
    price_at_purchase DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Lịch sử thay đổi kho (Audit Log)
CREATE TABLE IF NOT EXISTS stock_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    variant_id UUID REFERENCES product_variants(id),
    quantity_change INTEGER NOT NULL,
    reason VARCHAR(255), -- "order", "restock", "return"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- DỮ LIỆU MẪU (SEED DATA)
-- ==========================================

-- Thêm Categories
INSERT INTO categories (id, name, slug) VALUES 
('11111111-1111-1111-1111-111111111111', 'Electronics', 'electronics'),
('22222222-2222-2222-2222-222222222222', 'Accessories', 'accessories');

-- Thêm Products
INSERT INTO products (id, name, description, category_id) VALUES 
('33333333-3333-3333-3333-333333333333', 'iPhone 15 Pro', 'Flagship phone from Apple', '11111111-1111-1111-1111-111111111111'),
('44444444-4444-4444-4444-444444444444', 'Sony WH-1000XM5', 'Noise cancelling headphones', '22222222-2222-2222-2222-222222222222');

-- Thêm Variants (Gắn giá và kho vào đây)
INSERT INTO product_variants (id, product_id, sku, price, stock_quantity, attributes) VALUES 
('55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', 'IPHONE-15-BLU-256', 999.00, 10, '{"color": "Titanium Blue", "storage": "256GB"}'),
('66666666-6666-6666-6666-666666666666', '44444444-4444-4444-4444-444444444444', 'SONY-XM5-BLK', 349.00, 15, '{"color": "Black"}');
