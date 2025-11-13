import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../assets/customer/orderDetails.css';

interface Product {
  _id: string;
  name: string;
  image: string;
  newPrice: number;
  category: string;
  material: string;
}

interface OrderProduct {
  productId: Product;
  quantity: number;
}

interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
  mobile_no?: string;
  address?: string;
}

interface TrackingInfo {
  carrier?: string;
  number?: string;
}

interface Order {
  _id: string;
  userId: User;
  products: OrderProduct[];
  status: string;
  purchasedAt: string;
  money: number;
  paymentMethod?: string;
  paymentStatus?: string;
  tracking?: TrackingInfo;
}

const OrderDetails: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrderDetails();
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      const response = await fetch(`/customer/api/orders/${orderId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }

      const data = await response.json();
      setOrder(data);
      setError(null);
    } catch (error) {
      console.error('Error loading order details:', error);
      setError('Failed to load order details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateOrderSummary = (products: OrderProduct[]) => {
    const subtotal = products.reduce((acc, product) => {
      return acc + (product.productId.newPrice * product.quantity);
    }, 0);
    const shipping = 50;
    const tax = Math.round(subtotal * 0.05 * 100) / 100;

    return { subtotal, shipping, tax };
  };

  const formatAddress = (address?: string) => {
    if (!address) return null;

    const addressParts = address.split('|').map(part => part.trim());
    const addressLabels = {
      0: 'Building/House:',
      1: 'Street/Area:',
      2: 'City:',
      3: 'State:',
      4: 'Pincode:',
      5: 'Country:'
    };

    return addressParts.map((part, index) => (
      part && (
        <div className="info-row" key={index}>
          <span className="info-label">{addressLabels[index as keyof typeof addressLabels]}</span>
          <span className="info-value">{part}</span>
        </div>
      )
    ));
  };

  if (loading) {
    return (
      <div className="order-details-main">
        <div className="loading">
          <i className="fas fa-spinner fa-spin"></i> Loading order details...
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-details-main">
        <div className="error">
          <i className="fas fa-exclamation-triangle"></i> {error}
        </div>
      </div>
    );
  }

  const { subtotal, shipping, tax } = calculateOrderSummary(order.products);
  const orderDate = new Date(order.purchasedAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="order-details-page">
      <main className="order-details-main">
        <div className="order-header">
          <div>
            <h1 className="order-id">Order #{order._id.toString().slice(-6).toUpperCase()}</h1>
            <div className="order-date">Placed on {orderDate}</div>
            <div className="order-status">
              <span className={`status-badge ${order.status.toLowerCase()}`}>
                {order.status}
              </span>
            </div>
          </div>
        </div>

        <div className="order-sections">
          <div className="order-details">
            <h2 className="section-title">Order Items</h2>
            <div className="order-items">
              {order.products.map((product, index) => (
                <div className="item" key={index}>
                  <img
                    src={product.productId.image}
                    alt={product.productId.name}
                    className="item-image"
                  />
                  <div className="item-info">
                    <div className="item-name">{product.productId.name}</div>
                    <div className="item-seller">Category: {product.productId.category}</div>
                    <div className="item-seller">Material: {product.productId.material}</div>
                  </div>
                  <div className="item-price">₹{product.productId.newPrice}</div>
                  <div className="item-quantity">Qty: {product.quantity}</div>
                </div>
              ))}
            </div>

            <div className="order-summary">
              <h2 className="section-title">Order Summary</h2>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>₹{shipping.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Tax (5%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>₹{order.money.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="customer-details">
            <div className="customer-info">
              <h2 className="section-title">Customer Information</h2>
              <div className="info-row">
                <span className="info-label">Name:</span>
                <span className="info-value">{order.userId.name}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Username:</span>
                <span className="info-value">{order.userId.username}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Email:</span>
                <span className="info-value">{order.userId.email}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Phone:</span>
                <span className="info-value">{order.userId.mobile_no || 'N/A'}</span>
              </div>
            </div>

            <div className="shipping-info">
              <h2 className="section-title">Shipping Information</h2>
              <div className="shipping-address">
                <div className="address-title">Delivery Address</div>
                {formatAddress(order.userId.address)}
              </div>

              {(order.status === 'shipped' || order.status === 'delivered') && order.tracking && (
                <div className="tracking-info">
                  <div className="address-title">Tracking Information</div>
                  <div className="info-row">
                    <span className="info-label">Carrier:</span>
                    <span className="info-value">{order.tracking.carrier || 'Standard Shipping'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Tracking #:</span>
                    <span className="info-value">{order.tracking.number || 'N/A'}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="payment-info">
              <h2 className="section-title">Payment Information</h2>
              <div className="info-row">
                <span className="info-label">Method:</span>
                <span className="info-value">{order.paymentMethod || 'Cash on Delivery'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Status:</span>
                <span className="info-value">{order.paymentStatus || 'Pending'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button className="btn outline-btn" onClick={() => window.print()}>
            Print Invoice
          </button>
          <button className="btn outline-btn" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>
      </main>
    </div>
  );
};

export default OrderDetails;
