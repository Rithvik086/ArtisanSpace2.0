import React from "react";
import { Outlet } from "react-router-dom";
import DeliveryNavbar from "./DeliveryNavbar";
import CustomerFooter from "../components/customer/CustomerFooter";

export default function DeliveryLayout(): React.ReactElement {
  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-amber-50 via-orange-50 to-amber-100 font-baloo">
      <DeliveryNavbar />
      <main className="grow">
        <Outlet />
      </main>
      <CustomerFooter />
    </div>
  );
}
