import React from 'react';

export type Product = {
	_id: string;
	name: string;
	image?: string;
	category?: string;
	material?: string;
	newPrice?: number;
};

export type CartItemType = {
	productId: Product;
	quantity: number;
};

interface Props {
	item: CartItemType;
	onIncrement: (productId: string) => void;
	onDecrement: (productId: string) => void;
	onQuantityChange: (productId: string, newQuantity: number) => void;
	onRemove: (productId: string) => void;
}

const CartItem: React.FC<Props> = ({ item, onIncrement, onDecrement, onQuantityChange, onRemove }) => {
	const { productId, quantity } = item;

	return (
		<div className="cart-item" data-id={productId._id}>
			<img src={productId.image} alt={productId.name} />
			<div className="cart-item-details">
				<h3 className="cart-item-name">{productId.name}</h3>
				<p>Category: {productId.category}</p>
				<p>Material: {productId.material || ''}</p>
				<p className="cart-item-price">₹{productId.newPrice}</p>
			</div>

			<div className="quantity-controls">
				<button className="quantity-btn minus" onClick={(e) => { e.stopPropagation(); onDecrement(productId._id); }} disabled={quantity <= 1}>-</button>
				<input className="quantity-input" type="number" value={quantity} min={1} onChange={(e) => { const v = parseInt(e.target.value || '1'); onQuantityChange(productId._id, isNaN(v) ? 1 : v); }} />
				<button className="quantity-btn plus" onClick={(e) => { e.stopPropagation(); onIncrement(productId._id); }}>+</button>
			</div>

			<button className="remove-btn" onClick={(e) => { e.stopPropagation(); onRemove(productId._id); }}>Remove</button>
		</div>
	);
};

export default CartItem;
