import React, { useState, useEffect, useMemo } from "react";
import type { Dispatch, SetStateAction } from "react";
import GraphCard from "../admin/components/GraphCard";
import {
  DollarSign,
  BarChart2,
  PackageCheck,
  Users2,
  Users,
  Package,
  ShoppingCart,
} from "lucide-react";
import UsersTab from "../admin/tabs/UsersTab";
import ProductsTab from "../admin/tabs/ProductsTab";
import OrdersTab from "../admin/tabs/OrdersTab";
import AddProduct from "./AddProduct";

import { useAppContext } from "../admin/AppContext";
import api from "../lib/axios";

const ManagerDashboard: React.FC<{
  setModalState: Dispatch<SetStateAction<any>>;
}> = ({ setModalState }) => {
  const [activeTab, setActiveTab] = useState<string>("Users");
  const { state } = useAppContext();
  const users = useMemo(
    () => state.users.filter((user) => user.role.toLowerCase() !== "admin"),
    [state.users]
  );
  const products = state.products;
  const orders = state.orders;

  const [sales, setSales] = useState<Array<{ month: string; sales: number }>>(
    []
  );
  const [ordersChart, setOrdersChart] = useState<any[]>([]);
  const [productsChart, setProductsChart] = useState<any[]>([]);
  const [usersChart, setUsersChart] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [showTabView, setShowTabView] = useState<boolean>(false);

  const MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  function buildMonthlyCounts(items: any[], dateKey: string, outKey: string) {
    const map = new Map<string, number>();
    items.forEach((it) => {
      try {
        const d = new Date(it[dateKey]);
        if (isNaN(d.getTime())) return;
        const m = d.toLocaleString("en-US", { month: "short" });
        map.set(m, (map.get(m) || 0) + 1);
      } catch (e) {}
    });
    return MONTHS.map((m) => ({ date: m, [outKey]: map.get(m) || 0 }));
  }

  async function fetchSales() {
    setLoadingData(true);
    try {
      const res = await api.get("/manager/sales");
      setSales(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("[ManagerDashboard] Failed fetching sales data", e);
    } finally {
      setLoadingData(false);
    }
  }

  useEffect(() => {
    void fetchSales();
  }, []);

  useEffect(() => {
    // orders normalized in AppContext use `date` field
    setOrdersChart(buildMonthlyCounts(orders || [], "date", "orders"));
    setProductsChart(
      buildMonthlyCounts(
        products?.filter((p) => p.status === "approved") || [],
        "createdAt",
        "products"
      )
    );
    setUsersChart(buildMonthlyCounts(users || [], "createdAt", "users"));
  }, [orders, products, users]);

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-3xl font-bold text-amber-900 mb-4 font-baloo">
          Dashboard Overview
        </h2>
        {!showTabView && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <button
              onClick={() => {
                setActiveTab("Users");
                setShowTabView(true);
              }}
              className="p-4 flex items-center gap-4 bg-white rounded-md shadow-lg hover:shadow-xl border border-gray-100 transition-shadow duration-200"
            >
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-amber-100 text-amber-700">
                <Users size={20} />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-gray-600">Users</div>
                <div className="text-2xl font-bold text-amber-800">
                  {loadingData ? "—" : users.length}
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                setActiveTab("Products");
                setShowTabView(true);
              }}
              className="p-4 flex items-center gap-4 bg-white rounded-md shadow-lg hover:shadow-xl border border-gray-100 transition-shadow duration-200"
            >
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-stone-100 text-stone-700">
                <Package size={20} />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-gray-600">
                  Products
                </div>
                <div className="text-2xl font-bold text-stone-700">
                  {loadingData
                    ? "—"
                    : products.filter((p) => p.status === "approved").length}
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                setActiveTab("Orders");
                setShowTabView(true);
              }}
              className="p-4 flex items-center gap-4 bg-white rounded-md shadow-lg hover:shadow-xl border border-gray-100 transition-shadow duration-200"
            >
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-orange-100 text-orange-700">
                <ShoppingCart size={20} />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-gray-600">Orders</div>
                <div className="text-2xl font-bold text-orange-700">
                  {loadingData ? "—" : orders.length}
                </div>
              </div>
            </button>
          </div>
        )}

        {showTabView && activeTab === "Users" ? (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Users</h3>
              <button
                className="text-sm text-blue-600"
                onClick={() => setShowTabView(false)}
              >
                Back to overview
              </button>
            </div>
            <div className="bg-white rounded-md shadow-sm p-4">
              <UsersTab
                setModalState={setModalState}
                excludeRoles={["admin"]}
              />
            </div>
          </div>
        ) : showTabView && activeTab === "Products" ? (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Products</h3>
              <button
                className="text-sm text-blue-600"
                onClick={() => setShowTabView(false)}
              >
                Back to overview
              </button>
            </div>
            <div className="bg-white rounded-md shadow-sm p-4">
              <ProductsTab
                setModalState={setModalState}
                excludeRoles={["admin"]}
              />
            </div>
          </div>
        ) : showTabView && activeTab === "Orders" ? (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Orders</h3>
              <button
                className="text-sm text-blue-600"
                onClick={() => setShowTabView(false)}
              >
                Back to overview
              </button>
            </div>
            <div className="bg-white rounded-md shadow-sm p-4">
              <OrdersTab setModalState={setModalState} />
            </div>
          </div>
        ) : showTabView && activeTab === "Add" ? (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Add Listing</h3>
              <button
                className="text-sm text-blue-600"
                onClick={() => setShowTabView(false)}
              >
                Back to overview
              </button>
            </div>
            <div className="bg-white rounded-md shadow-sm p-4">
              <AddProduct />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GraphCard
              title="Total Sales"
              data={sales}
              dataKey="sales"
              xKey="month"
              icon={DollarSign}
              unit="₹"
            />
            <GraphCard
              title="Monthly Orders"
              data={ordersChart}
              dataKey="orders"
              xKey="date"
              icon={BarChart2}
            />
            <GraphCard
              title="Products"
              data={productsChart}
              dataKey="products"
              xKey="date"
              icon={PackageCheck}
            />
            <GraphCard
              title="Total Users"
              data={usersChart}
              dataKey="users"
              xKey="date"
              icon={Users2}
            />
          </div>
        )}
      </section>
    </div>
  );
};

export default ManagerDashboard;
