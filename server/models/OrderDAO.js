
require('../utils/MongooseUtil');
const Models = require('./Models');

const OrderDAO = {
  // Lab 7 - Insert order
  async insert(order) {
    const mongoose = require('mongoose');
    order._id = new mongoose.Types.ObjectId();

    const result = await Models.Order.create(order);
    return result;
  },

  // Lab 7 - Get orders by customer ID
  async selectByCustID(_cid) {
    const query = {
      'customer._id': _cid
    };

    const orders = await Models.Order.find(query).exec();
    return orders;
  },

  // Lab 8 - Get all orders
  async selectAll() {
    const query = {};
    const mysort = { cdate: -1 };

    const orders = await Models.Order.find(query)
      .sort(mysort)
      .exec();

    return orders;
  },

  // Lab 8 - Update order status
  async update(_id, newStatus) {
    const newvalues = {
      status: newStatus
    };

    const result = await Models.Order.findOneAndUpdate(
      {
        _id: _id,
        status: 'PENDING'
      },
      newvalues,
      { new: true }
    );

    return result;
  }
};

module.exports = OrderDAO;
