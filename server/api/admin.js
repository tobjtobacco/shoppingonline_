
const express = require('express');
const router = express.Router();

// utils
const JwtUtil = require('../utils/JwtUtil');
const EmailUtil = require('../utils/EmailUtil');

// daos
const AdminDAO = require('../models/AdminDAO');
const CategoryDAO = require('../models/CategoryDAO');
const ProductDAO = require('../models/ProductDAO');
const OrderDAO = require('../models/OrderDAO');
const CustomerDAO = require('../models/CustomerDAO');

// =================
// LOGIN
// =================

router.post('/login', async function (req, res) {
  try {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
      return res.json({
        success: false,
        message: 'Please input username and password'
      });
    }

    const admin = await AdminDAO.selectByUsernameAndPassword(
      username,
      password
    );

    if (!admin) {
      return res.json({
        success: false,
        message: 'Incorrect username or password'
      });
    }

    const token = JwtUtil.genAdminToken(admin._id);

    res.json({
      success: true,
      message: 'Authentication successful',
      token: token
    });
  } catch (error) {
    console.error('Admin login error:', error);

    res.status(500).json({
      success: false,
      message: 'Admin login failed'
    });
  }
});

// =================
// TOKEN
// =================

router.get('/token', JwtUtil.checkAdminToken, function (req, res) {
  const token =
    req.headers['x-access-token'] ||
    req.headers['authorization'];

  res.json({
    success: true,
    message: 'Token is valid',
    token: token
  });
});

// =================
// CATEGORY
// =================

router.get('/categories', JwtUtil.checkAdminToken, async function (req, res) {
  const categories = await CategoryDAO.selectAll();
  res.json(categories);
});

router.post('/categories', JwtUtil.checkAdminToken, async function (req, res) {
  const name = req.body.name;

  const category = {
    name: name
  };

  const result = await CategoryDAO.insert(category);
  res.json(result);
});

router.put('/categories/:id', JwtUtil.checkAdminToken, async function (req, res) {
  const _id = req.params.id;
  const name = req.body.name;

  const category = {
    _id: _id,
    name: name
  };

  const result = await CategoryDAO.update(category);
  res.json(result);
});

router.delete('/categories/:id', JwtUtil.checkAdminToken, async function (req, res) {
  const _id = req.params.id;

  const result = await CategoryDAO.delete(_id);
  res.json(result);
});

// =================
// PRODUCT
// =================

router.get('/products', JwtUtil.checkAdminToken, async function (req, res) {
  const noProducts = await ProductDAO.selectByCount();
  const sizePage = 4;
  const noPages = Math.ceil(noProducts / sizePage);

  let curPage = 1;

  if (req.query.page) {
    curPage = parseInt(req.query.page, 10);
  }

  const skip = (curPage - 1) * sizePage;

  const products = await ProductDAO.selectBySkipLimit(
    skip,
    sizePage
  );

  const result = {
    products: products,
    noPages: noPages,
    curPage: curPage
  };

  res.json(result);
});

router.post('/products', JwtUtil.checkAdminToken, async function (req, res) {
  const name = req.body.name;
  const price = req.body.price;
  const cid = req.body.category;
  const image = req.body.image;
  const now = new Date().getTime();

  const category = await CategoryDAO.selectByID(cid);

  const product = {
    name: name,
    price: price,
    image: image,
    cdate: now,
    category: category
  };

  const result = await ProductDAO.insert(product);
  res.json(result);
});

router.put('/products/:id', JwtUtil.checkAdminToken, async function (req, res) {
  const _id = req.params.id;
  const name = req.body.name;
  const price = req.body.price;
  const cid = req.body.category;
  const image = req.body.image;
  const now = new Date().getTime();

  const category = await CategoryDAO.selectByID(cid);

  const product = {
    _id: _id,
    name: name,
    price: price,
    image: image,
    cdate: now,
    category: category
  };

  const result = await ProductDAO.update(product);
  res.json(result);
});

