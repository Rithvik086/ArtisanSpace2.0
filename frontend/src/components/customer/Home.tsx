import React, { useEffect, useRef, useState } from 'react';
import '../../assets/customer/customerHome.css';
import OrderCard from './OrderCard';

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

type Request = {
	_id?: string;
	title?: string;
	isAccepted?: boolean;
	image?: string;
	type?: string;
	description?: string;
	budget?: string | number;
	requiredBy?: string;
};

type Workshop = {
	_id?: string;
	workshopTitle?: string;
	workshopDescription?: string;
	date?: string;
	time?: string;
	status?: number;
	acceptedAt?: string;
};

type Product = {
	_id?: string;
	name?: string;
	image?: string;
};

const Home: React.FC = () => {
	const [orders, setOrders] = useState<Order[]>([]);
	const [requests, setRequests] = useState<Request[]>([]);
	const [workshops, setWorkshops] = useState<Workshop[]>([]);
	const [products, setProducts] = useState<Product[]>([]);
	const [activeTab, setActiveTab] = useState<'orders' | 'requests' | 'workshops'>('orders');
	const sliderRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		// Fetch orders
		(async () => {
			try {
				const res = await fetch('/customer/api/orders');
				if (res.ok) setOrders(await res.json());
			} catch (err) {
				console.error('Error fetching orders', err);
			}
		})();

		// Fetch requests
		(async () => {
			try {
				const res = await fetch('/customer/api/requests');
				if (res.ok) setRequests(await res.json());
			} catch (err) {
				console.error('Error fetching requests', err);
			}
		})();

		// Fetch workshops
		(async () => {
			try {
				const res = await fetch('/customer/api/workshops');
				if (res.ok) setWorkshops(await res.json());
			} catch (err) {
				console.error('Error fetching workshops', err);
			}
		})();

		// Fetch slider products
		(async () => {
			try {
				const res = await fetch('/customer/api/products');
				if (res.ok) setProducts(await res.json());
			} catch (err) {
				console.error('Error fetching products', err);
			}
		})();
	}, []);

	// Slider animation
	useEffect(() => {
		const slider = sliderRef.current;
		if (!slider) return;
		let interval: number | undefined;

		const moveSlider = () => {
			const first = slider.firstElementChild as HTMLElement | null;
			if (!first) return;
			const imgWidth = first.offsetWidth + 20;
			slider.style.transition = 'transform 0.7s ease-in-out';
			slider.style.transform = `translateX(-${imgWidth}px)`;
			window.setTimeout(() => {
				if (first.parentElement) slider.appendChild(first);
				slider.style.transition = 'none';
				slider.style.transform = 'translateX(0)';
			}, 700);
		};

		interval = window.setInterval(moveSlider, 4000) as unknown as number;
		return () => {
			if (interval) window.clearInterval(interval);
		};
	}, [products]);

	return (
		<main className="customer-home">
			<div className="mainimage">
				<h3>We Make Things With love</h3>
				<h1>HANDMADE</h1>
				<p>
					Lorem ipsum, dolor sit amet consectetur adipisicing elit. Sapiente
					eligendi repudiandae vero quis? Nostrum provident repellendus alias
					incidunt, perferendis aut blanditiis dicta nisi, magni enim sint
					magnam quidem eius temporibus maxime facere?
				</p>
			</div>

			<div className="seconelem">
				<img src="/images/landingpage/artisan.jpg" alt="artisan" />
				<div className="welcomecontent">
					<h1>Welcome To ArtisanSpace</h1>
					<p>
						It is a long established fact that a reader will be distracted by
						the readable content of a page when looking at its layout. The point
						of using Lorem Ipsum is that it has a more-or-less normal
						distribution of letters, as opposed to using 'Content here, content
						here', making it look like readable English. Many desktop publishing
						packages and web page editors now use Lorem Ipsum as their default
						model text, and a search for 'lorem ipsum' will uncover.
					</p>
				</div>
			</div>

			<div className="slider-container">
				<div className="slider" ref={sliderRef}>
					{products.map((p) => (
						<a key={p._id} href={`/products/${p._id}`}>
							<img src={p.image} alt={p.name} />
						</a>
					))}
				</div>
			</div>

			<div className="statusTab">
				<div className="tabs">
					<button className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
						<i className="fas fa-box" /> Orders
					</button>
					<button className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => setActiveTab('requests')}>
						<i className="fas fa-palette" /> Custom Requests
					</button>
					<button className={`tab-btn ${activeTab === 'workshops' ? 'active' : ''}`} onClick={() => setActiveTab('workshops')}>
						<i className="fas fa-chalkboard-teacher" /> Workshops
					</button>
				</div>

				<section className={`tab-content ${activeTab === 'orders' ? 'active' : ''}`} id="orders">
					<h2>
						<i className="fas fa-shopping-bag" /> Your Orders
					</h2>
					<div className="cards-container">
						{orders.length > 0 ? (
							orders.map((order, index) => (
								<OrderCard key={order._id} order={order} index={index} onNavigate={(id?: string) => { if (id) window.location.href = `/customer/orders/${id}`; }} />
							))
						) : (
							<div className="empty-state">
								<i className="fas fa-shopping-basket empty-icon" />
								<p>You don't have any orders yet.</p>
								<a href="/customer/store">
									<button className="btn primary">
										<i className="fas fa-store" /> Shop Now
									</button>
								</a>
							</div>
						)}
					</div>
				</section>

				<section className={`tab-content ${activeTab === 'requests' ? 'active' : ''}`} id="requests">
					<h2>
						<i className="fas fa-palette" /> Your Custom Requests
					</h2>
					<div className="cards-container">
						{requests.length > 0 ? (
							requests.map((request) => (
								<article key={request._id || Math.random()} className="card">
									<div className="card-header">
										<h3>
											<i className="fas fa-paint-brush" /> {request.title}
										</h3>
										<span className={`status ${request.isAccepted ? 'accepted' : 'pending'}`}>
											{request.isAccepted ? 'Accepted' : 'Pending'}
										</span>
									</div>
									{request.image && (
										<div className="card-image">
											<img src={request.image} alt={request.title} />
										</div>
									)}
									<div className="card-body">
										<p><strong><i className="fas fa-tag" /> Type:</strong> {request.type}</p>
										<p><strong><i className="fas fa-align-left" /> Description:</strong> {request.description}</p>
										<p><strong><i className="fas fa-rupee-sign" /> Budget:</strong> {request.budget}</p>
										<p><strong><i className="fas fa-calendar-check" /> Required By:</strong> {request.requiredBy}</p>
									</div>
									<div className="card-footer" />
								</article>
							))
						) : (
							<div className="empty-state">
								<i className="fas fa-paint-brush empty-icon" />
								<p>You don't have any custom requests yet.</p>
								<a href="/customer/customorder">
									<button className="btn primary"><i className="fas fa-plus-circle" /> Create Request</button>
								</a>
							</div>
						)}
					</div>
				</section>

				<section className={`tab-content ${activeTab === 'workshops' ? 'active' : ''}`} id="workshops">
					<h2>
						<i className="fas fa-chalkboard-teacher" /> Your Workshops
					</h2>
					<div className="cards-container">
						{workshops.length > 0 ? (
							workshops.map((workshop) => (
								<article key={workshop._id || Math.random()} className="card">
									<div className="card-header">
										<h3><i className="fas fa-graduation-cap" /> {workshop.workshopTitle}</h3>
										<span className={`status ${workshop.status === 1 ? 'accepted' : 'pending'}`}>
											{workshop.status === 1 ? 'Accepted' : 'Pending'}
										</span>
									</div>
									<div className="card-body">
										<p><strong><i className="fas fa-align-left" /> Description:</strong> {workshop.workshopDescription}</p>
										<p><strong><i className="fas fa-calendar-day" /> Date:</strong> {workshop.date}</p>
										<p><strong><i className="fas fa-clock" /> Time:</strong> {workshop.time}</p>
										{workshop.status === 1 && workshop.acceptedAt && (
											<p><strong><i className="fas fa-check-circle" /> Accepted On:</strong> {workshop.acceptedAt}</p>
										)}
									</div>
									<div className="card-footer" />
								</article>
							))
						) : (
							<div className="empty-state">
								<i className="fas fa-chalkboard empty-icon" />
								<p>You don't have any workshops yet.</p>
								<a href="/customer/workshop"><button className="btn primary"><i className="fas fa-plus-circle" /> Book Workshop</button></a>
							</div>
						)}
					</div>
				</section>
			</div>
		</main>
	);
};

export default Home;

