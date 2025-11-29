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
import Loader from "../components/ui/Loader";

// Lazy load big pages
const DashboardPage = lazy(() => import("./DashboardPage"));

export default function AdminApp(): React.ReactElement {
  const [modalState, setModalState] = React.useState<{
    type: string | null;
    isOpen: boolean;
    data: any;
  }>({ type: null, isOpen: false, data: null });
  const { dispatch } = useAppContext();

  const closeModal = (): void =>
    setModalState({ type: null, isOpen: false, data: null });

  const handleConfirmDelete = (): void => {
    const { type, data } = modalState;
    if (type === "delete-user" && data?.id)
      dispatch({ type: "DELETE_USER", payload: data.id });
    if (type === "delete-product" && data?.id)
      dispatch({ type: "DELETE_PRODUCT", payload: data.id });
    if (type === "delete-order" && data?.id)
      dispatch({ type: "DELETE_ORDER", payload: data.id });
    closeModal();
  };

  const getItemType = (): string => {
    if (modalState.type?.includes("user")) return "user";
    if (modalState.type?.includes("product")) return "product";
    if (modalState.type?.includes("order")) return "order";
    return "item";
  };

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-amber-50 via-orange-50 to-amber-100 font-serif">
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
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/moderation" element={<ContentModerationPage />} />
              <Route path="/support" element={<SupportTicketPage />} />
            </Routes>
          </Suspense>
        </div>
      </main>

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
