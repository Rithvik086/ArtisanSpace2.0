// CustomerRoutes.jsx
import { lazy } from "react";
import CustomerHome from "../src/pages/customer/CustomerHome";

const Store = lazy(() => import("../src/pages/customer/Store"));
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
    element: <div>Cart Page - Coming Soon</div>,
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
