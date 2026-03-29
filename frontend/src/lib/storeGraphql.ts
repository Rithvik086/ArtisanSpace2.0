import { graphqlRequest } from "./graphqlClient";

export interface StoreProduct {
  _id: string;
  name: string;
  category: string;
  material: string;
  image: string;
  oldPrice: number;
  newPrice: number;
  quantity: number;
  description: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ProductConnection {
  products: StoreProduct[];
  pagination: PaginationInfo;
}

export interface StoreProductFilterInput {
  page?: number;
  limit?: number;
  categories?: string[];
  materials?: string[];
  search?: string;
}

export interface CartItem {
  productId: {
    _id: string;
    name: string;
    newPrice: number;
    quantity: number;
    image: string;
  };
  quantity: number;
}

export interface CartSummary {
  cart: CartItem[];
  amount: number;
  totalamount: number;
  itemCount: number;
}

export type CartUpdateAction = "add" | "del" | "rem" | "none";

interface MutationResult {
  success: boolean;
  message: string;
}

const PRODUCT_FIELDS = `
  _id
  name
  category
  material
  image
  oldPrice
  newPrice
  quantity
  description
`;

export const getStoreProducts = async (
  filter: StoreProductFilterInput,
): Promise<ProductConnection> => {
  const query = `
    query StoreProducts($filter: ProductFilterInput) {
      storeProducts(filter: $filter) {
        products {
          ${PRODUCT_FIELDS}
        }
        pagination {
          currentPage
          totalPages
          totalProducts
          hasNextPage
          hasPrevPage
        }
      }
    }
  `;

  const data = await graphqlRequest<{ storeProducts: ProductConnection }>(query, {
    filter,
  });

  return data.storeProducts;
};

export const addProductToCart = async (
  productId: string,
  quantity = 1,
): Promise<MutationResult> => {
  const mutation = `
    mutation AddToCart($productId: ID!, $quantity: Int) {
      addToCart(productId: $productId, quantity: $quantity) {
        success
        message
      }
    }
  `;

  const data = await graphqlRequest<{ addToCart: MutationResult }>(mutation, {
    productId,
    quantity,
  });

  return data.addToCart;
};

export const getMyCart = async (): Promise<CartSummary> => {
  const query = `
    query MyCart {
      myCart {
        cart {
          productId {
            _id
            name
            newPrice
            quantity
            image
          }
          quantity
        }
        amount
        totalamount
        itemCount
      }
    }
  `;

  const data = await graphqlRequest<{ myCart: CartSummary }>(query);
  return data.myCart;
};

export const updateCartItem = async (
  productId: string,
  action: CartUpdateAction,
  amount?: number,
): Promise<MutationResult> => {
  const mutation = `
    mutation UpdateCart($input: UpdateCartInput!) {
      updateCart(input: $input) {
        success
        message
      }
    }
  `;

  const data = await graphqlRequest<{ updateCart: MutationResult }>(mutation, {
    input: {
      productId,
      action,
      amount,
    },
  });

  return data.updateCart;
};
