
-- TryneX Lifestyle Database Schema

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(50) UNIQUE NOT NULL,
    customer_info JSONB NOT NULL,
    items JSONB NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    method VARCHAR(20) DEFAULT 'website',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    category VARCHAR(50) NOT NULL,
    image TEXT,
    gallery JSONB,
    description TEXT,
    variants JSONB,
    tags JSONB,
    customizable BOOLEAN DEFAULT false,
    featured BOOLEAN DEFAULT false,
    stock_status VARCHAR(20) DEFAULT 'in_stock',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    image TEXT,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Custom designs table
CREATE TABLE IF NOT EXISTS custom_designs (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(50),
    design_data JSONB NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_designs ENABLE ROW LEVEL SECURITY;

-- Policies for public read access
CREATE POLICY "Allow public read on products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public read on categories" ON categories FOR SELECT USING (true);

-- Policies for orders (public insert, admin read)
CREATE POLICY "Allow public insert on orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin read on orders" ON orders FOR SELECT USING (auth.role() = 'authenticated');

-- Insert sample data
INSERT INTO categories (name, slug, description, featured) VALUES
('Mugs', 'mugs', 'Custom printed mugs', true),
('T-Shirts', 't-shirts', 'Custom designed t-shirts', true),
('Bottles', 'bottles', 'Water bottles and tumblers', false),
('Keychains', 'keychains', 'Personalized keychains', false),
('Gifts', 'gifts', 'Custom gift items', true);
