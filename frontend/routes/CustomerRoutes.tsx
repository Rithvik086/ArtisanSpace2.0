// CustomerRoutes.jsx
import { lazy } from "react";
import CustomerHome from "../src/pages/customer/CustomerHome";

const Store = lazy(() => import("../src/pages/customer/Store"));
const Cart = lazy(() => import("../src/pages/customer/Cart"));
const Checkout = lazy(() => import("../src/pages/customer/Checkout"));
const ProductDetails = lazy(
  () => import("../src/pages/customer/ProductDetails")
);

export const CustomerRoutes = [
  {
    index: true,
    element: <CustomerHome />,
  },
  {
    path: "store",
    element: <Store />,
  },
  {
    path: "product/:id",
    element: <ProductDetails />,
  },
  {
    path: "cart",
    element: <Cart />,
  },
  {
    path: "checkout",
    element: <Checkout />,
  },
  {
    path: "workshop",
    element: <div>Workshop Page - Coming Soon</div>,
  },
  {
    path: "custom-order",
    element: <div>Custom Order Page - Coming Soon</div>,
  },
];
