
import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';

class Order extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);

    this.state = {
      orders: [],
      order: null,
      processingId: null
    };
  }

  componentDidMount() {
    this.apiGetOrders();
  }

  render() {
    const orders = this.state.orders.map((item) => {
      const isProcessing = this.state.processingId === item._id;

      return (
        <tr
          key={item._id}
          className="datatable"
          onClick={() => this.trItemClick(item)}
          style={{ cursor: 'pointer' }}
        >
          <td>{item._id}</td>
          <td>{new Date(item.cdate).toLocaleString()}</td>
          <td>{item.customer.name}</td>
          <td>{item.customer.phone}</td>
          <td>{item.total}</td>
          <td>{item.status}</td>
          <td>
            {item.status === 'PENDING' ? (
              isProcessing ? (
                <span>PROCESSING...</span>
              ) : (
                <div>
                  <span
                    className="link"
                    onClick={(e) => {
                      e.stopPropagation();
                      this.lnkApproveClick(item._id);
                    }}
                  >
                    APPROVE
                  </span>
                  {' | '}
                  <span
                    className="link"
                    onClick={(e) => {
                      e.stopPropagation();
                      this.lnkCancelClick(item._id);
                    }}
                  >
                    CANCEL
                  </span>
                </div>
              )
            ) : null}
          </td>
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
                <th>Action</th>
              </tr>

              {orders}
            </tbody>
          </table>
        </div>

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

  // event-handlers
  trItemClick(item) {
    this.setState({ order: item });
  }

  lnkApproveClick(_id) {
    this.apiPutOrderStatus(_id, 'APPROVED');
  }

  lnkCancelClick(_id) {
    this.apiPutOrderStatus(_id, 'CANCELED');
  }

  // apis
  apiGetOrders() {
    const config = {
      headers: {
        'x-access-token': this.context.token
      }
    };

    axios
      .get('/api/admin/orders', config)
      .then((res) => {
        const result = res.data;

        if (Array.isArray(result)) {
          this.setState((prevState) => ({
            orders: result,
            order: prevState.order
              ? result.find(
                  (item) => item._id === prevState.order._id
                ) || null
              : null
          }));
        } else {
          alert(result.message || 'Cannot load orders');
        }
      })
      .catch((error) => {
        console.error('Get orders error:', error);
        alert('Get orders failed');
      });
  }

  apiPutOrderStatus(_id, status) {
    if (this.state.processingId !== null) {
      return;
    }

    this.setState({ processingId: _id });

    const body = {
      status: status
    };

    const config = {
      headers: {
        'x-access-token': this.context.token
      }
    };

    axios
      .put('/api/admin/orders/status/' + _id, body, config)
      .then((res) => {
        const result = res.data;

        if (result && result._id && result.status === status) {
          alert('OK BABY!');
          this.apiGetOrders();
        } else {
          alert(result.message || 'SORRY BABY!');
        }
      })
      .catch((error) => {
        console.error('Update order status error:', error);

        alert(
          error.response?.data?.message ||
          'Update order status failed'
        );
      })
      .finally(() => {
        this.setState({ processingId: null });
      });
  }
}

export default Order;
