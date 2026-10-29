
import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';

class Customer extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);

    this.state = {
      customers: [],
      orders: [],
      order: null,
      processingId: null
    };
  }

  componentDidMount() {
    this.apiGetCustomers();
  }

  render() {
    const customers = this.state.customers.map((item) => {
      return (
        <tr
          key={item._id}
          className="datatable"
          onClick={() => this.trCustomerClick(item)}
          style={{ cursor: 'pointer' }}
        >
          <td>{item._id}</td>
          <td>{item.username}</td>
          <td>{item.name}</td>
          <td>{item.phone}</td>
          <td>{item.email}</td>
          <td>{item.active}</td>
          <td>
            {item.active === 0 ? (
              <span
                className="link"
                onClick={(event) => {
                  event.stopPropagation();

                  if (this.state.processingId === null) {
                    this.lnkEmailClick(item);
                  }
                }}
              >
                {this.state.processingId === item._id
                  ? 'SENDING...'
                  : 'EMAIL'}
              </span>
            ) : (
              <span
                className="link"
                onClick={(event) => {
                  event.stopPropagation();

                  if (this.state.processingId === null) {
                    this.lnkDeactiveClick(item);
                  }
                }}
              >
                {this.state.processingId === item._id
                  ? 'PROCESSING...'
                  : 'DEACTIVE'}
              </span>
            )}
          </td>
        </tr>
      );
    });

    const orders = this.state.orders.map((item) => {
      return (
        <tr
          key={item._id}
          className="datatable"
          onClick={() => this.trOrderClick(item)}
          style={{ cursor: 'pointer' }}
        >
          <td>{item._id}</td>
          <td>{new Date(item.cdate).toLocaleString()}</td>
          <td>{item.customer.name}</td>
          <td>{item.customer.phone}</td>
          <td>{item.total}</td>
          <td>{item.status}</td>
        </tr>
      );
    });

    let items = null;

    if (this.state.order) {
      items = this.state.order.items.map((item, index) => {
        return (
          <tr key={item.product._id} className="datatable">
            <td>{index + 1}</td>
            <td>{item.product._id}</td>
            <td>{item.product.name}</td>
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
          </tr>
        );
      });
    }

    return (
      <div>
        <div className="align-center">
          <h2 className="text-center">CUSTOMER LIST</h2>

          <table className="datatable" border="1">
            <tbody>
              <tr className="datatable">
                <th>ID</th>
                <th>Username</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Active</th>
                <th>Action</th>
              </tr>
              {customers}
            </tbody>
          </table>
        </div>

        {this.state.orders.length > 0 ? (
          <div className="align-center">
            <h2 className="text-center">ORDER LIST</h2>

            <table className="datatable" border="1">
              <tbody>
                <tr className="datatable">
                  <th>ID</th>
                  <th>Creation date</th>
                  <th>Cust. name</th>
                  <th>Cust. phone</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
                {orders}
              </tbody>
            </table>
          </div>
        ) : null}

        {this.state.order ? (
          <div className="align-center">
            <h2 className="text-center">ORDER DETAIL</h2>

            <table className="datatable" border="1">
              <tbody>
                <tr className="datatable">
                  <th>No.</th>
                  <th>Prod. ID</th>
                  <th>Prod. name</th>
                  <th>Image</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Amount</th>
                </tr>
                {items}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    );
  }

  // =================
  // EVENT HANDLERS
  // =================

  trCustomerClick(item) {
    this.setState({
      orders: [],
      order: null
    });

    this.apiGetOrdersByCustID(item._id);
  }

  trOrderClick(item) {
    this.setState({ order: item });
  }

  // Lab 9 - Deactive customer
  lnkDeactiveClick(item) {
    if (item.active !== 1) {
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to deactivate customer ' +
      item.username + '?'
    );

    if (confirmed) {
      this.apiDeactiveCustomer(item._id);
    }
  }

  // Lab 9 - Admin Sendmail
  lnkEmailClick(item) {
    if (item.active !== 0) {
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to send a verification email to ' +
      item.username + '?'
    );

    if (confirmed) {
      this.apiSendmail(item._id);
    }
  }

  // =================
  // APIS
  // =================

  apiGetCustomers() {
    const config = {
      headers: {
        'x-access-token': this.context.token
      }
    };

    axios
      .get('/api/admin/customers', config)
      .then((res) => {
        const result = res.data;

        if (Array.isArray(result)) {
          this.setState({ customers: result });
        } else {
          alert(result.message || 'Cannot load customers');
        }
      })
      .catch((error) => {
        console.error('Get customers error:', error);
        alert('Get customers failed');
      });
  }

  apiGetOrdersByCustID(cid) {
    const config = {
      headers: {
        'x-access-token': this.context.token
      }
    };

    axios
      .get('/api/admin/orders/customer/' + cid, config)
      .then((res) => {
        const result = res.data;

        if (Array.isArray(result)) {
          this.setState({ orders: result });
        } else {
          alert(result.message || 'Cannot load orders');
        }
      })
      .catch((error) => {
        console.error('Get customer orders error:', error);
        alert('Get customer orders failed');
      });
  }

  // Lab 9 - API Deactive Customer
  apiDeactiveCustomer(_id) {
    if (this.state.processingId !== null) {
      return;
    }

    const config = {
      headers: {
        'x-access-token': this.context.token
      }
    };

    this.setState({ processingId: _id }, () => {
      axios
        .put(
          '/api/admin/customers/deactive/' + _id,
          {},
          config
        )
        .then((res) => {
          const result = res.data;

          if (result.success === true) {
            alert('Customer deactivated successfully');
            this.apiGetCustomers();
          } else {
            alert(result.message || 'Deactivate failed');
          }
        })
        .catch((error) => {
          console.error('Deactivate customer error:', error);

          alert(
            error.response?.data?.message ||
            'Deactivate customer failed'
          );
        })
        .finally(() => {
          this.setState({ processingId: null });
        });
    });
  }

  // Lab 9 - API Admin Sendmail
  apiSendmail(_id) {
    if (this.state.processingId !== null) {
      return;
    }

    const config = {
      headers: {
        'x-access-token': this.context.token
      }
    };

    this.setState({ processingId: _id }, () => {
      axios
        .get(
          '/api/admin/customers/sendmail/' + _id,
          config
        )
        .then((res) => {
          const result = res.data;

          if (result.success === true) {
            alert(result.message || 'Email sent successfully');
          } else {
            alert(result.message || 'Sendmail failed');
          }
        })
        .catch((error) => {
          console.error('Sendmail error:', error);

          alert(
            error.response?.data?.message ||
            'Sendmail failed'
          );
        })
        .finally(() => {
          this.setState({ processingId: null });
        });
    });
  }
}

export default Customer;
