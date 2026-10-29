
import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import withRouter from '../utils/withRouter';

class ProductDetail extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);

    this.state = {
      product: null,
      txtQuantity: 1
    };
  }

  render() {
    const prod = this.state.product;

    if (prod != null) {
      return (
        <div className="align-center">
          <h2 className="text-center">PRODUCT DETAILS</h2>

          <figure className="caption-right">
            <img
              src={'data:image/jpg;base64,' + prod.image}
              width="400px"
              height="400px"
              alt=""
            />

            <figcaption>
              <form
                onSubmit={(e) => this.btnAdd2CartClick(e)}
              >
                <table>
                  <tbody>
                    <tr>
                      <td align="right">ID:</td>
                      <td>{prod._id}</td>
                    </tr>

                    <tr>
                      <td align="right">Name:</td>
                      <td>{prod.name}</td>
                    </tr>

                    <tr>
                      <td align="right">Price:</td>
                      <td>{prod.price}</td>
                    </tr>

                    <tr>
                      <td align="right">Category:</td>
                      <td>{prod.category.name}</td>
                    </tr>

                    <tr>
                      <td align="right">Quantity:</td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          max="99"
                          value={this.state.txtQuantity}
                          onChange={(e) => {
                            this.setState({
                              txtQuantity: e.target.value
                            });
                          }}
                        />
                      </td>
                    </tr>

                    <tr>
                      <td></td>
                      <td>
                        <input
                          type="submit"
                          value="ADD TO CART"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </form>
            </figcaption>
          </figure>
        </div>
      );
    }

    return <div />;
  }

  componentDidMount() {
    const params = this.props.params;
    this.apiGetProduct(params.id);
  }

  // event-handlers
  btnAdd2CartClick(e) {
    e.preventDefault();

    const product = this.state.product;
    const quantity = Number(this.state.txtQuantity);

    if (
      product &&
      Number.isInteger(quantity) &&
      quantity >= 1 &&
      quantity <= 99
    ) {
      const mycart = [...this.context.mycart];

      const index = mycart.findIndex(
        (x) => x.product._id === product._id
      );

      if (index === -1) {
        // Product does not exist in cart
        const newItem = {
          product: product,
          quantity: quantity
        };

        mycart.push(newItem);
      } else {
        // Product already exists, increase quantity
        mycart[index] = {
          ...mycart[index],
          quantity: mycart[index].quantity + quantity
        };
      }

      this.context.setMycart(mycart);
      alert('OK BABY!');
    } else {
      alert('Please input a valid quantity (1-99)');
    }
  }

  // apis
  apiGetProduct(id) {
    axios
      .get('/api/customer/products/' + id)
      .then((res) => {
        const result = res.data;
        this.setState({ product: result });
      })
      .catch((error) => {
        console.error('Get product error:', error);
      });
  }
}

export default withRouter(ProductDetail);
