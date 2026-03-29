import { GraphQLError, buildSchema } from "graphql";
import {
  addItem,
  changeProductAmount,
  deleteItem,
  getUserCart,
  removeCompleteItem,
} from "../services/cartServices.js";
import { getApprovedProducts } from "../services/productServices.js";
import type { GraphQLContext } from "./context.js";

const SHIPPING_RATE = 0.05;
const TAX_RATE = 0.18;

interface ProductFilterInput {
  page?: number | null;
  limit?: number | null;
  categories?: string[] | null;
  materials?: string[] | null;
  search?: string | null;
}

interface StoreProductsArgs {
  filter?: ProductFilterInput | null;
}

interface AddToCartArgs {
  productId: string;
  quantity?: number | null;
}

interface UpdateCartInput {
  productId: string;
  action: "add" | "del" | "rem" | "none";
  amount?: number | null;
}

interface UpdateCartArgs {
  input: UpdateCartInput;
}

const normalizeFilterValue = (value: string): string =>
  value.trim().toLowerCase().replace(/\s+/g, "_");

const normalizeFilterList = (values?: string[] | null): string[] | null => {
  if (!values || values.length === 0) {
    return null;
  }

  const normalized = values
    .map((value) => normalizeFilterValue(value))
    .filter((value) => value.length > 0);

  return normalized.length > 0 ? normalized : null;
};

const buildCartSummary = (cart: any[]) => {
  const amount = cart.reduce((sum, item) => {
    return sum + item.quantity * ((item.productId as any)?.newPrice ?? 0);
  }, 0);

  return {
    cart,
    amount,
    totalamount: amount + amount * SHIPPING_RATE + amount * TAX_RATE,
    itemCount: cart.length,
  };
};

const ensurePositiveInt = (value: number, field: string): void => {
  if (!Number.isInteger(value) || value <= 0) {
    throw new GraphQLError(`${field} must be a positive integer`, {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }
};

export const storeGraphQLSchema = buildSchema(`
  type PaginationInfo {
    currentPage: Int!
    totalPages: Int!
    totalProducts: Int!
    hasNextPage: Boolean!
    hasPrevPage: Boolean!
  }

  type Product {
    _id: ID!
    name: String!
    category: String!
    material: String!
    image: String!
    oldPrice: Float!
    newPrice: Float!
    quantity: Int!
    description: String!
  }

  type ProductConnection {
    products: [Product!]!
    pagination: PaginationInfo!
  }

  type CartProduct {
    _id: ID!
    name: String!
    newPrice: Float!
    quantity: Int!
    image: String!
  }

  type CartItem {
    productId: CartProduct!
    quantity: Int!
  }

  type CartSummary {
    cart: [CartItem!]!
    amount: Float!
    totalamount: Float!
    itemCount: Int!
  }

  type MutationResult {
    success: Boolean!
    message: String!
  }

  input ProductFilterInput {
    page: Int
    limit: Int
    categories: [String!]
    materials: [String!]
    search: String
  }

  input UpdateCartInput {
    productId: ID!
    action: String!
    amount: Int
  }

  type Query {
    storeProducts(filter: ProductFilterInput): ProductConnection!
    myCart: CartSummary!
  }

  type Mutation {
    addToCart(productId: ID!, quantity: Int): MutationResult!
    updateCart(input: UpdateCartInput!): MutationResult!
  }
`);

export const storeGraphQLResolvers = {
  async storeProducts(
    args: StoreProductsArgs,
  ): Promise<{ products: any[]; pagination: any }> {
    const filter = args.filter ?? {};

    const page = Math.max(1, filter.page ?? 1);
    const limit = Math.max(1, Math.min(filter.limit ?? 12, 50));
    const categories = normalizeFilterList(filter.categories);
    const materials = normalizeFilterList(filter.materials);
    const search = filter.search?.trim() || null;

    return getApprovedProducts(categories, materials, page, limit, search);
  },

  async myCart(_args: unknown, context: GraphQLContext): Promise<any> {
    const user = context.requireAuth();
    const cart = await getUserCart(user.id);
    return buildCartSummary(cart as any[]);
  },

  async addToCart(args: AddToCartArgs, context: GraphQLContext): Promise<any> {
    const user = context.requireAuth();
    const quantity = args.quantity ?? 1;

    ensurePositiveInt(quantity, "quantity");

    const result = await addItem(user.id, args.productId, quantity);
    if (!result.success) {
      throw new GraphQLError(result.message || "Failed to add to cart", {
        extensions: { code: "BAD_USER_INPUT" },
      });
    }

    return result;
  },

  async updateCart(args: UpdateCartArgs, context: GraphQLContext): Promise<any> {
    const user = context.requireAuth();
    const { productId, action, amount } = args.input;

    let result: { success: boolean; message: string };

    switch (action) {
      case "add":
        result = await addItem(user.id, productId, 1);
        break;
      case "del":
        result = await deleteItem(user.id, productId);
        break;
      case "rem":
        result = await removeCompleteItem(user.id, productId);
        break;
      case "none": {
        const qty = amount ?? 0;
        ensurePositiveInt(qty, "amount");
        result = await changeProductAmount(user.id, productId, qty);
        break;
      }
      default:
        throw new GraphQLError("Invalid action", {
          extensions: { code: "BAD_USER_INPUT" },
        });
    }

    if (!result.success) {
      throw new GraphQLError(result.message || "Failed to update cart", {
        extensions: { code: "BAD_USER_INPUT" },
      });
    }

    return result;
  },
};
