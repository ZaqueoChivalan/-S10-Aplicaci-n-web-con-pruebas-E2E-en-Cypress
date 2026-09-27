const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function writeJson(file, value) { fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n'); }
function resetData() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  writeJson(PRODUCTS_FILE, [
    { id: 'espresso', name: 'Espresso', description: 'Café intenso de origen local', price: 2.5, stock: 12, available: true },
    { id: 'cappuccino', name: 'Cappuccino', description: 'Espresso, leche vaporizada y espuma', price: 3.75, stock: 8, available: true },
    { id: 'croissant', name: 'Croissant', description: 'Hojaldre de mantequilla recién horneado', price: 2.25, stock: 5, available: true },
    { id: 'sandwich', name: 'Sándwich vegetal', description: 'Pan artesanal, vegetales y queso crema', price: 5.5, stock: 0, available: false }
  ]);
  writeJson(ORDERS_FILE, []);
}
if (!fs.existsSync(PRODUCTS_FILE) || !fs.existsSync(ORDERS_FILE)) resetData();

function send(res, status, body, headers = {}) {
  const payload = JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...headers });
  res.end(payload);
}
function serveStatic(req, res) {
  const requested = req.url === '/' ? '/index.html' : req.url;
  const safePath = path.normalize(requested).replace(/^([.][.][\\/])+/, '');
  const file = path.join(ROOT, 'public', safePath);
  if (!file.startsWith(path.join(ROOT, 'public'))) return send(res, 403, { error: 'Forbidden' });
  fs.readFile(file, (err, data) => {
    if (err) return send(res, 404, { error: 'No encontrado' });
    const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
}
function body(req) {
  return new Promise((resolve, reject) => { let raw = ''; req.on('data', chunk => raw += chunk); req.on('end', () => { try { resolve(raw ? JSON.parse(raw) : {}); } catch (e) { reject(e); } }); });
}
async function api(req, res) {
  if (req.method === 'GET' && req.url === '/api/products') return send(res, 200, { products: readJson(PRODUCTS_FILE) });
  if (req.method === 'GET' && req.url === '/api/orders') return send(res, 200, { orders: readJson(ORDERS_FILE) });
  if (req.method === 'POST' && req.url === '/api/test/reset') { resetData(); return send(res, 200, { ok: true, message: 'Datos reiniciados' }); }
  if (req.method === 'POST' && req.url === '/api/orders') {
    let input;
    try { input = await body(req); } catch { return send(res, 400, { error: 'JSON inválido' }); }
    if (!Array.isArray(input.items) || input.items.length === 0) return send(res, 400, { error: 'El pedido debe contener al menos un producto.' });
    const products = readJson(PRODUCTS_FILE);
    const normalized = input.items.map(item => ({ id: String(item.id), quantity: Number(item.quantity) }));
    if (normalized.some(item => !Number.isInteger(item.quantity) || item.quantity < 1)) return send(res, 400, { error: 'Las cantidades deben ser enteros positivos.' });
    for (const item of normalized) {
      const product = products.find(p => p.id === item.id);
      if (!product) return send(res, 404, { error: 'Producto no encontrado.' });
      if (!product.available || product.stock < item.quantity) return send(res, 409, { error: `No hay existencias suficientes para ${product.name}.`, productId: product.id });
    }
    const lines = normalized.map(item => { const p = products.find(x => x.id === item.id); return { id: p.id, name: p.name, quantity: item.quantity, unitPrice: p.price, subtotal: Number((p.price * item.quantity).toFixed(2)) }; });
    const total = Number(lines.reduce((sum, line) => sum + line.subtotal, 0).toFixed(2));
    lines.forEach(line => { const p = products.find(x => x.id === line.id); p.stock -= line.quantity; p.available = p.stock > 0; });
    const order = { id: `ORD-${crypto.randomBytes(4).toString('hex').toUpperCase()}`, items: lines, total, createdAt: new Date().toISOString() };
    const orders = readJson(ORDERS_FILE); orders.push(order); writeJson(PRODUCTS_FILE, products); writeJson(ORDERS_FILE, orders);
    return send(res, 201, { order });
  }
  return send(res, 404, { error: 'Ruta no encontrada' });
}
http.createServer((req, res) => req.url.startsWith('/api/') ? api(req, res) : serveStatic(req, res)).listen(PORT, () => console.log(`Cafetería disponible en http://localhost:${PORT}`));