router.delete('/products/:id', JwtUtil.checkAdminToken, async function (req, res) {
  const _id = req.params.id;

  const result = await ProductDAO.delete(_id);
  res.json(result);
});

// =================
// ORDER - LAB 8
// =================

// Admin - List all orders
router.get('/orders', JwtUtil.checkAdminToken, async function (req, res) {
  try {
    const orders = await OrderDAO.selectAll();
    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);

    res.status(500).json({
      success: false,
      message: 'Get orders failed'
    });
  }
});

// Admin - Update order status
router.put('/orders/status/:id', JwtUtil.checkAdminToken, async function (req, res) {
  try {
    const _id = req.params.id;
    const newStatus = req.body?.status;

    if (!['APPROVED', 'CANCELED'].includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status'
      });
    }

    if (!/^[0-9a-fA-F]{24}$/.test(_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
    }

    const result = await OrderDAO.update(_id, newStatus);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or already processed'
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Update order status error:', error);

    res.status(500).json({
      success: false,
      message: 'Update order status failed'
    });
  }
});

// =================
// CUSTOMER - LAB 9
// =================

// Admin - List all customers
router.get('/customers', JwtUtil.checkAdminToken, async function (req, res) {
  try {
    const customers = await CustomerDAO.selectAll();

    res.json(customers);
  } catch (error) {
    console.error('Get customers error:', error);

    res.status(500).json({
      success: false,
      message: 'Get customers failed'
    });
  }
});

// Admin - Get orders by customer ID
router.get('/orders/customer/:cid', JwtUtil.checkAdminToken, async function (req, res) {
  try {
    const _cid = req.params.cid;

    if (!/^[0-9a-fA-F]{24}$/.test(_cid)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID'
      });
    }

    const orders = await OrderDAO.selectByCustID(_cid);

    res.json(orders);
  } catch (error) {
    console.error('Get customer orders error:', error);

    res.status(500).json({
      success: false,
      message: 'Get customer orders failed'
    });
  }
});

// =================
// CUSTOMER DEACTIVE - LAB 9
// =================

// Admin - Deactivate customer by ID
router.put('/customers/deactive/:id', JwtUtil.checkAdminToken, async function (req, res) {
  try {
    const _id = req.params.id;

    if (!/^[0-9a-fA-F]{24}$/.test(_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID'
      });
    }

    const result = await CustomerDAO.deactiveByAdmin(_id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found or already deactivated'
      });
    }

    return res.json({
      success: true,
      message: 'Customer deactivated successfully',
      customer: result
    });
  } catch (error) {
    console.error('Deactivate customer error:', error);

    return res.status(500).json({
      success: false,
      message: 'Deactivate customer failed'
    });
  }
});

// =================
// ADMIN SENDMAIL - LAB 9
// =================

router.get('/customers/sendmail/:id', JwtUtil.checkAdminToken, async function (req, res) {
  try {
    const _id = req.params.id;

    if (!/^[0-9a-fA-F]{24}$/.test(_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID'
      });
    }

    const cust = await CustomerDAO.selectByID(_id);

    if (!cust) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    if (cust.active !== 0) {
      return res.status(400).json({
        success: false,
        message: 'Customer is already active'
      });
    }

    if (!cust.email || !cust.token) {
      return res.status(400).json({
        success: false,
        message: 'Customer email or activation token is missing'
      });
    }

    const sent = await EmailUtil.send(
      cust.email,
      cust._id.toString(),
      cust.token
    );

    if (sent) {
      return res.json({
        success: true,
        message: 'Please check email'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Email sending failed'
    });
  } catch (error) {
    console.error('Admin sendmail error:', error);

    return res.status(500).json({
      success: false,
      message: 'Admin sendmail failed'
    });
  }
});

// =================
// EXPORT
// =================

module.exports = router;
