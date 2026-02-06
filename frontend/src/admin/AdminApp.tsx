import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/AdminHeader";
import ContentModerationPage from "./ContentModerationPage";
import SupportTicketPage from "./SupportTicketPage";
const SettingsPage = lazy(() => import("../SettingsPage"));
import {
  AddUserModal,
  AddProductModal,
  DeleteModal,
} from "./components/ModalComponents";
import { useAppContext } from "./AppContext";
import api from "../lib/axios";
import { useToast } from "../components/ui/ToastProvider";
import Loader from "../components/ui/Loader";
import AdminFooter from "./components/AdminFooter";

// Lazy load big pages
const DashboardPage = lazy(() => import("./DashboardPage"));

export default function AdminApp(): React.ReactElement {
  type ModalData = { id?: string } | null;
  const [modalState, setModalState] = React.useState<{
    type: string | null;
    isOpen: boolean;
    data: ModalData;
  }>({ type: null, isOpen: false, data: null });
  const { dispatch } = useAppContext();

  const closeModal = (): void =>
    setModalState({ type: null, isOpen: false, data: null });

  const { showToast } = useToast();

  const handleConfirmDelete = async (): Promise<void> => {
    const { type, data } = modalState;
    try {
      if (type === "delete-user" && data?.id) {
        await api.delete(`/auth/user/${data.id}`);
        dispatch({ type: "DELETE_USER", payload: data.id });
        showToast("User deleted successfully", "success");
      }
      if (type === "delete-product" && data?.id) {
        await api.delete(`/products/${data.id}`);
        dispatch({ type: "DELETE_PRODUCT", payload: data.id });
        showToast("Product deleted successfully", "success");
      }
      if (type === "delete-order" && data?.id) {
        await api.delete(`/orders/${data.id}`);
        dispatch({ type: "DELETE_ORDER", payload: data.id });
        showToast("Order deleted successfully", "success");
      }
    } catch (error) {
      console.error("Failed to delete:", error);
      showToast("Failed to delete item. Please try again.", "error");
    }
    closeModal();
  };

  const getItemType = (): string => {
    if (modalState.type?.includes("user")) return "user";
    if (modalState.type?.includes("product")) return "product";
    if (modalState.type?.includes("order")) return "order";
    return "item";
  };

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-amber-50 via-orange-50 to-stone-100 font-baloo text-stone-800">
      <Header />
      <main className="grow p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <Suspense
            fallback={
              <div className="flex justify-center items-center h-64">
                <Loader />
              </div>
            }
          >
            <Routes>
              <Route
                path="/"
                element={<DashboardPage setModalState={setModalState} />}
              />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="moderation" element={<ContentModerationPage />} />
              <Route path="support" element={<SupportTicketPage />} />
            </Routes>
          </Suspense>
        </div>
      </main>
      <AdminFooter />

      <AddUserModal
        isOpen={modalState.type === "add-user"}
        onClose={closeModal}
      />
      <AddProductModal
        isOpen={modalState.type === "add-product"}
        onClose={closeModal}
      />
      <DeleteModal
        isOpen={modalState.type?.startsWith("delete-") ?? false}
        onClose={closeModal}
        onConfirm={handleConfirmDelete}
        itemType={getItemType()}
      />
    </div>
  );
}
