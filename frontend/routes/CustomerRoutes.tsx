// CustomerRoutes.jsx
import { lazy } from "react";
import CustomerHome from "../src/pages/customer/CustomerHome";

const Store = lazy(() => import("../src/pages/customer/Store"));
const Cart = lazy(() => import("../src/pages/customer/Cart"));
const Checkout = lazy(() => import("../src/pages/customer/Checkout"));
const ProductDetails = lazy(
  () => import("../src/pages/customer/ProductDetails")
);
const OrderDetails = lazy(() => import("../src/pages/customer/OrderDetails"));
const Workshops = lazy(() => import("../src/pages/customer/Workshops"));
const CustomOrderPage = lazy(
  () => import("../src/pages/customer/CustomOrderPage")
);
const SettingsPage = lazy(() => import("../src/SettingsPage"));

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
    path: "orders/:orderId",
    element: <OrderDetails />,
  },
  {
    path: "settings",
    element: <SettingsPage />,
  },
  {
    path: "workshop",
    element: <Workshops />,
  },
  {
    path: "custom-order",
    element: <CustomOrderPage />,
  },
];
