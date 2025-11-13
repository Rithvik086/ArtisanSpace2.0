import React, { useEffect, useState } from 'react';
import '../../assets/customer/workshop.css';

const titleRegex = /^[a-zA-Z0-9\s\-]{10,60}$/;
const descriptionRegex = /^[a-zA-Z0-9\s.,'"\-!?()]{10,500}$/;

const Workshop: React.FC = () => {
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [date, setDate] = useState('');
	const [time, setTime] = useState('');

	const [titleError, setTitleError] = useState<string | null>(null);
	const [descriptionError, setDescriptionError] = useState<string | null>(null);
	const [statusMessage, setStatusMessage] = useState<string | null>(null);
	const [statusSuccess, setStatusSuccess] = useState(false);
	const [dropdownOpen, setDropdownOpen] = useState(false);

	useEffect(() => {
		// close dropdown on outside click
		const handler = () => setDropdownOpen(false);
		document.addEventListener('click', handler);
		return () => document.removeEventListener('click', handler);
	}, []);

	useEffect(() => {
		// real-time validation
		if (!title) setTitleError(null);
		else setTitleError(titleRegex.test(title) ? null : 'Title must be 10-60 chars and contain only letters, numbers, spaces and hyphens');
	}, [title]);

	useEffect(() => {
		if (!description) setDescriptionError(null);
		else setDescriptionError(descriptionRegex.test(description) ? null : 'Description must be 10-500 chars and only basic punctuation allowed');
	}, [description]);

	const submit = async (e?: React.FormEvent) => {
		e?.preventDefault();
		// final validation
		if (!titleRegex.test(title) || !descriptionRegex.test(description)) {
			setStatusMessage('Please fix validation errors before submitting');
			setStatusSuccess(false);
			return;
		}

		const payload = { workshopTitle: title, workshopDesc: description, date, time };
		try {
			const res = await fetch('/customer/requestWorkshop', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});
			const result = await res.json();
			setStatusMessage('Workshop successfully booked!');
			setStatusSuccess(Boolean(result.success));
			if (result.success) {
				// reset after short delay
				setTimeout(() => {
					setTitle('');
					setDescription('');
					setDate('');
					setTime('');
					setStatusMessage(null);
					setStatusSuccess(false);
				}, 3000);
			}
		} catch (err) {
			// eslint-disable-next-line no-console
			console.error('Error registering workshop', err);
			setStatusMessage('Something went wrong. Please try again.');
			setStatusSuccess(false);
		}
	};

	return (
		<div className="workshop-page">
			<header className="ws-header">
				<div className="header-container2">
					<div className="logonav2">ArtisanSpace</div>
					<nav className="nav2">
						<ul className="nav2ul">
							<li><a href="/customer">Home</a></li>
							<li><a href="/customer/store">Store</a></li>
							<li><a href="/customer/cart">Cart</a></li>
							<li><a href="/customer/workshop">Workshops</a></li>
							<li><a href="/customer/customorder">Custom Order</a></li>
							<li className="dropdown" onClick={(e) => { e.stopPropagation(); setDropdownOpen(open => !open); }}>
								<i className="fa-solid fa-bars fa-lg" />
								<div className={`dropdown-menu ${dropdownOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
									<a href="/customer/settings" className="dropdown-item settings-btn">
										<i className="fa-solid fa-gear" />
										<p>Settings</p>
									</a>
									<a href="/logout" className="dropdown-item logout-btn">
										<i className="fa-solid fa-right-from-bracket" />
										<p>Logout</p>
									</a>
								</div>
							</li>
						</ul>
					</nav>
				</div>
			</header>

			<main>
				<div className="page-title">
					<h1>Book a Workshop</h1>
					<p>Experience the joy of creation with our skilled artisans</p>
				</div>

				<div className="form-container">
					<form id="booking-form" className="form" onSubmit={submit}>
						<div className="form-group">
							<label htmlFor="workshop-title">Workshop Title</label>
							<input id="workshop-title" name="workshopTitle" placeholder="Enter workshop title" value={title} onChange={e => setTitle(e.target.value)} required />
							{titleError && <p className="error-message">{titleError}</p>}
						</div>

						<div className="form-group">
							<label htmlFor="workshop-description">Workshop Description</label>
							<textarea id="workshop-description" name="workshopDesc" placeholder="Enter workshop details, requirements, or any special instructions" value={description} onChange={e => setDescription(e.target.value)} required />
							{descriptionError && <p className="error-message">{descriptionError}</p>}
						</div>

						<div className="form-row">
							<div className="form-group">
								<label htmlFor="date">Workshop Date</label>
								<input id="date" name="date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
							</div>

							<div className="form-group">
								<label htmlFor="time">Workshop Time</label>
								<input id="time" name="time" type="time" value={time} onChange={e => setTime(e.target.value)} required />
							</div>
						</div>

						<button type="submit">Book Now</button>
						<div id="status-message" className={statusSuccess ? 'success' : ''} style={{ display: statusMessage ? 'block' : 'none' }}>{statusMessage}</div>
					</form>
				</div>
			</main>

			<div id="footer-container" />
		</div>
	);
};

export default Workshop;

