import { useState } from 'react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const CheckoutPage = () => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Get order from backend
      const orderResponse = await fetch('/api/v1/payments/create-order', {
        method: 'POST',
        credentials: 'include',
      });
      const order = await orderResponse.json();
      if (!orderResponse.ok) throw new Error(order.error || 'Order creation failed');

      // Load Razorpay script if not loaded
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        document.body.appendChild(script);
        await new Promise((resolve) => script.onload = resolve);
      }

      // Razorpay options
      const options = {
        key: 'rzp_test_S4taigLOZNozsn',  // Your test key
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: 'Artisan Space',
        description: 'Payment for your order',
        handler: async (response: any) => {
          // Verify payment on backend
          const verifyResponse = await fetch('/api/v1/payments/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: order.amount,
              orderId: order.orderId,  // If you have internal order ID
            }),
          });
          const result = await verifyResponse.json();
          if (result.success) {
            alert('Payment successful! Your order is confirmed.');
            // Redirect or update UI
          } else {
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: 'Customer Name',
          email: 'customer@example.com',
        },
        theme: {
          color: '#3399cc',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      alert('Payment failed: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>
      <button onClick={handlePayment} disabled={loading}>
        {loading ? 'Processing Payment...' : 'Pay Now'}
      </button>
    </div>
  );
};

export default CheckoutPage;