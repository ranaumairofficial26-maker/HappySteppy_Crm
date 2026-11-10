const http = require('http');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const PORT = process.env.PORT || 5000;

// PostgreSQL Connection Pool (Supports both local and Render DATABASE_URL)
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        user: process.env.PGUSER || 'postgres',
        host: process.env.PGHOST || 'localhost',
        database: process.env.PGDATABASE || 'happysteppy',
        password: process.env.PGPASSWORD || '1234',
        port: parseInt(process.env.PGPORT || '5432', 10),
      }
);

// Verify connection and ensure schema & seed data
async function initDatabase() {
  try {
    const client = await pool.connect();
    console.log('[PostgreSQL] Connected to PostgreSQL 18 successfully on localhost:5432 (database: happysteppy)');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS brands (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL UNIQUE,
        icon VARCHAR(100) NOT NULL,
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Check count and seed if empty
    const countRes = await client.query('SELECT COUNT(*) as count FROM brands;');
    if (parseInt(countRes.rows[0].count, 10) === 0) {
      const seedQuery = `
        INSERT INTO brands (name, icon, display_order, is_active) VALUES
          ('Bioray', 'fa-solid fa-flask', 1, true),
          ('CBD Plus', 'fa-solid fa-leaf', 2, true),
          ('Designs for Health', 'fa-solid fa-heart-pulse', 3, true),
          ('Kirkman', 'fa-solid fa-capsules', 4, true),
          ('Life Extension', 'fa-solid fa-dna', 5, true),
          ('Mary Ruth', 'fa-solid fa-shield-heart', 6, true),
          ('Nature''s Answer', 'fa-solid fa-seedling', 7, true),
          ('Nature''s Way', 'fa-solid fa-tree', 8, true),
          ('NOW Foods', 'fa-solid fa-apple-whole', 9, true)
        ON CONFLICT (name) DO NOTHING;
      `;
      await client.query(seedQuery);
      console.log('[PostgreSQL] Seeded initial 9 brands into PostgreSQL database.');
    }

    // Ensure trending_products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS trending_products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) DEFAULT 'Supplements',
        discount INTEGER DEFAULT 0,
        rating NUMERIC(2, 1) DEFAULT 5.0,
        review_count VARCHAR(50) DEFAULT '1.0k',
        price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
        original_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
        image_url TEXT NOT NULL,
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const prodCountRes = await client.query('SELECT COUNT(*) as count FROM trending_products;');
    if (parseInt(prodCountRes.rows[0].count, 10) === 0) {
      const seedProds = `
        INSERT INTO trending_products 
          (name, category, discount, rating, review_count, price, original_price, image_url, display_order, is_active) 
        VALUES
          ('Nordic Naturals Omega-3 1560 mg 8 Oz Liquid', 'Supplements', 15, 5.0, '2.4k', 9800.00, 11500.00, 'assets/images/nordic-naturals-omega-3.jpg', 1, true),
          ('Bioray Belly Mend', 'Supplements', 20, 5.0, '1.2k', 8200.00, 10250.00, 'assets/images/bioray-belly-mend.webp', 2, true);
      `;
      await client.query(seedProds);
      console.log('[PostgreSQL] Seeded initial 2 trending products into PostgreSQL database.');
    }

    // Ensure homepage_promo_banner table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS homepage_promo_banner (
        id SERIAL PRIMARY KEY,
        event_tag VARCHAR(150) NOT NULL DEFAULT 'HOME REFRESH EVENT',
        title VARCHAR(255) NOT NULL DEFAULT 'Refresh Your Space',
        subtitle TEXT NOT NULL DEFAULT 'Discover modern essentials for every corner of your home.',
        discount_text VARCHAR(100) NOT NULL DEFAULT '40% OFF',
        button_text VARCHAR(100) NOT NULL DEFAULT 'Discover Now',
        button_url VARCHAR(255) NOT NULL DEFAULT '#trending-products',
        image_url TEXT NOT NULL DEFAULT 'assets/images/home-refresh-banner.jpg',
        recommended_width INTEGER NOT NULL DEFAULT 1200,
        recommended_height INTEGER NOT NULL DEFAULT 200,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const promoCountRes = await client.query('SELECT COUNT(*) as count FROM homepage_promo_banner;');
    if (parseInt(promoCountRes.rows[0].count, 10) === 0) {
      await client.query(`
        INSERT INTO homepage_promo_banner 
          (id, event_tag, title, subtitle, discount_text, button_text, button_url, image_url, recommended_width, recommended_height)
        VALUES 
          (1, 'HOME REFRESH EVENT', 'Refresh Your Space', 'Discover modern essentials for every corner of your home.', '40% OFF', 'Discover Now', '#trending-products', 'assets/images/home-refresh-banner.jpg', 1200, 200)
        ON CONFLICT (id) DO NOTHING;
      `);
      console.log('[PostgreSQL] Seeded initial promo banner into PostgreSQL database.');
    }

    // Ensure homepage_footer table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS homepage_footer (
        id SERIAL PRIMARY KEY,
        logo_url TEXT NOT NULL DEFAULT 'assets/images/logo.png',
        about_text TEXT NOT NULL DEFAULT 'Your one-stop shop for health supplements, sensory care, tech, and lifestyle essentials.',
        trust_badge_text VARCHAR(150) NOT NULL DEFAULT '100% Guaranteed & Verified',
        contact_phone VARCHAR(100) NOT NULL DEFAULT '+92 317 4641903',
        contact_email VARCHAR(150) NOT NULL DEFAULT 'support@happysteppy.com',
        newsletter_title VARCHAR(200) NOT NULL DEFAULT 'Stay in the Loop',
        newsletter_subtitle TEXT NOT NULL DEFAULT 'Get the latest deals, new arrivals and exclusive store discounts.',
        social_instagram TEXT NOT NULL DEFAULT 'https://www.instagram.com/happysteppy01',
        social_facebook TEXT NOT NULL DEFAULT 'https://www.facebook.com/happysteppyltd',
        social_whatsapp TEXT NOT NULL DEFAULT 'https://wa.me/923174641903',
        social_tiktok TEXT NOT NULL DEFAULT 'https://www.tiktok.com/@happysteppy.pk',
        social_youtube TEXT NOT NULL DEFAULT 'https://youtube.com',
        social_x TEXT NOT NULL DEFAULT 'https://x.com',
        copyright_text VARCHAR(255) NOT NULL DEFAULT '© 2026 Happy Steppy. All rights reserved.',
        privacy_policy_url VARCHAR(255) NOT NULL DEFAULT '#',
        terms_url VARCHAR(255) NOT NULL DEFAULT '#',
        show_instagram BOOLEAN DEFAULT true,
        show_facebook BOOLEAN DEFAULT true,
        show_whatsapp BOOLEAN DEFAULT true,
        show_tiktok BOOLEAN DEFAULT true,
        show_youtube BOOLEAN DEFAULT true,
        show_x BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE homepage_footer ADD COLUMN IF NOT EXISTS show_instagram BOOLEAN DEFAULT true;
      ALTER TABLE homepage_footer ADD COLUMN IF NOT EXISTS show_facebook BOOLEAN DEFAULT true;
      ALTER TABLE homepage_footer ADD COLUMN IF NOT EXISTS show_whatsapp BOOLEAN DEFAULT true;
      ALTER TABLE homepage_footer ADD COLUMN IF NOT EXISTS show_tiktok BOOLEAN DEFAULT true;
      ALTER TABLE homepage_footer ADD COLUMN IF NOT EXISTS show_youtube BOOLEAN DEFAULT true;
      ALTER TABLE homepage_footer ADD COLUMN IF NOT EXISTS show_x BOOLEAN DEFAULT true;
    `);

    const footerCountRes = await client.query('SELECT COUNT(*) as count FROM homepage_footer;');
    if (parseInt(footerCountRes.rows[0].count, 10) === 0) {
      await client.query(`
        INSERT INTO homepage_footer 
          (id, logo_url, about_text, trust_badge_text, contact_phone, contact_email, newsletter_title, newsletter_subtitle, social_instagram, social_facebook, social_whatsapp, social_tiktok, social_youtube, social_x, copyright_text, privacy_policy_url, terms_url)
        VALUES 
          (1, 'assets/images/logo.png', 'Your one-stop shop for health supplements, sensory care, tech, and lifestyle essentials.', '100% Guaranteed & Verified', '+92 317 4641903', 'support@happysteppy.com', 'Stay in the Loop', 'Get the latest deals, new arrivals and exclusive store discounts.', 'https://www.instagram.com/happysteppy01', 'https://www.facebook.com/happysteppyltd', 'https://wa.me/923174641903', 'https://www.tiktok.com/@happysteppy.pk', 'https://youtube.com', 'https://x.com', '© 2026 Happy Steppy. All rights reserved.', '#', '#')
        ON CONFLICT (id) DO NOTHING;
      `);
      console.log('[PostgreSQL] Seeded initial footer settings into PostgreSQL database.');
    }

    // Ensure homepage_styles table exists (4 "Shop by Style" Cards)
    await client.query(`
      CREATE TABLE IF NOT EXISTS homepage_styles (
        id SERIAL PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        subtitle VARCHAR(255) NOT NULL,
        image_url TEXT NOT NULL,
        link_url VARCHAR(255) NOT NULL DEFAULT '/shop',
        display_order INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    const stylesCount = await client.query('SELECT COUNT(*) as count FROM homepage_styles;');
    if (parseInt(stylesCount.rows[0].count, 10) === 0) {
      await client.query(`
        INSERT INTO homepage_styles (id, title, subtitle, image_url, link_url, display_order) VALUES
          (1, 'Tech Lover', 'Smart & connected', 'assets/images/style-tech.jpg', '/shop?cat=tech', 1),
          (2, 'Modern Fashion', 'Trendy & versatile', 'assets/images/style-fashion.jpg', '/shop?cat=fashion', 2),
          (3, 'Home Vibes', 'Cozy & stylish', 'assets/images/style-home.jpg', '/shop?cat=home', 3),
          (4, 'Active Life', 'Fit, strong & healthy', 'assets/images/style-active.jpg', '/shop?cat=active', 4)
        ON CONFLICT (id) DO NOTHING;
      `);
      console.log('[PostgreSQL] Seeded initial 4 Style categories.');
    }

    // Ensure homepage_flash_sale table exists (Sale Deal Box)
    await client.query(`
      CREATE TABLE IF NOT EXISTS homepage_flash_sale (
        id SERIAL PRIMARY KEY,
        title VARCHAR(100) NOT NULL DEFAULT 'Sale',
        product_name VARCHAR(255) NOT NULL DEFAULT 'Bioray Belly Mend',
        rating NUMERIC(3,1) NOT NULL DEFAULT 5.0,
        review_count VARCHAR(50) NOT NULL DEFAULT '1.2k',
        sale_price NUMERIC(10,2) NOT NULL DEFAULT 8200.00,
        original_price NUMERIC(10,2) NOT NULL DEFAULT 10250.00,
        discount_percentage INTEGER NOT NULL DEFAULT 20,
        stock_left_text VARCHAR(100) NOT NULL DEFAULT 'Only 15 left!',
        button_text VARCHAR(100) NOT NULL DEFAULT 'Grab the Deal',
        button_url VARCHAR(255) NOT NULL DEFAULT '#trending-products',
        image_url TEXT NOT NULL DEFAULT 'assets/images/bioray-belly-mend.webp',
        secondary_image_url TEXT NOT NULL DEFAULT 'assets/images/bioray-belly-mend-bottle.webp',
        ends_in_hours INTEGER NOT NULL DEFAULT 12,
        ends_in_minutes INTEGER NOT NULL DEFAULT 0,
        ends_in_seconds INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    const flashCount = await client.query('SELECT COUNT(*) as count FROM homepage_flash_sale;');
    if (parseInt(flashCount.rows[0].count, 10) === 0) {
      await client.query(`
        INSERT INTO homepage_flash_sale 
          (id, title, product_name, rating, review_count, sale_price, original_price, discount_percentage, stock_left_text, button_text, button_url, image_url, secondary_image_url, ends_in_hours, ends_in_minutes, ends_in_seconds)
        VALUES 
          (1, 'Sale', 'Bioray Belly Mend', 5.0, '1.2k', 8200.00, 10250.00, 20, 'Only 15 left!', 'Grab the Deal', '#trending-products', 'assets/images/bioray-belly-mend.webp', 'assets/images/bioray-belly-mend-bottle.webp', 11, 59, 55)
        ON CONFLICT (id) DO NOTHING;
      `);
      console.log('[PostgreSQL] Seeded initial Flash Sale deal.');
    }

    // Ensure homepage_testimonials table exists (Customer Reviews)
    await client.query(`
      CREATE TABLE IF NOT EXISTS homepage_testimonials (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        role VARCHAR(150) NOT NULL DEFAULT 'Verified Buyer',
        comment TEXT NOT NULL,
        avatar_url TEXT NOT NULL DEFAULT 'assets/images/avatar-emily.jpg',
        display_order INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    const testCount = await client.query('SELECT COUNT(*) as count FROM homepage_testimonials;');
    if (parseInt(testCount.rows[0].count, 10) === 0) {
      await client.query(`
        INSERT INTO homepage_testimonials (id, name, role, comment, avatar_url, display_order) VALUES
          (1, 'Marcus K.', 'Verified Buyer', 'Exceptional service and authentic supplements. Happy Steppy is my go-to...', 'assets/images/avatar-emily.jpg', 1),
          (2, 'Emily R.', 'Verified Buyer', 'The quality and presentation exceeded my expectations. Fast delivery across Pakistan!', 'assets/images/avatar-emily.jpg', 2),
          (3, 'Zainab A.', 'Verified Buyer', 'Loved the product range. Pure organic supplements at best prices.', 'assets/images/avatar-emily.jpg', 3)
        ON CONFLICT (id) DO NOTHING;
      `);
      console.log('[PostgreSQL] Seeded initial customer reviews.');
    }

    // Ensure homepage_social_proof table exists (Shoppers Badge & Trusted Brands)
    await client.query(`
      CREATE TABLE IF NOT EXISTS homepage_social_proof (
        id SERIAL PRIMARY KEY,
        shoppers_caption VARCHAR(100) NOT NULL DEFAULT 'Loved by',
        shoppers_count VARCHAR(100) NOT NULL DEFAULT '500,000+',
        shoppers_label VARCHAR(100) NOT NULL DEFAULT 'Happy Shoppers',
        trusted_brands JSONB NOT NULL DEFAULT '["Puma", "Nordic Naturals", "NovaTech", "UrbanFit", "Bioray", "Nova"]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    const proofCount = await client.query('SELECT COUNT(*) as count FROM homepage_social_proof;');
    if (parseInt(proofCount.rows[0].count, 10) === 0) {
      await client.query(`
        INSERT INTO homepage_social_proof (id, shoppers_caption, shoppers_count, shoppers_label, trusted_brands) VALUES
          (1, 'Loved by', '500,000+', 'Happy Shoppers', '["Puma", "Nordic Naturals", "NovaTech", "UrbanFit", "Bioray", "Nova"]'::jsonb)
        ON CONFLICT (id) DO NOTHING;
      `);
      console.log('[PostgreSQL] Seeded initial social proof data.');
    }

    // Synchronize auto-increment sequences after seeding to prevent primary key conflicts
    await client.query(`
      SELECT setval(pg_get_serial_sequence('homepage_testimonials', 'id'), COALESCE((SELECT MAX(id) FROM homepage_testimonials), 1));
      SELECT setval(pg_get_serial_sequence('homepage_styles', 'id'), COALESCE((SELECT MAX(id) FROM homepage_styles), 1));
      SELECT setval(pg_get_serial_sequence('trending_products', 'id'), COALESCE((SELECT MAX(id) FROM trending_products), 1));
      SELECT setval(pg_get_serial_sequence('brands', 'id'), COALESCE((SELECT MAX(id) FROM brands), 1));
    `);
    console.log('[PostgreSQL] Synchronized serial sequences for all auto-increment tables.');

    client.release();
  } catch (err) {
    console.error('[PostgreSQL Error] Failed to initialize database:', err.message);
  }
}

initDatabase();

const OPENAPI_SPEC = {
  openapi: "3.0.1",
  info: {
    title: "Happy Steppy API (.NET 8 & PostgreSQL Database)",
    version: "v1",
    description: "Production RESTful Web API for Happy Steppy backed by PostgreSQL 18 (database: happysteppy, port: 5432) and Repository Pattern"
  },
  paths: {
    "/api/status": {
      get: {
        tags: ["System"],
        summary: "Database & API Health Check",
        responses: { "200": { description: "Service is online" } }
      }
    },
    "/api/brands": {
      get: {
        tags: ["Top Brands (Sidebar)"],
        summary: "Get all active sidebar top brands from PostgreSQL database",
        responses: { "200": { description: "List of active brands" } }
      },
      post: {
        tags: ["Top Brands (Sidebar)"],
        summary: "Create a new sidebar brand and save to PostgreSQL database",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Thorne" },
                  icon: { type: "string", example: "fa-solid fa-flask" },
                  displayOrder: { type: "integer", example: 10 }
                },
                required: ["name"]
              }
            }
          }
        },
        responses: { "201": { description: "Brand created in PostgreSQL" } }
      }
    },
    "/api/brands/{id}": {
      get: {
        tags: ["Top Brands (Sidebar)"],
        summary: "Get brand by ID from PostgreSQL database",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { "200": { description: "Brand details" } }
      },
      put: {
        tags: ["Top Brands (Sidebar)"],
        summary: "Update an existing brand in PostgreSQL database",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  icon: { type: "string" },
                  displayOrder: { type: "integer" },
                  isActive: { type: "boolean" }
                }
              }
            }
          }
        },
        responses: { "200": { description: "Brand updated" } }
      },
      delete: {
        tags: ["Top Brands (Sidebar)"],
        summary: "Delete brand from PostgreSQL database",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { "200": { description: "Brand deleted" } }
      }
    },
    "/api/brands/reorder": {
      post: {
        tags: ["Top Brands (Sidebar)"],
        summary: "Reorder sidebar brands by updating display_order in PostgreSQL database",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  brandIds: {
                    type: "array",
                    items: { type: "integer" },
                    example: [2, 1, 3, 4, 5, 6, 7, 8, 9]
                  }
                }
              }
            }
          }
        },
        responses: { "200": { description: "Reordered list of brands" } }
      }
    },
    "/api/homepage/hero": {
      get: {
        tags: ["Home Page Management"],
        summary: "Get Homepage Hero Banner settings and dimensions",
        responses: { "200": { description: "Hero banner settings" } }
      },
      put: {
        tags: ["Home Page Management"],
        summary: "Update Homepage Hero Banner settings (image, badge, text, buttons)",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object" } } }
        },
        responses: { "200": { description: "Hero banner updated" } }
      }
    },
    "/api/homepage/feature-cards": {
      get: {
        tags: ["Home Page Management"],
        summary: "Get 4 Trust & Feature Badges",
        responses: { "200": { description: "List of 4 trust feature cards" } }
      },
      put: {
        tags: ["Home Page Management"],
        summary: "Update 4 Trust & Feature Badges (icons, titles, subtitles)",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object" } } }
        },
        responses: { "200": { description: "Cards updated" } }
      }
    }
  }
};

const SWAGGER_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Happy Steppy API - Swagger UI</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
  <style>
    body { margin: 0; background: #fafafa; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .topbar { display: none; }
    .swagger-ui .info { margin: 25px 0 20px; }
    .swagger-ui .info .title { color: #2f6100; font-weight: 800; font-size: 28px; }
    .swagger-ui .btn.authorize { color: #478401; border-color: #478401; }
    .swagger-ui .opblock.opblock-get .opblock-summary-method { background: #2f6100; }
    .swagger-ui .opblock.opblock-post .opblock-summary-method { background: #478401; }
    .swagger-ui .opblock.opblock-put .opblock-summary-method { background: #d97706; }
    .swagger-ui .opblock.opblock-delete .opblock-summary-method { background: #dc2626; }
  </style>
</head>
<body>
  <div style="background: linear-gradient(135deg, #478401 0%, #2f6100 100%); color: white; padding: 18px 30px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 2px 10px rgba(0,0,0,0.15);">
    <div style="display:flex; align-items:center; gap:12px;">
      <span style="background:white; color:#2f6100; padding:6px 12px; border-radius:6px; font-weight:900; font-size:16px;">HS</span>
      <div>
        <h1 style="margin:0; font-size:1.3rem; font-weight:800;">Happy Steppy API Explorer</h1>
        <p style="margin:2px 0 0; font-size:0.8rem; opacity:0.9;">Connected to PostgreSQL 18 Database: <strong>happysteppy</strong> (Port: 5432)</p>
      </div>
    </div>
    <div>
      <a href="http://localhost:4200/admin" style="background:rgba(255,255,255,0.2); color:white; padding:8px 16px; border-radius:8px; text-decoration:none; font-size:0.85rem; font-weight:700; margin-right:8px;">Admin Panel</a>
      <a href="http://localhost:4200" style="background:white; color:#2f6100; padding:8px 16px; border-radius:8px; text-decoration:none; font-size:0.85rem; font-weight:700;">View Store</a>
    </div>
  </div>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      SwaggerUIBundle({
        url: "/swagger/v1/swagger.json",
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout"
      });
    };
  </script>
</body>
</html>`;

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch {
        resolve({});
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // Root redirect to /swagger
  if (pathname === '/' || pathname === '/swagger') {
    res.writeHead(301, { Location: '/swagger/index.html' });
    res.end();
    return;
  }

  // Swagger UI HTML
  if (pathname === '/swagger/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(SWAGGER_HTML);
    return;
  }

  // Swagger JSON OpenAPI Spec
  if (pathname === '/swagger/v1/swagger.json') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(OPENAPI_SPEC));
    return;
  }

  // Static uploads serving (/uploads/* or /assets/uploads/*)
  if (pathname.startsWith('/uploads/') || pathname.startsWith('/assets/uploads/')) {
    const filename = path.basename(pathname);
    const filePath = path.resolve(__dirname, '../frontend/public/assets/uploads', filename);
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filename).toLowerCase();
      let contentType = 'image/jpeg';
      if (ext === '.png') contentType = 'image/png';
      else if (ext === '.webp') contentType = 'image/webp';
      else if (ext === '.gif') contentType = 'image/gif';
      else if (ext === '.svg') contentType = 'image/svg+xml';

      res.writeHead(200, {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=86400'
      });
      fs.createReadStream(filePath).pipe(res);
      return;
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'File not found' }));
      return;
    }
  }

  // GET /api/status
  if (pathname === '/api/status' && req.method === 'GET') {
    try {
      const brandCount = await pool.query('SELECT COUNT(*) as count FROM brands WHERE is_active = true;');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'Online',
        database: 'PostgreSQL 18 (database: happysteppy, port: 5432)',
        brandsCount: parseInt(brandCount.rows[0].count, 10),
        timestamp: new Date().toISOString()
      }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }


  // ==========================================
  // 6. HOMEPAGE STYLES (Shop by Style - 4 Cards)
  // ==========================================
  if (pathname === '/api/homepage/styles' && req.method === 'GET') {
    try {
      const result = await pool.query(`
        SELECT id, title, subtitle, image_url as "imageUrl", link_url as "linkUrl", display_order as "displayOrder"
        FROM homepage_styles
        ORDER BY display_order ASC;
      `);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result.rows));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  if (pathname === '/api/homepage/styles' && req.method === 'PUT') {
    try {
      const styles = await parseBody(req);
      if (Array.isArray(styles)) {
        for (const item of styles) {
          await pool.query(`
            UPDATE homepage_styles
            SET 
              title = COALESCE($1, title),
              subtitle = COALESCE($2, subtitle),
              image_url = COALESCE($3, image_url),
              link_url = COALESCE($4, link_url),
              display_order = COALESCE($5, display_order),
              updated_at = CURRENT_TIMESTAMP
            WHERE id = $6;
          `, [item.title, item.subtitle, item.imageUrl, item.linkUrl, item.displayOrder, item.id]);
        }
      }
      const updated = await pool.query(`
        SELECT id, title, subtitle, image_url as "imageUrl", link_url as "linkUrl", display_order as "displayOrder"
        FROM homepage_styles
        ORDER BY display_order ASC;
      `);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(updated.rows));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // ==========================================
  // 7. HOMEPAGE FLASH SALE DEAL (Sale Box)
  // ==========================================
  if (pathname === '/api/homepage/flash-sale' && req.method === 'GET') {
    try {
      const result = await pool.query(`
        SELECT 
          id, 
          title, 
          product_name as "productName", 
          rating::float as rating, 
          review_count as "reviewCount", 
          sale_price::float as "salePrice", 
          original_price::float as "originalPrice", 
          discount_percentage as "discountPercentage", 
          stock_left_text as "stockLeftText", 
          button_text as "buttonText", 
          button_url as "buttonUrl", 
          image_url as "imageUrl", 
          secondary_image_url as "secondaryImageUrl", 
          ends_in_hours as "endsInHours", 
          ends_in_minutes as "endsInMinutes", 
          ends_in_seconds as "endsInSeconds"
        FROM homepage_flash_sale
        WHERE id = 1;
      `);
      if (result.rowCount === 0) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Flash sale not found' }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result.rows[0]));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  if (pathname === '/api/homepage/flash-sale' && req.method === 'PUT') {
    try {
      const data = await parseBody(req);
      const rating = isNaN(parseFloat(data.rating)) ? 5.0 : parseFloat(data.rating);
      const salePrice = isNaN(parseFloat(data.salePrice)) ? 8200.00 : parseFloat(data.salePrice);
      const originalPrice = isNaN(parseFloat(data.originalPrice)) ? 10250.00 : parseFloat(data.originalPrice);
      const discountPercentage = isNaN(parseInt(data.discountPercentage, 10)) ? 20 : parseInt(data.discountPercentage, 10);
      const endsInHours = isNaN(parseInt(data.endsInHours, 10)) ? 11 : parseInt(data.endsInHours, 10);
      const endsInMinutes = isNaN(parseInt(data.endsInMinutes, 10)) ? 59 : parseInt(data.endsInMinutes, 10);
      const endsInSeconds = isNaN(parseInt(data.endsInSeconds, 10)) ? 55 : parseInt(data.endsInSeconds, 10);

      const updateRes = await pool.query(`
        INSERT INTO homepage_flash_sale (
          id, title, product_name, rating, review_count, sale_price, original_price,
          discount_percentage, stock_left_text, button_text, button_url,
          image_url, secondary_image_url, ends_in_hours, ends_in_minutes, ends_in_seconds, updated_at
        )
        VALUES (
          1,
          COALESCE($1, 'Sale'),
          COALESCE($2, 'Bioray Belly Mend'),
          COALESCE($3, 5.0),
          COALESCE($4, '1.2k'),
          COALESCE($5, 8200.00),
          COALESCE($6, 10250.00),
          COALESCE($7, 20),
          COALESCE($8, 'Only 15 left!'),
          COALESCE($9, 'Grab the Deal'),
          COALESCE($10, '#trending-products'),
          COALESCE($11, 'assets/images/bioray-belly-mend.webp'),
          COALESCE($12, 'assets/images/bioray-belly-mend-bottle.webp'),
          COALESCE($13, 11),
          COALESCE($14, 59),
          COALESCE($15, 55),
          CURRENT_TIMESTAMP
        )
        ON CONFLICT (id) DO UPDATE SET
          title = COALESCE($1, homepage_flash_sale.title),
          product_name = COALESCE($2, homepage_flash_sale.product_name),
          rating = COALESCE($3, homepage_flash_sale.rating),
          review_count = COALESCE($4, homepage_flash_sale.review_count),
          sale_price = COALESCE($5, homepage_flash_sale.sale_price),
          original_price = COALESCE($6, homepage_flash_sale.original_price),
          discount_percentage = COALESCE($7, homepage_flash_sale.discount_percentage),
          stock_left_text = COALESCE($8, homepage_flash_sale.stock_left_text),
          button_text = COALESCE($9, homepage_flash_sale.button_text),
          button_url = COALESCE($10, homepage_flash_sale.button_url),
          image_url = COALESCE($11, homepage_flash_sale.image_url),
          secondary_image_url = COALESCE($12, homepage_flash_sale.secondary_image_url),
          ends_in_hours = COALESCE($13, homepage_flash_sale.ends_in_hours),
          ends_in_minutes = COALESCE($14, homepage_flash_sale.ends_in_minutes),
          ends_in_seconds = COALESCE($15, homepage_flash_sale.ends_in_seconds),
          updated_at = CURRENT_TIMESTAMP
        RETURNING
          id, 
          title, 
          product_name as "productName", 
          rating::float as rating, 
          review_count as "reviewCount", 
          sale_price::float as "salePrice", 
          original_price::float as "originalPrice", 
          discount_percentage as "discountPercentage", 
          stock_left_text as "stockLeftText", 
          button_text as "buttonText", 
          button_url as "buttonUrl", 
          image_url as "imageUrl", 
          secondary_image_url as "secondaryImageUrl", 
          ends_in_hours as "endsInHours", 
          ends_in_minutes as "endsInMinutes", 
          ends_in_seconds as "endsInSeconds";
      `, [
        data.title, data.productName, rating, data.reviewCount,
        salePrice, originalPrice, discountPercentage,
        data.stockLeftText, data.buttonText, data.buttonUrl,
        data.imageUrl, data.secondaryImageUrl,
        endsInHours, endsInMinutes, endsInSeconds
      ]);
      const responseData = updateRes.rows[0] || {};
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(responseData));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // ==========================================
  // 8. HOMEPAGE TESTIMONIALS (Customer Reviews)
  // ==========================================
  if (pathname === '/api/homepage/testimonials' && req.method === 'GET') {
    try {
      const result = await pool.query(`
        SELECT id, name, role, comment, avatar_url as "avatarUrl", display_order as "displayOrder"
        FROM homepage_testimonials
        ORDER BY display_order ASC, id ASC;
      `);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result.rows));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  if (pathname === '/api/homepage/testimonials' && req.method === 'POST') {
    try {
      const data = await parseBody(req);
      const displayOrder = isNaN(parseInt(data.displayOrder, 10)) ? 99 : parseInt(data.displayOrder, 10);
      let insRes;
      try {
        insRes = await pool.query(`
          INSERT INTO homepage_testimonials (name, role, comment, avatar_url, display_order)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id, name, role, comment, avatar_url as "avatarUrl", display_order as "displayOrder";
        `, [
          data.name || 'Anonymous',
          data.role || 'Verified Buyer',
          data.comment || '',
          data.avatarUrl || 'assets/images/avatar-emily.jpg',
          displayOrder
        ]);
      } catch (insertErr) {
        // If serial sequence was desynchronized by prior manual inserts, auto-resync and retry
        if (insertErr.code === '23505') {
          await pool.query(`SELECT setval(pg_get_serial_sequence('homepage_testimonials', 'id'), COALESCE((SELECT MAX(id) FROM homepage_testimonials), 1));`);
          insRes = await pool.query(`
            INSERT INTO homepage_testimonials (name, role, comment, avatar_url, display_order)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, name, role, comment, avatar_url as "avatarUrl", display_order as "displayOrder";
          `, [
            data.name || 'Anonymous',
            data.role || 'Verified Buyer',
            data.comment || '',
            data.avatarUrl || 'assets/images/avatar-emily.jpg',
            displayOrder
          ]);
        } else {
          throw insertErr;
        }
      }
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(insRes.rows[0]));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  const matchTestimonialUpdate = pathname.match(/^\/api\/homepage\/testimonials\/(\d+)$/);
  if (matchTestimonialUpdate && req.method === 'PUT') {
    const id = parseInt(matchTestimonialUpdate[1], 10);
    try {
      const data = await parseBody(req);
      const displayOrder = data.displayOrder !== undefined ? (isNaN(parseInt(data.displayOrder, 10)) ? 1 : parseInt(data.displayOrder, 10)) : null;
      const updRes = await pool.query(`
        UPDATE homepage_testimonials
        SET
          name = COALESCE($1, name),
          role = COALESCE($2, role),
          comment = COALESCE($3, comment),
          avatar_url = COALESCE($4, avatar_url),
          display_order = COALESCE($5, display_order),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $6
        RETURNING id, name, role, comment, avatar_url as "avatarUrl", display_order as "displayOrder";
      `, [data.name, data.role, data.comment, data.avatarUrl, displayOrder, id]);
      if (updRes.rowCount === 0) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Testimonial not found' }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(updRes.rows[0]));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  if (matchTestimonialUpdate && req.method === 'DELETE') {
    const id = parseInt(matchTestimonialUpdate[1], 10);
    try {
      await pool.query('DELETE FROM homepage_testimonials WHERE id = $1;', [id]);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Testimonial deleted' }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // ==========================================
  // 9. HOMEPAGE SOCIAL PROOF & TRUSTED BRANDS
  // ==========================================
  if (pathname === '/api/homepage/social-proof' && req.method === 'GET') {
    try {
      const result = await pool.query(`
        SELECT 
          id, 
          shoppers_caption as "shoppersCaption", 
          shoppers_count as "shoppersCount", 
          shoppers_label as "shoppersLabel", 
          trusted_brands as "trustedBrands"
        FROM homepage_social_proof
        WHERE id = 1;
      `);
      if (result.rowCount === 0) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Social proof not found' }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result.rows[0]));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  if (pathname === '/api/homepage/social-proof' && req.method === 'PUT') {
    try {
      const data = await parseBody(req);
      const brandsJson = Array.isArray(data.trustedBrands)
        ? JSON.stringify(data.trustedBrands)
        : JSON.stringify(["Puma", "Nordic Naturals", "NovaTech", "UrbanFit", "Bioray", "Nova"]);

      const updateRes = await pool.query(`
        INSERT INTO homepage_social_proof (id, shoppers_caption, shoppers_count, shoppers_label, trusted_brands, updated_at)
        VALUES (
          1,
          COALESCE($1, 'Loved by'),
          COALESCE($2, '500,000+'),
          COALESCE($3, 'Happy Shoppers'),
          $4::jsonb,
          CURRENT_TIMESTAMP
        )
        ON CONFLICT (id) DO UPDATE SET
          shoppers_caption = COALESCE($1, homepage_social_proof.shoppers_caption),
          shoppers_count = COALESCE($2, homepage_social_proof.shoppers_count),
          shoppers_label = COALESCE($3, homepage_social_proof.shoppers_label),
          trusted_brands = COALESCE($4::jsonb, homepage_social_proof.trusted_brands),
          updated_at = CURRENT_TIMESTAMP
        RETURNING
          id, 
          shoppers_caption as "shoppersCaption", 
          shoppers_count as "shoppersCount", 
          shoppers_label as "shoppersLabel", 
          trusted_brands as "trustedBrands";
      `, [
        data.shoppersCaption,
        data.shoppersCount,
        data.shoppersLabel,
        brandsJson
      ]);
      const row = updateRes.rows[0] || {};
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(row));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // GET /api/brands
  if (pathname === '/api/brands' && req.method === 'GET') {
    try {
      const result = await pool.query(`
        SELECT id, name, icon, display_order as "displayOrder", is_active as "isActive" 
        FROM brands 
        WHERE is_active = true 
        ORDER BY display_order ASC, id ASC;
      `);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result.rows));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }




  // POST /api/brands
  if (pathname === '/api/brands' && req.method === 'POST') {
    const data = await parseBody(req);
    const name = data.name?.trim();
    if (!name) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Brand name is required.' }));
      return;
    }

    try {
      // Check existing
      const existing = await pool.query('SELECT id, is_active FROM brands WHERE LOWER(name) = LOWER($1);', [name]);
      if (existing.rowCount > 0) {
        const id = existing.rows[0].id;
        const icon = data.icon?.trim() || 'fa-solid fa-tag';
        const updated = await pool.query(`
          UPDATE brands 
          SET is_active = true, icon = $1, updated_at = CURRENT_TIMESTAMP 
          WHERE id = $2 
          RETURNING id, name, icon, display_order as "displayOrder", is_active as "isActive";
        `, [icon, id]);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(updated.rows[0]));
        return;
      }

      const maxOrderRow = await pool.query('SELECT COALESCE(MAX(display_order), 0) as "maxOrder" FROM brands;');
      const nextOrder = parseInt(maxOrderRow.rows[0].maxOrder, 10) + 1;
      const icon = data.icon?.trim() || 'fa-solid fa-tag';

      const insertRes = await pool.query(`
        INSERT INTO brands (name, icon, display_order, is_active) 
        VALUES ($1, $2, $3, true) 
        RETURNING id, name, icon, display_order as "displayOrder", is_active as "isActive";
      `, [name, icon, nextOrder]);

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(insertRes.rows[0]));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }




  // PUT /api/brands/:id
  const matchPut = pathname.match(/^\/api\/brands\/(\d+)$/);
  if (matchPut && req.method === 'PUT') {
    const id = parseInt(matchPut[1], 10);
    const data = await parseBody(req);
    try {
      const existing = await pool.query('SELECT * FROM brands WHERE id = $1;', [id]);
      if (existing.rowCount === 0) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Brand not found in PostgreSQL database.' }));
        return;
      }

      const row = existing.rows[0];
      const newName = data.name?.trim() || row.name;
      const newIcon = data.icon?.trim() || row.icon;
      const newOrder = data.displayOrder !== undefined ? data.displayOrder : row.display_order;
      const newActive = data.isActive !== undefined ? !!data.isActive : row.is_active;

      const updateRes = await pool.query(`
        UPDATE brands 
        SET name = $1, icon = $2, display_order = $3, is_active = $4, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $5 
        RETURNING id, name, icon, display_order as "displayOrder", is_active as "isActive";
      `, [newName, newIcon, newOrder, newActive, id]);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(updateRes.rows[0]));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }




  // DELETE /api/brands/:id
  const matchDelete = pathname.match(/^\/api\/brands\/(\d+)$/);
  if (matchDelete && req.method === 'DELETE') {
    const id = parseInt(matchDelete[1], 10);
    try {
      const existing = await pool.query('SELECT * FROM brands WHERE id = $1;', [id]);
      if (existing.rowCount === 0) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Brand not found in PostgreSQL database.' }));
        return;
      }

      await pool.query('DELETE FROM brands WHERE id = $1;', [id]);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: `Brand "${existing.rows[0].name}" deleted from PostgreSQL database.` }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }




  // POST /api/brands/reorder
  if (pathname === '/api/brands/reorder' && req.method === 'POST') {
    const data = await parseBody(req);
    const ids = Array.isArray(data) ? data : (data.brandIds || []);
    if (!Array.isArray(ids) || ids.length === 0) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Array of brandIds is required.' }));
      return;
    }

    try {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        for (let i = 0; i < ids.length; i++) {
          await client.query('UPDATE brands SET display_order = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2;', [i + 1, ids[i]]);
        }
        await client.query('COMMIT');
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }

      const reordered = await pool.query(`
        SELECT id, name, icon, display_order as "displayOrder", is_active as "isActive" 
        FROM brands 
        WHERE is_active = true 
        ORDER BY display_order ASC, id ASC;
      `);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(reordered.rows));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }




  // POST /api/upload (Upload image from PC to frontend/public/assets/uploads/)
  if (pathname === '/api/upload' && req.method === 'POST') {
    try {
      const data = await parseBody(req);
      if (!data.base64) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'No image data provided.' }));
        return;
      }

      const matches = data.base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      let buffer;
      let ext = '.jpg';
      if (matches && matches.length === 3) {
        const mime = matches[1];
        if (mime.includes('png')) ext = '.png';
        else if (mime.includes('webp')) ext = '.webp';
        else if (mime.includes('gif')) ext = '.gif';
        buffer = Buffer.from(matches[2], 'base64');
      } else {
        buffer = Buffer.from(data.base64, 'base64');
      }

      const uploadDir = path.resolve(__dirname, '../frontend/public/assets/uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const safeName = (data.filename || `banner-${Date.now()}${ext}`).replace(/[^a-zA-Z0-9.-]/g, '_');
      const finalFileName = safeName.includes('.') ? safeName : `${safeName}${ext}`;
      const filePath = path.join(uploadDir, finalFileName);

      fs.writeFileSync(filePath, buffer);

      const finalUrl = `http://localhost:5000/uploads/${finalFileName}`;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        url: finalUrl,
        relativeUrl: `assets/uploads/${finalFileName}`,
        filename: finalFileName,
        size: buffer.length,
        message: 'Image uploaded and saved to assets/uploads successfully'
      }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }




  // GET /api/homepage/hero
  if (pathname === '/api/homepage/hero' && req.method === 'GET') {
    try {
      const result = await pool.query(`
        SELECT 
          id, 
          badge_text as "badgeText", 
          title, 
          description, 
          primary_button_text as "primaryButtonText", 
          primary_button_url as "primaryButtonUrl", 
          secondary_button_text as "secondaryButtonText", 
          secondary_button_url as "secondaryButtonUrl", 
          image_url as "imageUrl", 
          recommended_width as "recommendedWidth", 
          recommended_height as "recommendedHeight" 
        FROM homepage_hero 
        WHERE id = 1;
      `);
      if (result.rowCount === 0) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Hero banner not found' }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result.rows[0]));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }




  // PUT /api/homepage/hero
  if (pathname === '/api/homepage/hero' && req.method === 'PUT') {
    const data = await parseBody(req);
    try {
      const updateRes = await pool.query(`
        UPDATE homepage_hero 
        SET 
          badge_text = COALESCE($1, badge_text),
          title = COALESCE($2, title),
          description = COALESCE($3, description),
          primary_button_text = COALESCE($4, primary_button_text),
          primary_button_url = COALESCE($5, primary_button_url),
          secondary_button_text = COALESCE($6, secondary_button_text),
          secondary_button_url = COALESCE($7, secondary_button_url),
          image_url = COALESCE($8, image_url),
          recommended_width = COALESCE($9, recommended_width),
          recommended_height = COALESCE($10, recommended_height),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = 1
        RETURNING 
          id, 
          badge_text as "badgeText", 
          title, 
          description, 
          primary_button_text as "primaryButtonText", 
          primary_button_url as "primaryButtonUrl", 
          secondary_button_text as "secondaryButtonText", 
          secondary_button_url as "secondaryButtonUrl", 
          image_url as "imageUrl", 
          recommended_width as "recommendedWidth", 
          recommended_height as "recommendedHeight";
      `, [
        data.badgeText,
        data.title,
        data.description,
        data.primaryButtonText,
        data.primaryButtonUrl,
        data.secondaryButtonText,
        data.secondaryButtonUrl,
        data.imageUrl,
        data.recommendedWidth,
        data.recommendedHeight
      ]);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(updateRes.rows[0]));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }




  // GET /api/homepage/feature-cards
  if (pathname === '/api/homepage/feature-cards' && req.method === 'GET') {
    try {
      const result = await pool.query(`
        SELECT 
          id, 
          card_index as "cardIndex", 
          icon, 
          title, 
          subtitle, 
          display_order as "displayOrder" 
        FROM feature_cards 
        ORDER BY display_order ASC, card_index ASC;
      `);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result.rows));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }




  // PUT /api/homepage/feature-cards
  if (pathname === '/api/homepage/feature-cards' && req.method === 'PUT') {
    const data = await parseBody(req);
    const cards = Array.isArray(data) ? data : (data.cards || []);
    if (!Array.isArray(cards) || cards.length === 0) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Array of feature cards is required' }));
      return;
    }

    try {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        for (const card of cards) {
          const idx = card.cardIndex || card.id;
          await client.query(`
            UPDATE feature_cards 
            SET 
              icon = COALESCE($1, icon),
              title = COALESCE($2, title),
              subtitle = COALESCE($3, subtitle),
              updated_at = CURRENT_TIMESTAMP
            WHERE card_index = $4 OR id = $4;
          `, [card.icon, card.title, card.subtitle, idx]);
        }
        await client.query('COMMIT');
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }

      const updated = await pool.query(`
        SELECT 
          id, 
          card_index as "cardIndex", 
          icon, 
          title, 
          subtitle, 
          display_order as "displayOrder" 
        FROM feature_cards 
        ORDER BY display_order ASC, card_index ASC;
      `);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(updated.rows));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }




  // --- PROMO BANNER (HOME REFRESH EVENT) API (Synced with PostgreSQL) ---

  // GET /api/homepage/promo-banner
  if (pathname === '/api/homepage/promo-banner' && req.method === 'GET') {
    try {
      const result = await pool.query(`
        SELECT 
          id, 
          event_tag as "eventTag", 
          title, 
          subtitle, 
          discount_text as "discountText", 
          button_text as "buttonText", 
          button_url as "buttonUrl", 
          image_url as "imageUrl", 
          recommended_width as "recommendedWidth", 
          recommended_height as "recommendedHeight" 
        FROM homepage_promo_banner 
        WHERE id = 1;
      `);
      if (result.rowCount === 0) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Promo banner not found' }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result.rows[0]));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }




  // PUT /api/homepage/promo-banner
  if (pathname === '/api/homepage/promo-banner' && req.method === 'PUT') {
    const data = await parseBody(req);
    try {
      const updateRes = await pool.query(`
        UPDATE homepage_promo_banner 
        SET 
          event_tag = COALESCE($1, event_tag),
          title = COALESCE($2, title),
          subtitle = COALESCE($3, subtitle),
          discount_text = COALESCE($4, discount_text),
          button_text = COALESCE($5, button_text),
          button_url = COALESCE($6, button_url),
          image_url = COALESCE($7, image_url),
          recommended_width = COALESCE($8, recommended_width),
          recommended_height = COALESCE($9, recommended_height),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = 1
        RETURNING 
          id, 
          event_tag as "eventTag", 
          title, 
          subtitle, 
          discount_text as "discountText", 
          button_text as "buttonText", 
          button_url as "buttonUrl", 
          image_url as "imageUrl", 
          recommended_width as "recommendedWidth", 
          recommended_height as "recommendedHeight";
      `, [
        data.eventTag,
        data.title,
        data.subtitle,
        data.discountText,
        data.buttonText,
        data.buttonUrl,
        data.imageUrl,
        data.recommendedWidth !== undefined ? parseInt(data.recommendedWidth, 10) : null,
        data.recommendedHeight !== undefined ? parseInt(data.recommendedHeight, 10) : null
      ]);

      console.log(`[PostgreSQL] Updated Promo Banner in database: "${updateRes.rows[0].title}"`);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(updateRes.rows[0]));
    } catch (err) {
      console.error('[PostgreSQL Error] PUT /api/homepage/promo-banner:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // --- FOOTER & STORE INFO API (Synced with PostgreSQL) ---

  // GET /api/homepage/footer
  if (pathname === '/api/homepage/footer' && req.method === 'GET') {
    try {
      const result = await pool.query(`
        SELECT 
          id, 
          logo_url as "logoUrl", 
          about_text as "aboutText", 
          trust_badge_text as "trustBadgeText", 
          contact_phone as "contactPhone", 
          contact_email as "contactEmail", 
          newsletter_title as "newsletterTitle", 
          newsletter_subtitle as "newsletterSubtitle", 
          social_instagram as "socialInstagram", 
          social_facebook as "socialFacebook", 
          social_whatsapp as "socialWhatsapp", 
          social_tiktok as "socialTiktok", 
          social_youtube as "socialYoutube", 
          social_x as "socialX", 
          show_instagram as "showInstagram",
          show_facebook as "showFacebook",
          show_whatsapp as "showWhatsapp",
          show_tiktok as "showTiktok",
          show_youtube as "showYoutube",
          show_x as "showX",
          copyright_text as "copyrightText", 
          privacy_policy_url as "privacyPolicyUrl", 
          terms_url as "termsUrl" 
        FROM homepage_footer 
        WHERE id = 1;
      `);
      if (result.rowCount === 0) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Footer settings not found' }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result.rows[0]));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }




  // PUT /api/homepage/footer
  if (pathname === '/api/homepage/footer' && req.method === 'PUT') {
    const data = await parseBody(req);
    try {
      const updateRes = await pool.query(`
        UPDATE homepage_footer 
        SET 
          logo_url = COALESCE($1, logo_url),
          about_text = COALESCE($2, about_text),
          trust_badge_text = COALESCE($3, trust_badge_text),
          contact_phone = COALESCE($4, contact_phone),
          contact_email = COALESCE($5, contact_email),
          newsletter_title = COALESCE($6, newsletter_title),
          newsletter_subtitle = COALESCE($7, newsletter_subtitle),
          social_instagram = COALESCE($8, social_instagram),
          social_facebook = COALESCE($9, social_facebook),
          social_whatsapp = COALESCE($10, social_whatsapp),
          social_tiktok = COALESCE($11, social_tiktok),
          social_youtube = COALESCE($12, social_youtube),
          social_x = COALESCE($13, social_x),
          copyright_text = COALESCE($14, copyright_text),
          privacy_policy_url = COALESCE($15, privacy_policy_url),
          terms_url = COALESCE($16, terms_url),
          show_instagram = COALESCE($17, show_instagram),
          show_facebook = COALESCE($18, show_facebook),
          show_whatsapp = COALESCE($19, show_whatsapp),
          show_tiktok = COALESCE($20, show_tiktok),
          show_youtube = COALESCE($21, show_youtube),
          show_x = COALESCE($22, show_x),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = 1
        RETURNING 
          id, 
          logo_url as "logoUrl", 
          about_text as "aboutText", 
          trust_badge_text as "trustBadgeText", 
          contact_phone as "contactPhone", 
          contact_email as "contactEmail", 
          newsletter_title as "newsletterTitle", 
          newsletter_subtitle as "newsletterSubtitle", 
          social_instagram as "socialInstagram", 
          social_facebook as "socialFacebook", 
          social_whatsapp as "socialWhatsapp", 
          social_tiktok as "socialTiktok", 
          social_youtube as "socialYoutube", 
          social_x as "socialX", 
          show_instagram as "showInstagram",
          show_facebook as "showFacebook",
          show_whatsapp as "showWhatsapp",
          show_tiktok as "showTiktok",
          show_youtube as "showYoutube",
          show_x as "showX",
          copyright_text as "copyrightText", 
          privacy_policy_url as "privacyPolicyUrl", 
          terms_url as "termsUrl";
      `, [
        data.logoUrl,
        data.aboutText,
        data.trustBadgeText,
        data.contactPhone,
        data.contactEmail,
        data.newsletterTitle,
        data.newsletterSubtitle,
        data.socialInstagram,
        data.socialFacebook,
        data.socialWhatsapp,
        data.socialTiktok,
        data.socialYoutube,
        data.socialX,
        data.copyrightText,
        data.privacyPolicyUrl,
        data.termsUrl,
        data.showInstagram !== undefined ? data.showInstagram : null,
        data.showFacebook !== undefined ? data.showFacebook : null,
        data.showWhatsapp !== undefined ? data.showWhatsapp : null,
        data.showTiktok !== undefined ? data.showTiktok : null,
        data.showYoutube !== undefined ? data.showYoutube : null,
        data.showX !== undefined ? data.showX : null
      ]);

      console.log(`[PostgreSQL] Updated Footer Settings in database.`);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(updateRes.rows[0]));
    } catch (err) {
      console.error('[PostgreSQL Error] PUT /api/homepage/footer:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // --- TRENDING PRODUCTS API (Synced with PostgreSQL) ---

  // GET /api/homepage/products
  if (pathname === '/api/homepage/products' && req.method === 'GET') {
    try {
      const result = await pool.query(`
        SELECT 
          id, 
          name, 
          category, 
          discount, 
          rating, 
          review_count as "reviewCount", 
          price::float as price, 
          original_price::float as "originalPrice", 
          image_url as "imageUrl", 
          display_order as "displayOrder", 
          is_active as "isActive" 
        FROM trending_products 
        WHERE is_active = true 
        ORDER BY display_order ASC, id ASC;
      `);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result.rows));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }




  // POST /api/homepage/products
  if (pathname === '/api/homepage/products' && req.method === 'POST') {
    try {
      const data = await parseBody(req);
      const name = data.name?.trim();
      if (!name) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Product name is required.' }));
        return;
      }
      const category = data.category?.trim() || 'Supplements';
      const discount = parseInt(data.discount, 10) || 0;
      const rating = parseFloat(data.rating) || 5.0;
      const reviewCount = data.reviewCount?.trim() || '1.0k';
      const price = parseFloat(data.price) || 0;
      const originalPrice = parseFloat(data.originalPrice) || price;
      const imageUrl = data.imageUrl?.trim() || 'assets/images/nordic-naturals-omega-3.jpg';

      const maxOrderRow = await pool.query('SELECT COALESCE(MAX(display_order), 0) as "maxOrder" FROM trending_products;');
      const nextOrder = parseInt(maxOrderRow.rows[0].maxOrder, 10) + 1;

      const insertRes = await pool.query(`
        INSERT INTO trending_products 
          (name, category, discount, rating, review_count, price, original_price, image_url, display_order, is_active)
        VALUES 
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
        RETURNING 
          id, name, category, discount, rating, review_count as "reviewCount", price::float as price, original_price::float as "originalPrice", image_url as "imageUrl", display_order as "displayOrder", is_active as "isActive";
      `, [name, category, discount, rating, reviewCount, price, originalPrice, imageUrl, nextOrder]);

      console.log(`[PostgreSQL] Added new product id=${insertRes.rows[0].id}: "${insertRes.rows[0].name}"`);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(insertRes.rows[0]));
    } catch (err) {
      console.error('[PostgreSQL Error] POST /api/homepage/products:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // PUT /api/homepage/products/:id
  const matchProdPut = pathname.match(/^\/api\/homepage\/products\/(\d+)$/);
  if (matchProdPut && req.method === 'PUT') {
    const id = parseInt(matchProdPut[1], 10);
    try {
      const data = await parseBody(req);
      const existing = await pool.query('SELECT * FROM trending_products WHERE id = $1;', [id]);
      if (existing.rowCount === 0) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Product not found.' }));
        return;
      }
      const row = existing.rows[0];
      const name = data.name !== undefined ? data.name.trim() : row.name;
      const category = data.category !== undefined ? data.category.trim() : row.category;
      const discount = data.discount !== undefined ? parseInt(data.discount, 10) : row.discount;
      const rating = data.rating !== undefined ? parseFloat(data.rating) : row.rating;
      const reviewCount = data.reviewCount !== undefined ? data.reviewCount.trim() : row.review_count;
      const price = data.price !== undefined ? parseFloat(data.price) : parseFloat(row.price);
      const originalPrice = data.originalPrice !== undefined ? parseFloat(data.originalPrice) : parseFloat(row.original_price);
      const imageUrl = data.imageUrl !== undefined ? data.imageUrl.trim() : row.image_url;
      const displayOrder = data.displayOrder !== undefined ? parseInt(data.displayOrder, 10) : row.display_order;
      const isActive = data.isActive !== undefined ? !!data.isActive : row.is_active;

      const updateRes = await pool.query(`
        UPDATE trending_products 
        SET 
          name = $1, 
          category = $2, 
          discount = $3, 
          rating = $4, 
          review_count = $5, 
          price = $6, 
          original_price = $7, 
          image_url = $8, 
          display_order = $9, 
          is_active = $10, 
          updated_at = CURRENT_TIMESTAMP 
        WHERE id = $11 
        RETURNING 
          id, name, category, discount, rating, review_count as "reviewCount", price::float as price, original_price::float as "originalPrice", image_url as "imageUrl", display_order as "displayOrder", is_active as "isActive";
      `, [name, category, discount, rating, reviewCount, price, originalPrice, imageUrl, displayOrder, isActive, id]);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(updateRes.rows[0]));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }




  // DELETE /api/homepage/products/:id
  const matchProdDelete = pathname.match(/^\/api\/homepage\/products\/(\d+)$/);
  if (matchProdDelete && req.method === 'DELETE') {
    const id = parseInt(matchProdDelete[1], 10);
    try {
      const existing = await pool.query('SELECT * FROM trending_products WHERE id = $1;', [id]);
      if (existing.rowCount === 0) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Product not found.' }));
        return;
      }
      await pool.query('DELETE FROM trending_products WHERE id = $1;', [id]);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: `Product "${existing.rows[0].name}" deleted from PostgreSQL database.` }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }







  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`[Happy Steppy API] Server running on http://localhost:${PORT}`);
  console.log(`[PostgreSQL Database] Connected to: localhost:5432/happysteppy`);
  console.log(`[Swagger UI] Available at http://localhost:${PORT}/swagger`);
});
