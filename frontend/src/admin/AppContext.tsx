import React, { useReducer, createContext, useContext } from 'react';

// Types
export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  name?: string;
  mobile_no?: string;
  pass?: string;
  createdAt?: string;
}

export interface Product {
  id: string;
  image: string;
  name: string;
  uploadedBy: string;
  quantity: number;
  oldPrice: number;
  newPrice: number;
  category: string;
  status: 'approved' | 'pending' | 'disapproved';
  description?: string;
  visible?: boolean;
  createdAt?: string;
}

export interface Order {
  id: string;
  customer: string;
  date: string;
  items: number;
  total: number;
  status: string;
  raw?: any;
}

export interface Feedback {
  id: string;
  fullName: string;
  message: string;
  createdAt?: string;
}

export interface AppState {
  users: User[];
  products: Product[];
  orders: Order[];
  feedback: Feedback[];
}

export type AppAction =
  | { type: 'ADD_USER'; payload: User }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'APPROVE_PRODUCT'; payload: string }
  | { type: 'DISAPPROVE_PRODUCT'; payload: string }
  | { type: 'DELETE_ORDER'; payload: string }
  | { type: 'SET_DATA'; payload: AppState };

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const initialState: AppState = {
  users: [],
  products: [],
  orders: [],
  feedback: [],
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_USER':
      return { ...state, users: [...state.users, { ...action.payload, id: crypto.randomUUID() }] };
    case 'DELETE_USER':
      return { ...state, users: state.users.filter((u) => u.id !== action.payload) };
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, { ...action.payload, id: crypto.randomUUID(), status: 'pending' }] };
    case 'DELETE_PRODUCT':
      return { ...state, products: state.products.filter((p) => p.id !== action.payload) };
    case 'APPROVE_PRODUCT':
      return { ...state, products: state.products.map(p => p.id === action.payload ? { ...p, status: 'approved' } : p) };
    case 'DISAPPROVE_PRODUCT':
      return { ...state, products: state.products.map(p => p.id === action.payload ? { ...p, status: 'disapproved' } : p) };
    case 'DELETE_ORDER':
      return { ...state, orders: state.orders.filter((o) => o.id !== action.payload) };
    case 'SET_DATA':
      return {
        ...state,
        users: Array.isArray(action.payload.users) ? action.payload.users : [],
        products: Array.isArray(action.payload.products) ? action.payload.products : [],
        orders: Array.isArray(action.payload.orders) ? action.payload.orders : [],
        feedback: Array.isArray(action.payload.feedback) ? action.payload.feedback : [],
      };
    default:
      return state;
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = (): AppContextType => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  React.useEffect(() => {
    const fetchInitial = async () => {
      try {
        const API_BASE = ((import.meta as any).env?.VITE_API_BASE as string) || `${location.protocol}//${location.hostname}:3000`;
        const [uRes, pRes, oRes, fRes] = await Promise.all([
          fetch(`${API_BASE}/api/users`, { credentials: 'include' }),
          fetch(`${API_BASE}/api/products`, { credentials: 'include' }),
          fetch(`${API_BASE}/api/orders`, { credentials: 'include' }),
          fetch(`${API_BASE}/api/feedback`, { credentials: 'include' }),
        ]);

        const [uJson, pJson, oJson, fJson] = await Promise.all([
          uRes.json().catch(() => []),
          pRes.json().catch(() => []),
          oRes.json().catch(() => []),
          fRes.json().catch(() => []),
        ]);

        const normalizeUsers = (Array.isArray(uJson) ? uJson : []).map((u: any) => ({
          id: (u && (u.id || u._id)) ? String(u.id || u._id) : crypto.randomUUID(),
          username: u?.username ?? u?.name ?? '',
          name: u?.name ?? u?.username ?? '',
          email: u?.email ?? '',
          role: u?.role ?? 'customer',
          mobile_no: u?.mobile_no ?? u?.phone ?? '',
          createdAt: u?.createdAt ?? u?.created_at ?? '',
        }));

        const normalizeProducts = (Array.isArray(pJson) ? pJson : []).map((p: any) => ({
          id: (p && (p.id || p._id)) ? String(p.id || p._id) : crypto.randomUUID(),
          image: p?.image ?? p?.images?.[0] ?? p?.thumbnail ?? '',
          name: p?.name ?? p?.title ?? 'Untitled',
          uploadedBy: p?.uploadedBy ?? (p?.userId ? String(p.userId) : '') ,
          quantity: Number(p?.quantity ?? p?.number ?? p?.stock ?? 0),
          oldPrice: Number(p?.oldPrice ?? p?.price ?? p?.newPrice ?? 0),
          newPrice: Number(p?.newPrice ?? p?.price ?? p?.oldPrice ?? 0),
          category: p?.category ?? '',
          status: p?.status ?? 'approved',
          description: p?.description ?? p?.desc ?? '',
          createdAt: p?.createdAt ?? p?.created_at ?? '',
          isValid: typeof p?.isValid === 'boolean' ? p.isValid : true,
        }));

        const normalizeOrders = (Array.isArray(oJson) ? oJson : []).map((o: any) => {
          const productsArr = Array.isArray(o?.products) ? o.products : [];
          const itemsCount = productsArr.reduce((sum: number, it: any) => sum + (Number(it?.quantity ?? it?.qty ?? 0) || 0), 0) || (o?.items ?? 0);
          const customerName = typeof o?.userId === 'object' ? (o.userId.name ?? o.userId.email ?? '') : (o?.customer ?? o?.customerName ?? (o?.userId ? String(o.userId) : ''));
          return {
            id: (o && (o.id || o._id)) ? String(o.id || o._id) : crypto.randomUUID(),
            customer: customerName,
            date: o?.purchasedAt ?? o?.purchased_at ?? o?.createdAt ?? o?.created_at ?? new Date().toISOString(),
            items: itemsCount,
            total: Number(o?.money ?? o?.total ?? o?.amount ?? 0),
            status: o?.status ?? 'pending',
            raw: o,
          };
        });

        const normalizeFeedback = (Array.isArray(fJson) ? fJson : []).map((f: any) => ({
          id: (f && (f.id || f._id)) ? String(f.id || f._id) : crypto.randomUUID(),
          fullName: typeof f?.userId === 'object' ? (f.userId.name ?? '') : (f?.fullName ?? f?.name ?? ''),
          message: f?.description ?? f?.message ?? f?.subject ?? '',
          createdAt: f?.createdAt ?? f?.created_at ?? '',
        }));

        dispatch({ type: 'SET_DATA', payload: { users: normalizeUsers, products: normalizeProducts, orders: normalizeOrders, feedback: normalizeFeedback } });
      } catch (e) {
        console.error('Failed to fetch initial app data', e);
      }
    };

    void fetchInitial();
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
