// routes/CustomerRoutes.tsx
import { Routes, Route } from "react-router-dom";

import Home from '../src/components/customer/Home.tsx'
import Store from "../src/components/customer/store.tsx";
import Cart from "../src//components/customer/Cart";
import Workshop from "../src/components/customer/workshop";
import CustomOrder from "../src/components/customer/CustomOrder";
import Checkout from "../src/components/customer/checkout";
import OrderDetails from "../src/components/customer/orderDetails";

export default function CustomerRoutes() {
    return (
        <Routes>
            < Route path="/" element={<Home/>} />
            <Route path="/store" element={<Store />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/workshop" element={<Workshop />} />
            <Route path="/custom-order" element={<CustomOrder />} />

            {/* Other customer-related routes */}
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders/:orderId" element={<OrderDetails />} />

            {/* Future settings route */}
            {/* <Route path="/settings" element={<SettingsComponent />} /> */}
        </Routes>
    );
}
