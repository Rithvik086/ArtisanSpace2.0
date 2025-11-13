import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/customer/checkout.css';

interface Product {
  _id: string;
  name: string;
  image: string;
  newPrice: number;
}

interface CartItem {
  productId: Product;
  quantity: number;
}

interface User {
  name: string;
  address: string;
}

interface CheckoutData {
  cart: CartItem[];
  amount: number;
  shipping: number;
  tax: number;
  user: User;
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    nameOnCard: ''
  });
  const [upiId, setUpiId] = useState('');

  useEffect(() => {
    loadCheckoutData();
  }, []);

  const loadCheckoutData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/customer/api/checkout');
      if (!response.ok) throw new Error('Failed to fetch checkout data');

      const data = await response.json();
      setCheckoutData(data);
    } catch (error) {
      console.error('Error loading checkout data:', error);
      showNotification('Failed to load checkout details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod(method);
  };

  const handlePlaceOrder = async () => {
    try {
      const response = await fetch('/customer/place-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentMethod }),
      });

      const data = await response.json();

      if (data.success) {
        showNotification('Order placed successfully!', 'success');
        setTimeout(() => {
          navigate('/customer');
        }, 1500);
      } else {
        showNotification(data.message || 'Failed to place order', 'error');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      showNotification('Something went wrong', 'error');
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    const container = document.querySelector(".notification-container") || (() => {
      const div = document.createElement("div");
      div.className = "notification-container";
      document.body.appendChild(div);
      return div;
    })();

    if ([...container.children].some(n => n.textContent === message)) {
      return;
    }

    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;

    container.appendChild(notification);

    setTimeout(() => {
      notification.classList.add("fade-out");
      setTimeout(() => {
        notification.remove();
      }, 500);
    }, 3000);
  };

  const renderAddress = (user: User) => {
    const addressParts = user.address ? user.address.split('|') : [];
    const displayAddress = addressParts.slice(0, 3).join(', ') || 'No address provided';
    const state = addressParts[3] || 'N/A';
    const pincode = addressParts[4] || 'N/A';

    return (
      <>
        <div className="address-item">
          <strong>Address:</strong> {displayAddress}
        </div>
        <div className="address-item">
          <strong>State:</strong> {state}
        </div>
        <div className="address-item">
          <strong>Pincode:</strong> {pincode}
        </div>
        <div className="address-item">
          <strong>Name:</strong> {user.name || 'N/A'}
        </div>
      </>
    );
  };

  const calculateTotal = (cart: CartItem[]) => {
    const subtotal = cart.reduce((sum, item) => sum + (item.productId.newPrice * item.quantity), 0);
    return {
      subtotal,
      total: subtotal + (checkoutData?.shipping || 0) + (checkoutData?.tax || 0)
    };
  };

  if (loading) {
    return (
      <div className="loading-spinner" style={{ display: 'block' }}>
        <div className="spinner"></div>
        <p>Loading cart details...</p>
      </div>
    );
  }

  if (!checkoutData) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: '#dc3545' }}>
        Failed to load checkout details. Please refresh the page.
      </div>
    );
  }

  const { subtotal, total } = calculateTotal(checkoutData.cart);

  return (
    <div className="checkoutBody">
      <div className="checkout-container">
        {/* LEFT SECTION: ORDER SUMMARY */}
        <div className="checkout-left">
          <div className="box">
            <h3>Order Summary</h3>
            <div className="products">
              {checkoutData.cart.map((item, index) => (
                <div key={index} className="checkout-item">
                  <img src={item.productId.image} alt={item.productId.name} className="product-img" />
                  <div className="product-details">
                    <h3>{item.productId.name}</h3>
                    <p className="price">₹{item.productId.newPrice}</p>
                    <p className="quantity">Quantity: {item.quantity}</p>
                    <p className="item-total">Item Total: ₹{(item.productId.newPrice * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="summary">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping:</span>
                <span>₹{checkoutData.shipping}</span>
              </div>
              <div className="summary-row">
                <span>Tax:</span>
                <span>₹{checkoutData.tax.toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Total Amount:</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SECTION: SHIPPING & PAYMENT */}
        <div className="checkout-right">
          <div className="box">
            <h3>Shipping Information</h3>
            {renderAddress(checkoutData.user)}
          </div>

          <button className="changeAddress-btn" onClick={() => navigate('/customer/settings')}>
            Change Address
          </button>

          <div className="box">
            <h3>Payment Method</h3>
            <div className="payment-options">
              <div className="payment-option">
                <input
                  type="radio"
                  id="cod"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={(e) => handlePaymentMethodChange(e.target.value)}
                />
                <label htmlFor="cod">Cash on Delivery</label>
              </div>
              <div className="payment-option">
                <input
                  type="radio"
                  id="card"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => handlePaymentMethodChange(e.target.value)}
                />
                <label htmlFor="card">Credit/Debit Card</label>
              </div>
              <div className="payment-option">
                <input
                  type="radio"
                  id="upi"
                  name="paymentMethod"
                  value="upi"
                  checked={paymentMethod === 'upi'}
                  onChange={(e) => handlePaymentMethodChange(e.target.value)}
                />
                <label htmlFor="upi">UPI</label>
              </div>
            </div>

            {paymentMethod === 'card' && (
              <div className="payment-details">
                <div className="form-group">
                  <label htmlFor="cardNumber" className="form-label">Card Number</label>
                  <input
                    type="text"
                    id="cardNumber"
                    className="form-input"
                    placeholder="1234 5678 9012 3456"
                    value={cardDetails.cardNumber}
                    onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="expiry" className="form-label">Expiry Date</label>
                    <input
                      type="text"
                      id="expiry"
                      className="form-input"
                      placeholder="MM/YY"
                      value={cardDetails.expiry}
                      onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="cvv" className="form-label">CVV</label>
                    <input
                      type="text"
                      id="cvv"
                      className="form-input"
                      placeholder="123"
                      value={cardDetails.cvv}
                      onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="nameOnCard" className="form-label">Name on Card</label>
                  <input
                    type="text"
                    id="nameOnCard"
                    className="form-input"
                    value={cardDetails.nameOnCard}
                    onChange={(e) => setCardDetails({ ...cardDetails, nameOnCard: e.target.value })}
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'upi' && (
              <div className="payment-details">
                <div className="form-group">
                  <label htmlFor="upiId" className="form-label">UPI ID</label>
                  <input
                    type="text"
                    id="upiId"
                    className="form-input"
                    placeholder="example@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <button className="place-order-button" onClick={handlePlaceOrder}>
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
