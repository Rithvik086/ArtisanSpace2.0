import React, { useState, useMemo, useEffect } from "react";
import { PlusCircle, Trash2 } from "lucide-react";
import { useAppContext } from "../AppContext";

interface ModalState {
  type: string;
  isOpen: boolean;
  data: { id?: string } | null;
}

export default function ProductsTab({
  setModalState,
  excludeRoles = [],
}: {
  setModalState: React.Dispatch<React.SetStateAction<ModalState>>;
  excludeRoles?: string[];
}) {
  const { state } = useAppContext();
  const products = state.products.filter(
    (product) =>
      product.status === "approved" &&
      !excludeRoles.includes(product.uploadedBy?.toLowerCase() || "")
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 5;

  const totalPages = Math.max(
    1,
    Math.ceil((products?.length || 0) / ITEMS_PER_PAGE)
  );

  useEffect(() => {
    // keep current page within bounds when products change
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, products.length, totalPages]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return (products || []).slice(start, start + ITEMS_PER_PAGE);
  }, [products, currentPage]);

  const openAddProductModal = (): void =>
    setModalState({ type: "add-product", isOpen: true, data: null });
  const openDeleteModal = (id: string): void =>
    setModalState({ type: "delete-product", isOpen: true, data: { id } });

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 p-6 border-b">
        <h3 className="text-xl font-semibold text-gray-900">Manage Products</h3>
        <div className="flex items-center">
          <button
            onClick={openAddProductModal}
            className="flex items-center gap-2 px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            <PlusCircle size={16} />
            <span>Add Product</span>
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full table-fixed divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-16 px-6 py-3 text-left text-sm font-medium text-gray-500">
                Image
              </th>
              <th className="w-48 px-6 py-3 text-left text-sm font-medium text-gray-500">
                Name
              </th>
              <th className="w-40 px-6 py-3 text-left text-sm font-medium text-gray-500">
                UploadedBy
              </th>
              <th className="w-24 px-6 py-3 text-left text-sm font-medium text-gray-500">
                Quantity
              </th>
              <th className="w-36 px-6 py-3 text-left text-sm font-medium text-gray-500">
                Price
              </th>
              <th className="w-32 px-6 py-3 text-left text-sm font-medium text-gray-500">
                Type
              </th>
              <th className="w-28 px-6 py-3 text-left text-sm font-medium text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  No products found.
                </td>
              </tr>
            ) : (
              paginated.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 w-16">
                    <img
                      className="h-10 w-10 rounded-md object-cover"
                      src={product.image}
                      alt={product.name}
                    />
                  </td>
                  <td className="px-6 py-4 w-48 text-sm font-medium text-gray-900 truncate">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 w-40 text-sm text-gray-500 truncate">
                    {product.uploadedBy}
                  </td>
                  <td className="px-6 py-4 w-24 text-sm text-gray-500">
                    {product.quantity}
                  </td>
                  <td className="px-6 py-4 w-36 text-sm text-gray-500">
                    <s className="text-gray-400">
                      ₹{product.oldPrice.toFixed(2)}
                    </s>
                    <br />
                    <span className="text-gray-900 font-medium">
                      ₹{product.newPrice.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 w-32 text-sm text-gray-500 truncate">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 w-28 text-sm font-medium">
                    <button
                      onClick={() => openDeleteModal(product.id)}
                      className="text-red-600 flex items-center gap-1"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-between px-6 py-4 border-t bg-white">
        <div className="text-sm text-gray-600">
          Showing{" "}
          {(products?.length || 0) === 0
            ? 0
            : (currentPage - 1) * ITEMS_PER_PAGE + 1}{" "}
          - {Math.min(currentPage * ITEMS_PER_PAGE, products?.length || 0)} of{" "}
          {products?.length || 0}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-md ${
              currentPage === 1
                ? "bg-gray-100 text-gray-400"
                : "bg-white border"
            }`}
          >
            Prev
          </button>
          {/* page numbers */}
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded-md ${
                currentPage === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-white border text-gray-700"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-md ${
              currentPage === totalPages
                ? "bg-gray-100 text-gray-400"
                : "bg-white border"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
