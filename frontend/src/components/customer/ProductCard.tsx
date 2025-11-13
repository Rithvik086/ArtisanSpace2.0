import React from 'react';

export type Product = {
	_id: string;
	name: string;
	image?: string;
	category?: string;
	material?: string;
	oldPrice?: number;
	newPrice?: number;
	description?: string;
};

interface Props {
	product: Product;
	userId: string | null;
	updateCart: (userIdParam: string | null, productId: string) => Promise<void> | void;
}

const ProductCard: React.FC<Props> = ({ product, userId, updateCart }) => {
	const discountPercent = (product.oldPrice && product.newPrice && product.oldPrice > product.newPrice)
		? Math.round(((product.oldPrice - product.newPrice) / product.oldPrice) * 100)
		: 0;
	const rating = Math.floor(Math.random() * 2) + 3;
	const stars = Array.from({ length: 5 }).map((_, i) => (
		<i key={i} className={`${i < rating ? 'fas' : 'far'} fa-star`} />
	));

	return (
		<div className="product-card">
			<a href={`/products/${product._id}`} className="product-image-link">
				<img src={product.image} alt={product.name} />
				{discountPercent > 0 && <span className="discount-badge">-{discountPercent}%</span>}
			</a>
			<div className="details">
				<a href={`/products/${product._id}`} className="product-title-link"><h3 title={product.name}>{product.name}</h3></a>
				<div className="product-meta">
					<span className="product-category">{product.category}</span>
					{product.material && <span className="product-material">{product.material}</span>}
				</div>
				<div className="product-rating">{stars}</div>
				<div className="price">
					{product.oldPrice && product.oldPrice > (product.newPrice ?? 0) && <span className="old-price">₹{product.oldPrice}</span>}
					<span className="new-price">₹{product.newPrice}</span>
				</div>
				<button className="add-to-cart-btn" onClick={() => updateCart(userId, product._id)}>
					<i className="fas fa-shopping-cart" /> Add to Cart
				</button>
			</div>
		</div>
	);
};

export default ProductCard;
