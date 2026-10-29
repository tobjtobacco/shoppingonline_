
require('../utils/MongooseUtil');
const Models = require('./Models');

const CustomerDAO = {
  async selectByUsernameOrEmail(username, email) {
    const query = {
      $or: [
        { username: username },
        { email: email }
      ]
    };

    const customer = await Models.Customer.findOne(query);
    return customer;
  },

  async insert(customer) {
    const mongoose = require('mongoose');
    customer._id = new mongoose.Types.ObjectId();

    const result = await Models.Customer.create(customer);
    return result;
  },

  async active(_id, token, active) {
    const query = { _id: _id, token: token };
    const newvalues = { active: active };

    const result = await Models.Customer.findOneAndUpdate(
      query,
      newvalues,
      { new: true }
    );

    return result;
  },

  async selectByUsernameAndPassword(username, password) {
    const query = {
      username: username,
      password: password
    };

    const customer = await Models.Customer.findOne(query);
    return customer;
  },

  async update(customer) {
    const newvalues = {
      username: customer.username,
      password: customer.password,
      name: customer.name,
      phone: customer.phone,
      email: customer.email
    };

    const result = await Models.Customer.findByIdAndUpdate(
      customer._id,
      newvalues,
      { new: true }
    );

    return result;
  },

  // Lab 9 - Admin List Customer
  async selectAll() {
    const query = {};

    const customers = await Models.Customer.find(query)
      .select('_id username name phone email active')
      .exec();

    return customers;
  },

  // Lab 9 - Admin Deactive Customer
  async deactiveByAdmin(_id) {
    const result = await Models.Customer.findOneAndUpdate(
      {
        _id: _id,
        active: 1
      },
      {
        active: 0
      },
      {
        new: true
      }
    ).select('_id username name phone email active');

    return result;
  },

  // Lab 9 - Admin Sendmail
  async selectByID(_id) {
    const customer = await Models.Customer.findById(_id).exec();
    return customer;
  }
};

module.exports = CustomerDAO;
