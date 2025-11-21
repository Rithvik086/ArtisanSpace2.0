// CustomerRoutes.jsx
import Store from "../src/pages/customer/Store";
import CustomerHome from "../src/pages/customer/CustomerHome";

export const customerRoutes = [
  {
    index: true,
    element: <CustomerHome />,
  },
  {
    path: "store",
    element: <Store />,
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
