const http = require('http');
const req = http.request('http://localhost:3000/api/test/reset', { method: 'POST' }, res => { let data = ''; res.on('data', x => data += x); res.on('end', () => { console.log(data); process.exit(res.statusCode < 300 ? 0 : 1); }); });
req.on('error', () => { console.error('Inicia la aplicación con npm start antes de usar este comando.'); process.exit(1); }); req.end();
