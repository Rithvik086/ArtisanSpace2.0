import React from "react";

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

const CartItem: React.FC<Props> = ({
                                       item,
                                       onIncrement,
                                       onDecrement,
                                       onQuantityChange,
                                       onRemove,
                                   }) => {
    const { productId, quantity } = item;

    return (
        <div className="w-full bg-white border border-gray-200 rounded-xl shadow-md p-5 flex flex-col md:flex-row gap-5 items-start">

            {/* Product Image */}
            <img
                src={productId.image || "/images/product-placeholder.jpg"}
                alt={productId.name}
                className="w-28 h-28 md:w-32 md:h-32 object-cover rounded-lg border"
            />

            {/* Product Details */}
            <div className="flex-1">
                <h3 className="text-xl font-semibold text-amber-900">
                    {productId.name}
                </h3>

                <p className="text-gray-600 text-sm mt-1">
                    <span className="font-medium">Category:</span>{" "}
                    {productId.category || "N/A"}
                </p>

                <p className="text-gray-600 text-sm">
                    <span className="font-medium">Material:</span>{" "}
                    {productId.material || "N/A"}
                </p>

                <p className="text-lg font-bold text-amber-900 mt-2">
                    ₹{productId.newPrice}
                </p>
            </div>

            {/* Quantity Controller */}
            <div className="flex items-center gap-3">
                <button
                    className="px-3 py-2 bg-amber-900 text-white rounded-lg hover:bg-amber-800 disabled:bg-gray-400"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDecrement(productId._id);
                    }}
                    disabled={quantity <= 1}
                >
                    -
                </button>

                <input
                    className="w-16 border border-gray-300 rounded-lg p-2 text-center focus:ring focus:ring-amber-300"
                    type="number"
                    value={quantity}
                    min={1}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                        const v = parseInt(e.target.value || "1");
                        onQuantityChange(productId._id, isNaN(v) ? 1 : v);
                    }}
                />

                <button
                    className="px-3 py-2 bg-amber-900 text-white rounded-lg hover:bg-amber-800"
                    onClick={(e) => {
                        e.stopPropagation();
                        onIncrement(productId._id);
                    }}
                >
                    +
                </button>
            </div>

            {/* Remove Button */}
            <button
                className="mt-3 md:mt-0 px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove(productId._id);
                }}
            >
                Remove
            </button>
        </div>
    );
};

export default CartItem;
