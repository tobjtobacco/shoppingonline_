
import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import CartUtil from '../utils/CartUtil';
import withRouter from '../utils/withRouter';

class Mycart extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);

    this.state = {
      checkingOut: false
    };
  }

  render() {
    const mycart = this.context.mycart.map((item, index) => {
      return (
        <tr key={item.product._id} className="datatable">
          <td>{index + 1}</td>
          <td>{item.product._id}</td>
          <td>{item.product.name}</td>
          <td>{item.product.category.name}</td>

          <td>
            <img
              src={'data:image/jpg;base64,' + item.product.image}
              width="70px"
              height="70px"
              alt=""
            />
          </td>

          <td>{item.product.price}</td>
          <td>{item.quantity}</td>
          <td>{item.product.price * item.quantity}</td>

          <td>
            <span
              className="link"
              onClick={() => this.linkRemoveClick(item.product._id)}
            >
              Remove
            </span>
          </td>
        </tr>
      );
    });

    return (
      <div className="align-center">
        <h2 className="text-center">ITEM LIST</h2>

        <table className="datatable" border="1">
          <tbody>
            <tr className="datatable">
              <th>No.</th>
              <th>ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Image</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Amount</th>
              <th>Action</th>
            </tr>

            {mycart}

            <tr>
              <td colSpan="6"></td>
              <td>Total</td>
              <td>{CartUtil.getTotal(this.context.mycart)}</td>
              <td>
                <span
                  className="link"
                  onClick={() => this.linkCheckoutClick()}
                  style={{
                    opacity: this.state.checkingOut ? 0.5 : 1
                  }}
                >
                  {this.state.checkingOut
                    ? 'PROCESSING...'
                    : 'CHECKOUT'}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  // event-handlers
  linkRemoveClick(_id) {
    if (this.state.checkingOut) return;

    const mycart = this.context.mycart.filter(
      (item) => item.product._id !== _id
    );

    this.context.setMycart(mycart);
  }

  linkCheckoutClick() {
    if (this.state.checkingOut) return;

    const items = this.context.mycart;

    if (items.length === 0) {
      alert('Your cart is empty');
      return;
    }

    const customer = this.context.customer;
    const token = this.context.token;

    if (!customer || !token) {
      alert('Please login to checkout');
      this.props.navigate('/login');
      return;
    }

    const total = CartUtil.getTotal(items);

    this.apiCheckout(total, items, customer, token);
  }

  // apis
  async apiCheckout(total, items, customer, token) {
    this.setState({ checkingOut: true });

    const body = {
      total: total,
      items: items,
      customer: customer
    };

    const config = {
      headers: {
        'x-access-token': token
      }
    };

    try {
      const res = await axios.post(
        '/api/customer/checkout',
        body,
        config
      );

      const result = res.data;

      if (result.success === true) {
        alert('OK BABY!');

        this.context.setMycart([]);
        this.props.navigate('/home');
      } else {
        alert(result.message || 'SORRY BABY!');
      }
    } catch (error) {
      console.error('Checkout error:', error);

      alert(
        error.response?.data?.message ||
        'Checkout failed'
      );
    } finally {
      this.setState({ checkingOut: false });
    }
  }
}

export default withRouter(Mycart);
