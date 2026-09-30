import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { db } from './src/server/db.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// --- SEO ENDPOINTS ---
app.get('/robots.txt', (_req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /
Disallow: /admin
Sitemap: ${process.env.APP_URL || ''}/sitemap.xml`);
});

app.get('/sitemap.xml', (_req, res) => {
  const baseUrl = process.env.APP_URL || 'https://modaintimatododia.com.br';
  const products = db.getProducts();
  const categories = db.getCategories();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${baseUrl}/</loc><priority>1.0</priority><changefreq>daily</changefreq></url>
  <url><loc>${baseUrl}/produtos</loc><priority>0.9</priority><changefreq>daily</changefreq></url>
  <url><loc>${baseUrl}/ofertas</loc><priority>0.9</priority><changefreq>daily</changefreq></url>
  <url><loc>${baseUrl}/novidades</loc><priority>0.9</priority><changefreq>daily</changefreq></url>
  <url><loc>${baseUrl}/sobre-nos</loc><priority>0.7</priority></url>
  <url><loc>${baseUrl}/contato</loc><priority>0.7</priority></url>
  <url><loc>${baseUrl}/politica-de-privacidade</loc><priority>0.5</priority></url>
  <url><loc>${baseUrl}/trocas-e-devolucoes</loc><priority>0.5</priority></url>`;

  for (const cat of categories) {
    xml += `\n  <url><loc>${baseUrl}/categoria/${cat.slug}</loc><priority>0.8</priority><changefreq>weekly</changefreq></url>`;
  }

  for (const prod of products) {
    xml += `\n  <url><loc>${baseUrl}/produto/${prod.slug}</loc><priority>0.8</priority><changefreq>weekly</changefreq></url>`;
  }

  xml += '\n</urlset>';
  res.type('application/xml');
  res.send(xml);
});

// --- API ENDPOINTS ---

// Products
app.get('/api/products', (req, res) => {
  let products = db.getProducts();
  const { category, search, minPrice, maxPrice, sort, isNew, isOnSale } = req.query;

  if (category && typeof category === 'string') {
    const catLower = category.toLowerCase();
    products = products.filter(p => 
      p.category.toLowerCase() === catLower ||
      (p.subcategory && p.subcategory.toLowerCase() === catLower)
    );
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    products = products.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q)
    );
  }

  if (minPrice) {
    products = products.filter(p => (p.promoPrice || p.price) >= Number(minPrice));
  }
  if (maxPrice) {
    products = products.filter(p => (p.promoPrice || p.price) <= Number(maxPrice));
  }
  if (isNew === 'true') {
    products = products.filter(p => p.isNew);
  }
  if (isOnSale === 'true') {
    products = products.filter(p => p.isOnSale);
  }

  // Sorting
  if (sort === 'price-asc') {
    products.sort((a, b) => (a.promoPrice || a.price) - (b.promoPrice || b.price));
  } else if (sort === 'price-desc') {
    products.sort((a, b) => (b.promoPrice || b.price) - (a.promoPrice || a.price));
  } else if (sort === 'rating') {
    products.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'newest') {
    products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const product = db.getProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Produto não encontrado' });
  }
  res.json(product);
});

app.post('/api/products', (req, res) => {
  try {
    const created = db.addProduct(req.body);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/products/:id', (req, res) => {
  const updated = db.updateProduct(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Produto não encontrado' });
  }
  res.json(updated);
});

app.delete('/api/products/:id', (req, res) => {
  const success = db.deleteProduct(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Produto não encontrado' });
  }
  res.json({ success: true, message: 'Produto removido com sucesso' });
});

// Categories
app.get('/api/categories', (_req, res) => {
  res.json(db.getCategories());
});

// Orders
app.get('/api/orders', (req, res) => {
  const { email } = req.query;
  let orders = db.getOrders();
  if (email && typeof email === 'string') {
    orders = orders.filter(o => o.customerEmail.toLowerCase() === email.toLowerCase());
  }
  res.json(orders);
});

app.get('/api/orders/:id', (req, res) => {
  const order = db.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Pedido não encontrado' });
  }
  res.json(order);
});

app.post('/api/orders', (req, res) => {
  try {
    const order = db.createOrder(req.body);
    res.status(201).json(order);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.patch('/api/orders/:id/status', (req, res) => {
  const { status } = req.body;
  const updated = db.updateOrderStatus(req.params.id, status);
  if (!updated) {
    return res.status(404).json({ error: 'Pedido não encontrado' });
  }
  res.json(updated);
});

// Coupons
app.get('/api/coupons', (_req, res) => {
  res.json(db.getCoupons());
});

app.post('/api/coupons', (req, res) => {
  try {
    const coupon = db.addCoupon(req.body);
    res.status(201).json(coupon);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/coupons/:id', (req, res) => {
  const success = db.deleteCoupon(req.params.id);
  res.json({ success });
});

app.post('/api/coupons/validate', (req, res) => {
  const { code, cartTotal } = req.body;
  if (!code) {
    return res.status(400).json({ valid: false, message: 'Código de cupom obrigatório' });
  }
  const result = db.validateCoupon(code, Number(cartTotal) || 0);
  res.json(result);
});

// Banners
app.get('/api/banners', (_req, res) => {
  res.json(db.getBanners());
});

app.post('/api/banners', (req, res) => {
  const newBanner = db.addBanner(req.body);
  res.status(201).json(newBanner);
});

app.put('/api/banners/:id', (req, res) => {
  const updated = db.updateBanner(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Banner não encontrado' });
  }
  res.json(updated);
});

app.delete('/api/banners/:id', (req, res) => {
  const success = db.deleteBanner(req.params.id);
  res.json({ success });
});

// Reviews
app.get('/api/reviews', (req, res) => {
  const { status, productId } = req.query;
  let reviews = db.getReviews(status as string);
  if (productId && typeof productId === 'string') {
    reviews = reviews.filter(r => r.productId === productId);
  }
  res.json(reviews);
});

app.post('/api/reviews', (req, res) => {
  try {
    const review = db.addReview(req.body);
    res.status(201).json(review);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.patch('/api/reviews/:id/status', (req, res) => {
  const { status } = req.body;
  const updated = db.updateReviewStatus(req.params.id, status);
  if (!updated) {
    return res.status(404).json({ error: 'Avaliação não encontrada' });
  }
  res.json(updated);
});

// Settings
app.get('/api/settings', (_req, res) => {
  res.json(db.getSettings());
});

app.put('/api/settings', (req, res) => {
  const updated = db.updateSettings(req.body);
  res.json(updated);
});

// Stats
app.get('/api/stats', (_req, res) => {
  res.json(db.getStats());
});

// Admin Auth
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  const cleanEmail = (email || '').trim().toLowerCase();
  if (
    cleanEmail === 'rafaelmoda-intima' &&
    password === '301115'
  ) {
    res.json({
      success: true,
      token: 'jwt-admin-token-moda-intima-todo-dia',
      user: { name: 'Rafael (Administrador)', email: 'RafaelModa-intima', role: 'admin' }
    });
  } else {
    res.status(401).json({ error: 'Credenciais inválidas. Verifique o usuário e a senha.' });
  }
});

// Stock Management
app.post('/api/stock/adjust', (req, res) => {
  const { productId, change, reason } = req.body;
  const product = db.getProductById(productId);
  if (!product) {
    return res.status(404).json({ error: 'Produto não encontrado' });
  }
  const newStock = Math.max(0, product.stock + Number(change));
  const updated = db.updateProduct(productId, { stock: newStock });
  res.json({ product: updated, reason, newStock });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Moda Intima Todo Dia server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
