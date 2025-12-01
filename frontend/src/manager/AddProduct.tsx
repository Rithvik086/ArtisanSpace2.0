import React from 'react';
import { ProductForm } from '../components/forms/ProductForm';
import api from '../lib/axios';
import { useNavigate } from 'react-router-dom';

const AddProduct: React.FC = () => {
  const navigate = useNavigate();

  const handleCreate = async (formData: FormData) => {
    const res = await api.post('/products', formData);

    const p = res.data?.product ?? res.data ?? {};
    const normalized = {
      _id: String(p._id ?? p.id ?? `${Date.now()}-${Math.random()}`),
      category: p.category ?? p.type ?? '',
      image: p.image ?? (Array.isArray(p.images) ? p.images[0] : p.thumbnail) ?? '',
      name: p.name ?? p.title ?? 'Untitled',
      oldPrice: Number(p.oldPrice ?? p.price ?? 0),
      newPrice: Number(p.newPrice ?? p.price ?? 0),
      quantity: Number(p.quantity ?? p.stock ?? 0),
      status: p.status ?? 'active',
      description: p.description ?? p.desc ?? '',
    };

    try {
      window.dispatchEvent(new CustomEvent('artisan:product-created', { detail: normalized }));
    } catch (e) {}

    // Navigate back to manager dashboard after creation
    navigate('/manager/');
    return res.data;
  };

  return (
    <ProductForm onSubmit={handleCreate} submitButtonText="Create Listing" onSuccess={() => { /* handled in ProductForm */ }} />
  );
};

export default AddProduct;