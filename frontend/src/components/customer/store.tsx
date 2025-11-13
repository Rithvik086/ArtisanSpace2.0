import React, { useEffect, useMemo, useState, useRef } from 'react';
import '../../assets/customer/store.css';
import ProductCard from './ProductCard';

type Product = {
	_id: string;
	name: string;
	image?: string;
	category?: string;
	material?: string;
	oldPrice?: number;
	newPrice?: number;
	description?: string;
};

const isValidSearch = (q: string) => /^[a-zA-Z0-9\s\-]{1,50}$/.test(q);

const Store: React.FC = () => {
	const [userId, setUserId] = useState<string | null>(null);
	const [products, setProducts] = useState<Product[]>([]);
	const [allProducts, setAllProducts] = useState<Product[]>([]); // for client-side search
	const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [totalPages, setTotalPages] = useState<number>(1);
	const [searchQuery, setSearchQuery] = useState('');
	const [searchResults, setSearchResults] = useState<Product[]>([]);
	const [showValidationMessage, setShowValidationMessage] = useState(false);
	const [notifications, setNotifications] = useState<{ id: string; message: string; type: 'success' | 'error' }[]>([]);
	const searchTimeoutRef = useRef<number | null>(null);

	// Utility: show notification
	const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
		const id = String(Date.now()) + Math.random();
		setNotifications((s) => [...s, { id, message, type }]);
		setTimeout(() => setNotifications((s) => s.filter(n => n.id !== id)), 3000);
	};

	// Read initial URL params and fetch
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

			// get params
			const urlParams = new URLSearchParams(window.location.search);
			const categories = urlParams.getAll('category');
			const page = parseInt(urlParams.get('page') || '1', 10);
			setSelectedCategories(categories);
			setCurrentPage(page);

			await loadProducts(categories, page);
			// preload all products for search
			try {
				const res = await fetch('/customer/api/products?limit=all');
				if (res.ok) {
					const data = await res.json();
					setAllProducts(data.products || []);
				}
			} catch (err) {
				console.error('Error preloading products for search', err);
			}
		})();
	}, []);

	async function loadProducts(category: string[], page: number) {
		try {
			const params = new URLSearchParams();
			category.forEach(c => params.append('category', c));
			params.set('page', String(page));
			params.set('limit', '12');

			const res = await fetch(`/customer/api/products?${params.toString()}`);
			if (!res.ok) throw new Error('Failed to load products');
			const data = await res.json();
			setProducts(data.products || []);
			setCurrentPage(data.currentPage || page);
			setTotalPages(data.totalPages || 1);

			// update url
			const newUrl = new URL(window.location.href);
			newUrl.searchParams.delete('category');
			category.forEach(c => newUrl.searchParams.append('category', c));
			newUrl.searchParams.set('page', String(page));
			window.history.replaceState(null, '', newUrl.toString());
		} catch (err) {
			console.error(err);
			showNotification('Error loading products', 'error');
		}
	}

	function toggleCategory(value: string) {
		setSelectedCategories(prev => {
			const next = prev.includes(value) ? prev.filter(x => x !== value) : [...prev, value];
			// load products after change (debounce)
			setTimeout(() => loadProducts(next, 1), 300);
			return next;
		});
	}

	function changePage(page: number) {
		loadProducts(selectedCategories, page);
	}

	async function updateCart(userIdParam: string | null, productId: string) {
		try {
			const res = await fetch(`/customer/store?userId=${userIdParam || ''}&productId=${productId}`, { method: 'POST' });
			const data = await res.json();
			if (data.success) showNotification('Product Added to cart!', 'success');
			else showNotification(data.message || 'Failed to add. Try again', 'error');
		} catch (err) {
			console.error('Error updating cart', err);
			showNotification('Error adding to cart', 'error');
		}
	}

	// search handling (client-side simple search)
	useEffect(() => {
		if (!searchQuery) {
			setSearchResults([]);
			setShowValidationMessage(false);
			return;
		}

		if (!isValidSearch(searchQuery)) {
			setShowValidationMessage(true);
			setSearchResults([]);
			return;
		}

		setShowValidationMessage(false);
		if (searchTimeoutRef.current) window.clearTimeout(searchTimeoutRef.current);
		// debounce
		searchTimeoutRef.current = window.setTimeout(() => {
			const q = searchQuery.trim().toLowerCase();
			if (!q) return setSearchResults([]);
			const results = allProducts.filter(p => {
				return (
					(p.name || '').toLowerCase().includes(q) ||
					(p.description || '').toLowerCase().includes(q) ||
					(p.category || '').toLowerCase().includes(q)
				);
			}).slice(0, 10);
			setSearchResults(results);
		}, 250) as unknown as number;

		return () => { if (searchTimeoutRef.current) window.clearTimeout(searchTimeoutRef.current); };
	}, [searchQuery, allProducts]);

	const productList = useMemo(() => products || [], [products]);

	return (
		<div className="store-page">
			<div id="navbar-placeholder" />
			<main className="store-main">
				<aside className="left">
					<form id="filter-form">
						<h3>Filter Products</h3>
						<div className="filter-category">
							<h4>Category</h4>
							{['statue','painting','footware','pottery','toys','headware','musical instrument','other'].map(cat => (
								<label key={cat} className="category-label">
									<input
										type="checkbox"
										name="category"
										value={cat}
										checked={selectedCategories.includes(cat)}
										onChange={() => toggleCategory(cat)}
									/> {cat.charAt(0).toUpperCase() + cat.slice(1)}
								</label>
							))}
						</div>
					</form>
				</aside>

				<section className="right">
					<div className="search-bar-container">
						<input
							type="text"
							id="searchInput"
							placeholder="Search products..."
							aria-label="Search products"
							value={searchQuery}
							onChange={e => setSearchQuery(e.target.value)}
						/>
						{showValidationMessage && (
							<p className="search-validation-message">Please enter a valid search term (only letters, numbers, spaces, and hyphens allowed)</p>
						)}
						{searchResults.length > 0 && (
							<ul id="resultsList" className="search-results">
								{searchResults.map(r => (
									<li key={r._id} className="search-result-item">
										<a href={`/products/${r._id}`} className="search-result-link">
											<img src={r.image || '/images/product-placeholder.jpg'} alt={r.name} />
											<div className="search-result-info">
												<h4>{r.name}</h4>
												<p className="category">{r.category}</p>
												<p className="price">₹{r.newPrice ?? ''}</p>
											</div>
										</a>
									</li>
								))}
							</ul>
						)}
					</div>

					<div className="content">
						<ul className="product-list" id="product-list">
							{productList.map(product => (
								<li key={product._id}>
									<ProductCard product={product} userId={userId} updateCart={updateCart} />
								</li>
							))}
						</ul>

						<ul className="pagination" id="pagination">
							{currentPage > 1 && <li><button onClick={() => changePage(currentPage - 1)}>Previous</button></li>}
							{Array.from({length: totalPages}, (_, i) => i + 1).map(i => (
								<li key={i}><button className={i === currentPage ? 'active' : ''} onClick={() => changePage(i)}>{i}</button></li>
							))}
							{currentPage < totalPages && <li><button onClick={() => changePage(currentPage + 1)}>Next</button></li>}
						</ul>
					</div>
				</section>

			</main>

			<div className="notification-container">
				{notifications.map(n => (
					<div key={n.id} className={`notification ${n.type}`}>{n.message}</div>
				))}
			</div>

			<div id="footer-placeholder" />
		</div>
	);
};

export default Store;

