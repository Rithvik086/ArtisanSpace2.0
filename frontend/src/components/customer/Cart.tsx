import React, { useCallback, useEffect, useState } from 'react';
import '../../assets/customer/cart.css';
import CartItem from './CartItem';

type Product = {
	_id: string;
	name: string;
	image?: string;
	category?: string;
	material?: string;
	newPrice?: number;
};

type CartItem = {
	productId: Product;
	quantity: number;
};

const Cart: React.FC = () => {
	const [userId, setUserId] = useState<string | null>(null);
	const [cartItems, setCartItems] = useState<CartItem[]>([]);
		// total amount (if needed later) - omitted to avoid unused variable
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [notifications, setNotifications] = useState<{ id: string; message: string; type: 'success' | 'error' }[]>([]);

	useEffect(() => {
		(async () => {
			try {
				const userRes = await fetch('/customer/api/user');
				if (userRes.ok) {
					const user = await userRes.json();
					setUserId(user.id || null);
				}
			} catch (err) {
				console.error('Could not fetch user', err);
			}

			await refreshCart();
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const showNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
		const id = String(Date.now()) + Math.random();
		setNotifications((s) => [...s, { id, message, type }]);
		setTimeout(() => setNotifications((s) => s.filter(n => n.id !== id)), 3000);
	}, []);

	const refreshCart = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch('/customer/api/cart');
			if (!res.ok) throw new Error('Failed to load cart');
			const data = await res.json();
			setCartItems(data.cart || []);
		} catch (err) {
			// eslint-disable-next-line no-console
			console.error('Error refreshing cart', err);
			setError('Failed to load your cart. Please try again.');
		} finally {
			setLoading(false);
		}
	}, []);

	const updateCartApi = useCallback(async (productId: string, action: string, amountParam = 0) => {
		try {
			const res = await fetch(`/customer/cart?userId=${userId || ''}&productId=${productId}&action=${action}&amount=${amountParam}`, { method: 'POST' });
			const data = await res.json();
			if (data.success) {
				showNotification(data.message || 'Updated', 'success');
			} else {
				showNotification(data.message || 'Failed to update cart', 'error');
			}
			// refresh summary or cart
			await refreshCart();
		} catch (err) {
			// eslint-disable-next-line no-console
			console.error('Error updating cart', err);
			showNotification('Something went wrong updating your cart', 'error');
		}
	}, [refreshCart, showNotification, userId]);

	const handleRemove = useCallback(async (productId: string) => {
		await updateCartApi(productId, 'rem', 0);
	}, [updateCartApi]);

	const handleQuantityChange = useCallback(async (productId: string, newQuantity: number) => {
		if (newQuantity < 1) newQuantity = 1;
		try {
			// Optimistic update
			setCartItems(prev => prev.map(item => item.productId._id === productId ? { ...item, quantity: newQuantity } : item));
			const res = await fetch(`/customer/cart?userId=${userId || ''}&productId=${productId}&action=none&amount=${newQuantity}`, { method: 'POST' });
			const data = await res.json();
			if (!data.success) {
				showNotification(data.message || 'Failed to update quantity', 'error');
				// revert by refreshing
				await refreshCart();
			} else {
				showNotification(data.message || 'Quantity updated', 'success');
				await refreshCart();
			}
		} catch (err) {
			// eslint-disable-next-line no-console
			console.error('Error updating quantity', err);
			showNotification('Something went wrong updating quantity', 'error');
			await refreshCart();
		}
	}, [refreshCart, showNotification, userId]);

	const handleIncrement = useCallback(async (productId: string) => {
		// Optimistic UI handled inside updateQuantity endpoint on server; still refresh afterwards
		try {
			// UI immediate change
			setCartItems(prev => prev.map(item => item.productId._id === productId ? { ...item, quantity: item.quantity + 1 } : item));
			const res = await fetch(`/customer/cart?userId=${userId || ''}&productId=${productId}&action=add&amount=0`, { method: 'POST' });
			const data = await res.json();
			if (!data.success) showNotification(data.message || 'Failed to update quantity', 'error');
			await refreshCart();
		} catch (err) {
			// eslint-disable-next-line no-console
			console.error('Error incrementing quantity', err);
			showNotification('Something went wrong', 'error');
			await refreshCart();
		}
	}, [refreshCart, showNotification, userId]);

	const handleDecrement = useCallback(async (productId: string) => {
		// Only decrement when quantity > 1 (UI will ensure)
		const item = cartItems.find(c => c.productId._id === productId);
		if (!item) return;
		if (item.quantity <= 1) return;
		try {
			setCartItems(prev => prev.map(it => it.productId._id === productId ? { ...it, quantity: it.quantity - 1 } : it));
			const res = await fetch(`/customer/cart?userId=${userId || ''}&productId=${productId}&action=del&amount=0`, { method: 'POST' });
			const data = await res.json();
			if (!data.success) showNotification(data.message || 'Failed to update quantity', 'error');
			await refreshCart();
		} catch (err) {
			// eslint-disable-next-line no-console
			console.error('Error decrementing quantity', err);
			showNotification('Something went wrong', 'error');
			await refreshCart();
		}
	}, [cartItems, refreshCart, showNotification, userId]);

	if (loading) {
		return (
			<main className="cart-main">
				<div id="contentBox">
					<div className="loading-spinner"><i className="fas fa-circle-notch fa-spin" />
						<p>Loading your cart...</p>
					</div>
				</div>
			</main>
		);
	}

	if (error) {
		return (
			<main className="cart-main">
				<div id="contentBox">
					<div className="error-message"><i className="fas fa-exclamation-circle" />
						<p>{error}</p>
						<button onClick={refreshCart} className="retry-btn">Retry</button>
					</div>
				</div>
			</main>
		);
	}

	return (
		<div className="cart-page">
			<div id="navbar-placeholder" />
			<main>
				<div id="contentBox">
					{cartItems && cartItems.length > 0 ? (
						<div className="cart-items">
							{cartItems.map(item => (
								<CartItem
									key={item.productId._id}
									item={item}
									onIncrement={handleIncrement}
									onDecrement={handleDecrement}
									onQuantityChange={handleQuantityChange}
									onRemove={handleRemove}
								/>
							))}

							<button id="checkoutBtn" className="checkout-button" onClick={() => { window.location.href = '/customer/checkout'; }}>
								Proceed to Checkout
							</button>
						</div>
					) : (
						<div className="empty-cart">
							<h2>Your cart is empty</h2>
							<p>Looks like you haven't added any products to your cart yet</p>
							<a href="/customer/store" className="shop-now-btn">Shop Now</a>
						</div>
					)}
				</div>
			</main>

			<div className="notification-container">
				{notifications.map(n => (
					<div key={n.id} className={`notification ${n.type}`}><i className={`fas fa-${n.type === 'success' ? 'check-circle' : 'exclamation-circle'}`}></i> {n.message}</div>
				))}
			</div>

			<div id="footer-placeholder" />
		</div>
	);
};

export default Cart;

