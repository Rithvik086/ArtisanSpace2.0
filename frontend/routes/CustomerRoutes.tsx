// CustomerRoutes.jsx
import { Routes, Route } from "react-router-dom";
// import CustomerHome from "../pages/customer/customerHome";

import CustomerHome from "@/pages/customer/CustomerHome";
export default function CustomerRoutes() {
  return (
    <Routes>
      <Route path="/" element={<CustomerHome />} />
      
    </Routes>
  );
}
