
const express = require('express');
const router = express.Router();

// utils
const CryptoUtil = require('../utils/CryptoUtil');
const EmailUtil = require('../utils/EmailUtil');
const JwtUtil = require('../utils/JwtUtil');

// daos
const CategoryDAO = require('../models/CategoryDAO');
const ProductDAO = require('../models/ProductDAO');
const CustomerDAO = require('../models/CustomerDAO');
const OrderDAO = require('../models/OrderDAO');

// category
router.get('/categories', async function (req, res) {
  const categories = await CategoryDAO.selectAll();
  res.json(categories);
});

// product
router.get('/products/new', async function (req, res) {
  const products = await ProductDAO.selectTopNew(3);
  res.json(products);
});

router.get('/products/hot', async function (req, res) {
  const products = await ProductDAO.selectTopHot(3);
  res.json(products);
});

router.get('/products/category/:cid', async function (req, res) {
  const _cid = req.params.cid;
  const products = await ProductDAO.selectByCatID(_cid);
  res.json(products);
});

router.get('/products/search/:keyword', async function (req, res) {
  const keyword = req.params.keyword;
  const products = await ProductDAO.selectByKeyword(keyword);
  res.json(products);
});

router.get('/products/:id', async function (req, res) {
  const _id = req.params.id;
  const product = await ProductDAO.selectByID(_id);
  res.json(product);
});

// customer - signup
router.post('/signup', async function (req, res) {
  try {
    const username = req.body.username;
    const password = req.body.password;
    const name = req.body.name;
    const phone = req.body.phone;
    const email = req.body.email;

    const dbCust = await CustomerDAO.selectByUsernameOrEmail(
      username,
      email
    );

    if (dbCust) {
      res.json({
        success: false,
        message: 'Exists username or email'
      });
    } else {
      const now = new Date().getTime();
      const token = CryptoUtil.md5(now.toString());

      const newCust = {
        username: username,
        password: password,
        name: name,
        phone: phone,
        email: email,
        active: 0,
        token: token
      };

      const result = await CustomerDAO.insert(newCust);

      if (result) {
        const send = await EmailUtil.send(
          email,
          result._id,
          token
        );

        if (send) {
          res.json({
            success: true,
            message: 'Please check email'
          });
        } else {
          res.json({
            success: false,
            message: 'Email failure'
          });
        }
      } else {
        res.json({
          success: false,
          message: 'Insert failure'
        });
      }
    }
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Signup failed'
    });
  }
});

// customer - active
router.post('/active', async function (req, res) {
  try {
    const _id = req.body.id;
    const token = req.body.token;

    if (!_id || !token) {
      return res.json(null);
    }

    const result = await CustomerDAO.active(_id, token, 1);
    res.json(result);
  } catch (error) {
    console.error('Active error:', error);
    res.status(500).json({
      success: false,
      message: 'Activation failed'
    });
  }
});

// customer - login
router.post('/login', async function (req, res) {
  try {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
      const customer =
        await CustomerDAO.selectByUsernameAndPassword(
          username,
          password
        );

      if (customer) {
        if (customer.active === 1) {
          const token = JwtUtil.genToken(username, password);

          res.json({
            success: true,
            message: 'Authentication successful',
            token: token,
            customer: customer
          });
        } else {
          res.json({
            success: false,
            message: 'Account is deactive'
          });
        }
      } else {
        res.json({
          success: false,
          message: 'Incorrect username or password'
        });
      }
    } else {
      res.json({
        success: false,
        message: 'Please input username and password'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

// customer - token
router.get('/token', JwtUtil.checkToken, function (req, res) {
  const token =
    req.headers['x-access-token'] ||
    req.headers['authorization'];

  res.json({
    success: true,
    message: 'Token is valid',
    token: token
  });
});

// customer - myprofile
router.put('/customers/:id', JwtUtil.checkToken, async function (req, res) {
  try {
    const _id = req.params.id;
    const username = req.body.username;
    const password = req.body.password;
    const name = req.body.name;
    const phone = req.body.phone;
    const email = req.body.email;

    const authenticatedUsername = req.decoded.username;

    if (!username || !password || !name || !phone || !email) {
      return res.status(400).json({
        success: false,
        message: 'Please input all customer information'
      });
    }

    const existingCustomer =
      await CustomerDAO.selectByUsernameAndPassword(
        req.decoded.username,
        req.decoded.password
      );

    if (
      !existingCustomer ||
      existingCustomer.active !== 1 ||
      existingCustomer._id.toString() !== _id ||
      existingCustomer.username !== authenticatedUsername
    ) {
      return res.status(403).json({
        success: false,
        message: 'You cannot update this customer'
      });
    }

    const customer = {
      _id: _id,
      username: username,
      password: password,
      name: name,
      phone: phone,
      email: email
    };

    const result = await CustomerDAO.update(customer);

    if (result) {
      res.json(result);
    } else {
      res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Update customer failed'
    });
  }
});

// customer - checkout
router.post('/checkout', JwtUtil.checkToken, async function (req, res) {
  try {
    // Verify authenticated customer
    const customer =
      await CustomerDAO.selectByUsernameAndPassword(
        req.decoded.username,
        req.decoded.password
      );

    if (!customer || customer.active !== 1) {
      return res.status(403).json({
        success: false,
        message: 'Customer is not authorized'
      });
    }

    const items = req.body.items;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty'
      });
    }

    // Rebuild order items using database products
    const validItems = [];
    let total = 0;
    const productIds = new Set();

    for (const item of items) {
      if (!item || !item.product || !item.product._id) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product'
        });
      }

      const quantity = Number(item.quantity);

      if (
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > 99
      ) {
        return res.status(400).json({
          success: false,
          message: 'Invalid quantity'
        });
      }

      const productId = String(item.product._id);

      if (productIds.has(productId)) {
        return res.status(400).json({
          success: false,
          message: 'Duplicate product in cart'
        });
      }

      productIds.add(productId);

      if (!/^[0-9a-fA-F]{24}$/.test(productId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID'
        });
      }

      const product = await ProductDAO.selectByID(productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      validItems.push({
        product: product,
        quantity: quantity
      });

      total += product.price * quantity;
    }

    // Store a customer snapshot without credentials
    const safeCustomer = {
      _id: customer._id,
      username: customer.username,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      active: customer.active
    };

    const order = {
      cdate: Date.now(),
      total: total,
      status: 'PENDING',
      customer: safeCustomer,
      items: validItems
    };

    const result = await OrderDAO.insert(order);

    if (result) {
      return res.json({
        success: true,
        message: 'Checkout successful',
        orderId: result._id,
        total: result.total
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Checkout failed'
    });
  } catch (error) {
    console.error('Checkout error:', error);

    res.status(500).json({
      success: false,
      message: 'Checkout failed'
    });
  }
});

 // customer - myorders
router.get('/orders/customer/:cid', JwtUtil.checkToken, async function (req, res) {
  try {
    const _cid = req.params.cid;

    // Verify authenticated customer
    const customer = await CustomerDAO.selectByUsernameAndPassword(
      req.decoded.username,
      req.decoded.password
    );

    if (!customer || customer.active !== 1) {
      return res.status(403).json({
        success: false,
        message: 'Customer is not authorized'
      });
    }

    // Customer can only access their own orders
    if (customer._id.toString() !== _cid) {
      return res.status(403).json({
        success: false,
        message: 'You cannot view these orders'
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

module.exports = router;
