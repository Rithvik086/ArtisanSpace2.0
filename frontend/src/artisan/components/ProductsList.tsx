import { ProductTable } from '../../components/ui/ProductTable';
import { EditProductModal } from '../../components/ui/EditProductModal';
import { DeleteConfirmationModal } from '../../components/ui/DeleteConfirmationModal';
import type { Product as ProductType } from '../Dashboardpage';

interface Props {
  products: ProductType[];
  isEditOpen: boolean;
  selectedProduct: ProductType | null;
  onEditOpen: (p: ProductType) => void;
  onEditClose: () => void;
  onSave: (p: ProductType) => void;
  onDeleteOpen: (id: string) => void;
  isDeleteOpen: boolean;
  onDeleteClose: () => void;
  onDeleteConfirm: () => void;
}

export default function ProductsList({ products, isEditOpen, selectedProduct, onEditOpen, onEditClose, onSave, onDeleteOpen, isDeleteOpen, onDeleteClose, onDeleteConfirm }: Props) {
  return (
    <section className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-amber-900 font-serif">Your Creations</h2>
          <p className="text-amber-700 mt-1">Manage your handcrafted treasures</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">{products.length} Products</span>
        </div>
      </div>

      <ProductTable products={products} onEdit={onEditOpen} onDelete={onDeleteOpen} />

      {selectedProduct && (
        <EditProductModal isOpen={isEditOpen} onClose={onEditClose} product={selectedProduct} onSave={onSave} />
      )}

      <DeleteConfirmationModal isOpen={isDeleteOpen} onClose={onDeleteClose} onConfirm={onDeleteConfirm} />
    </section>
  );
}
