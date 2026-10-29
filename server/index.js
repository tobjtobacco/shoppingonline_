
require('dotenv').config();

const dns = require('dns');
dns.setServers(['1.1.1.1', '1.0.0.1']);

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// =================
// MIDDLEWARES
// =================

const bodyParser = require('body-parser');

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({
  extended: true,
  limit: '10mb'
}));

// =================
// APIS - LAB 5 TO 9
// =================

app.use('/api/admin', require('./api/admin.js'));
app.use('/api/customer', require('./api/customer.js'));

app.get('/hello', (req, res) => {
  res.json({ message: 'Hello from server!' });
});

// =================
// HOSTING - LAB 10
// =================

// React Admin
const adminBuildPath = path.resolve(
  __dirname,
  '../client-admin/build'
);

app.use('/admin', express.static(adminBuildPath));

app.get(/^\/admin(?:\/.*)?$/, (req, res) => {
  res.sendFile(path.join(adminBuildPath, 'index.html'));
});

// React Customer
const customerBuildPath = path.resolve(
  __dirname,
  '../client-customer/build'
);

app.use(express.static(customerBuildPath));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(customerBuildPath, 'index.html'));
});

// =================
// START SERVER
// =================

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
