import React, { useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

// Interface for the Product data
interface Product {
  _id: string;
  name: string;
  category: string;
  material: string;
  image: string;
  oldPrice: number;
  newPrice: number;
  quantity: number;
  description: string;
}

// Interface for the component's props
interface StoreCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
}

const StoreCard: React.FC<StoreCardProps> = ({ product, onAddToCart }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  // Calculate discount percentage
  const discountPercentage =
    product.oldPrice > product.newPrice
      ? Math.round(
          ((product.oldPrice - product.newPrice) / product.oldPrice) * 100
        )
      : 0;

  const handleAddToCart = () => {
    if (product.quantity > 0) {
      setIsAnimating(true);
      onAddToCart(product._id);

      // Reset animation after it completes
      setTimeout(() => {
        setIsAnimating(false);
      }, 1200); // Match animation duration
    }
  };

  return (
    <div className="relative p-0 text-center w-80 h-[450px] bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      {/* Product Image and Discount Badge */}
      <Link
        to={`/customer/product/${product._id}`}
        className="relative block overflow-hidden"
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-55 object-cover transition-transform duration-700 hover:scale-105"
        />
        {discountPercentage > 0 && (
          <div className="absolute top-2.5 right-2.5 bg-red-500 text-white px-2 py-1 rounded-full font-bold text-sm shadow-lg">
            -{discountPercentage}%
          </div>
        )}
      </Link>

      {/* Product Details Area */}
      <div className="flex flex-col justify-between items-start p-4 h-[calc(100%-220px)] text-left relative">
        <Link
          to={`/customer/product/${product._id}`}
          className="no-underline text-gray-800 self-stretch hover:text-amber-900"
        >
          <h3 className="text-lg font-semibold text-gray-800 leading-6 mb-2 overflow-hidden whitespace-nowrap text-ellipsis">
            {product.name}
          </h3>
        </Link>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-2 text-sm">
          <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-medium">
            {product.category}
          </span>
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
            {product.material}
          </span>
        </div>

        {/* Rating */}
        <div className="text-amber-500 text-sm mb-2">★★★★☆ 4.2</div>

        {/* Price */}
        <div className="flex items-center gap-2 my-2">
          <span className="text-lg font-bold text-green-700">
            ₹{product.newPrice}
          </span>
          {product.oldPrice > product.newPrice && (
            <span className="text-sm text-gray-500 line-through">
              ₹{product.oldPrice}
            </span>
          )}
        </div>

        {/* Add to Cart Button (with Styled Wrapper) */}
        <StyledWrapper>
          <button
            className={`cartBtn ${isAnimating ? "animating" : ""}`}
            onClick={handleAddToCart}
            disabled={product.quantity === 0}
          >
            {/* --- THIS IS THE UPDATED PART --- */}
            <span className="cart-wrapper">
              <svg
                className="cart"
                fill="white"
                viewBox="0 0 576 512"
                height="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h411c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H170.7l5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5H488c13.3 0 24 10.7 24 24s-10.7 24-24 24H199.7c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5H24C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z" />
              </svg>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="1em"
                viewBox="0 0 640 512"
                className="product"
              >
                <path d="M211.8 0c7.8 0 14.3 5.7 16.7 13.2C240.8 51.9 277.1 80 320 80s79.2-28.1 91.5-66.8C413.9 5.7 420.4 0 428.2 0h12.6c22.5 0 44.2 7.9 61.5 22.3L628.5 127.4c6.6 5.5 10.7 13.5 11.4 22.1s-2.1 17.1-7.8 23.6l-56 64c-11.4 13.1-31.2 14.6-44.6 3.5L480 197.7V448c0 35.3-28.7 64-64 64H224c-35.3 0-64-28.7-64-64V197.7l-51.5 42.9c-13.3 11.1-33.1 9.6-44.6-3.5l-56-64c-5.7-6.5-8.5-15-7.8-23.6s4.8-16.6 11.4-22.1L137.7 22.3C155 7.9 176.7 0 199.2 0h12.6z" />
              </svg>
            </span>
            {/* --- END OF UPDATE --- */}

            {product.quantity === 0 ? "Out of Stock" : "Add to Cart"}
          </button>
        </StyledWrapper>
      </div>
    </div>
  );
};

export default StoreCard;

// Styled-components block with all fixes
const StyledWrapper = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;

  .cartBtn {
    width: 100%;
    height: 50px;
    border: none;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    color: white;
    font-weight: bold;
    font-size: 16px;
    position: relative;
    background-color: #92400e; /* amber-800 */
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease-in-out;
    cursor: pointer;
    overflow: hidden;
  }

  .cartBtn:hover:not(:disabled) {
    background-color: #78350f; /* amber-900 */
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }

  .cartBtn:active:not(:disabled) {
    transform: translateY(0);
  }

  .cartBtn:disabled {
    background-color: #9ca3af; /* gray-400 */
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  /* --- MODIFIED CSS SECTION --- */

  .cart-wrapper {
    position: relative;
  }

  .cart {
    z-index: 2;
  }

  .product {
    position: absolute;
    width: 12px;
    height: 12px;
    border-radius: 3px;
    content: "";

    /* Positioned relative to the cart icon */
    top: 2px;
    left: 3px;

    opacity: 0;
    z-index: 2;
    fill: rgb(211, 211, 211);
  }

  .cartBtn.animating:not(:disabled) .product {
    animation: slide-in-top 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  }

  @keyframes slide-in-top {
    0% {
      transform: translateY(-30px);
      opacity: 1;
    }

    100% {
      transform: translateY(0) rotate(-90deg);
      opacity: 1;
    }
  }
`;
