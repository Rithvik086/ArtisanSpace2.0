import React from 'react';

type ProductItem = {
	productId: {
		_id?: string;
		name?: string;
		image?: string;
		newPrice?: number;
	} | null;
	quantity?: number;
};

type Order = {
	_id: string;
	products: ProductItem[];
	status: string;
	purchasedAt?: string | number;
	money?: number;
};

interface Props {
	order: Order;
	index?: number;
	onNavigate?: (id?: string) => void;
}

const OrderCard: React.FC<Props> = ({ order, index = 0, onNavigate }) => {
	const handleCardClick = () => {
		if (onNavigate) onNavigate(order._id);
	};

	return (
		<article key={order._id} className="card" data-id={order._id} onClick={handleCardClick}>
			{index === 0 && (
				<div className="card-badge">
					<i className="fas fa-star" />
				</div>
			)}
			<div className="card-header">
				<h3>
					<i className="fas fa-receipt" /> Order #{order._id.slice(-6).toUpperCase()}
				</h3>
				<span className={`status ${order.status.toLowerCase()}`}>{order.status}</span>
			</div>
			<div className="card-body">
				<p>
					<strong>
						<i className="fas fa-box-open" /> Products:
					</strong>
				</p>
				<ul className="order-products-list">
					{order.products.map((product, idx) => (
						<li key={idx}>
							<div className="product-item">
								<div className="product-image">
									<img src={product.productId?.image} alt={product.productId?.name} />
								</div>
								<div className="product-details">
									<strong>{product.productId?.name}</strong>
									<span className="quantity">x{product.quantity}</span>
									<span className="price">₹{((product.productId?.newPrice || 0) * (product.quantity || 0)).toFixed(2)}</span>
								</div>
							</div>
						</li>
					))}
				</ul>
				<div className="order-summary">
					<p className="order-date">
						<i className="far fa-calendar-alt" />{' '}
						{order.purchasedAt ? new Date(order.purchasedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
					</p>
					<p className="order-total">
						<i className="fas fa-rupee-sign" /> {order.money?.toFixed(2)}
					</p>
				</div>
			</div>
			<div className="card-footer">
				{order.status === 'delivered' ? (
					<div className="order-actions">
						<button
							className="btn outline"
							onClick={(ev) => {
								ev.stopPropagation();
								if (onNavigate) onNavigate(order._id);
							}}
						>
							<i className="fas fa-eye" /> View Details
						</button>
					</div>
				) : (
					<>
						<div className="order-status-info">
							{order.status === 'pending' ? (
								<><i className="fas fa-clock" /> Your order is waiting to be processed</>
							) : order.status === 'processing' ? (
								<><i className="fas fa-cog fa-spin" /> Your order is being processed</>
							) : order.status === 'shipped' ? (
								<><i className="fas fa-truck" /> Your order is on the way</>
							) : null}
						</div>
						<button
							className="btn outline"
							onClick={(ev) => {
								ev.stopPropagation();
								if (onNavigate) onNavigate(order._id);
							}}
						>
							<i className="fas fa-eye" /> View Details
						</button>
					</>
				)}
			</div>
		</article>
	);
};

export default OrderCard;
