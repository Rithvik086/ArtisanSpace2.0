import mongoose from "mongoose";
import Cart from "../models/cartModel.js";
import { productCount } from "./productServices.js";

export async function getUserCart(userId: string, session: any = null) {
  try {
    let cart;
    if (session) {
      cart = await Cart.findOne({ userId }, { products: 1, _id: 0 })
        .populate("products.productId")
        .session(session);
    } else {
      cart = await Cart.findOne({ userId }, { products: 1, _id: 0 }).populate(
        "products.productId"
      );
    }
    if (cart === null) {
      return [];
    }
    // Filter out products where isValid is false
    const filteredProducts = cart.products.filter(
      (item: any) => item.productId && item.productId.isValid
    );
    return filteredProducts;
  } catch (e) {
    throw new Error("Error fetching cart: " + (e as Error).message);
  }
}

export async function getCartProductQuantity(
  userId: string,
  productId: string,
  session: any = null
) {
  try {
    let cart;
    if (session) {
      cart = await Cart.findOne(
        { userId, "products.productId": productId },
        { "products.$": 1, _id: 0 }
      ).populate("products.productId").session(session);
    } else {
      cart = await Cart.findOne(
        { userId, "products.productId": productId },
        { "products.$": 1, _id: 0 }
      ).populate("products.productId");
    }

    if (!cart || !cart.products || cart.products.length === 0) {
      return 0; // Product not found in cart
    }
    const item = cart.products[0];
    if (!item || !item.productId || !item.productId.isValid) {
      return 0; // Product is invalid
    }
    return item.quantity || 0;
  } catch (error: any) {
    throw new Error("Error fetching cart: " + (error.message || error));
  }
}

export async function addItem(userId: string, productId: string) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const productQuantity = await productCount(
      productId,
      session.inTransaction() ? session : null
    );
    let cartQuantity = 0;

    cartQuantity = await getCartProductQuantity(
      userId,
      productId,
      session.inTransaction() ? session : null
    );

    if (productQuantity > cartQuantity) {
      if (cartQuantity > 0) {
        // Update the quantity of the existing product in the cart
        await Cart.findOneAndUpdate(
          { userId, "products.productId": productId },
          { $inc: { "products.$.quantity": 1 } },
          { new: true, runValidators: true, session }
        );
        await session.commitTransaction();
        return { success: true, message: "Cart updated!" };
      } else {
        // Add the product to the cart if it doesn't exist
        await Cart.findOneAndUpdate(
          { userId },
          { $addToSet: { products: { productId, quantity: 1 } } },
          { new: true, upsert: true, runValidators: true, session }
        );
        await session.commitTransaction();
        return { success: true, message: "Product added to cart!" };
      }
    } else {
      return { success: false, message: "Stock limit reached" };
    }
  } catch (error: any) {
    await session.abortTransaction();
    throw new Error("Error adding item to cart: " + (error.message || error));
  } finally {
    session.endSession();
  }
}

export async function deleteItem(userId: string, productId: string) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const userProductCount = await getCartProductQuantity(
      userId,
      productId,
      session
    );
    const userCart = await getUserCart(
      userId,
      session.inTransaction() ? session : null
    );
    const productCount = userCart.length;

    if (userProductCount > 1) {
      // Update the quantity of the existing product in the cart
      await Cart.findOneAndUpdate(
        { userId, "products.productId": productId },
        { $inc: { "products.$.quantity": -1 } },
        { new: true, runValidators: true, session }
      );
      await session.commitTransaction();
      return { success: true, message: "Cart updated!" };
    } else {
      if (productCount > 1) {
        // Remove the product from the cart if its quantity is 1
        await Cart.findOneAndUpdate(
          { userId },
          { $pull: { products: { productId } } },
          { new: true, runValidators: true, session }
        );
        await session.commitTransaction();
        return { success: true, message: "Product removed from cart!" };
      } else {
        await Cart.deleteOne({ userId }, { session });
        await session.commitTransaction();
        return { success: true, message: "Cart deleted!" };
      }
    }
  } catch (e) {
    await session.abortTransaction();
    throw new Error("Error deleting item from cart: " + (e as Error).message);
  } finally {
    session.endSession();
  }
}

export async function changeProductAmount(
  userId: string,
  productId: string,
  amount: number
) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const productQuantity = await productCount(productId, session);
    if (amount > productQuantity) {
      await Cart.findOneAndUpdate(
        { userId, "products.productId": productId },
        { "products.$.quantity": productQuantity },
        { new: true, runValidators: true, session }
      );
      await session.commitTransaction();
      return { success: true, message: "Inventory limit reached!" };
    } else {
      await Cart.findOneAndUpdate(
        { userId, "products.productId": productId },
        { "products.$.quantity": amount },
        { new: true, runValidators: true, session }
      );
      await session.commitTransaction();
      return { success: true, message: "Cart updated!" };
    }
  } catch (e) {
    await session.abortTransaction();
    throw new Error(
      "Error changing product amount from cart: " + (e as Error).message
    );
  } finally {
    session.endSession();
  }
}

export async function removeCompleteItem(userId: string, productId: string) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // First check if the cart has only this one product
    const userCart = await getUserCart(userId, session);
    const productCount = userCart.length;

    if (productCount <= 1) {
      // If this is the last product in the cart, remove the entire cart
      await Cart.deleteOne({ userId }, { session });
      await session.commitTransaction();
      return { success: true, message: "Cart cleared!" };
    } else {
      // Just remove the specific product from the cart, not the entire cart
      await Cart.findOneAndUpdate(
        { userId },
        { $pull: { products: { productId } } },
        { new: true, runValidators: true, session }
      );
      await session.commitTransaction();
      return { success: true, message: "Product removed from cart!" };
    }
  } catch (error) {
    await session.abortTransaction();
    throw new Error(
      "Error removing complete item from cart " + (error as Error).message
    );
  } finally {
    session.endSession();
  }
}

export async function removeCart(userId: string, session: any = null) {
  try {
    let result;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid userId format");
    }

    if (session) {
      result = await Cart.findOneAndDelete({ userId }, { session });
    } else {
      result = await Cart.findOneAndDelete({ userId });
    }
    if (!result) {
      throw new Error("Cart not found for the given userId.");
    }
    return { success: true, message: "Cart removed successfully." };
  } catch (error) {
    throw new Error("Error removing cart: " + (error as Error).message);
  }
}

// export async function removeProductFromAllCarts(productId) {
//   const session = await mongoose.startSession();
//   session.startTransaction();
//   try {
//     const result = await Cart.updateMany(
//       { "products.productId": productId },
//       { $pull: { products: { productId } } },
//       { new: true, runValidators: true, session }
//     );
//     if (result.modifiedCount === 0) {
//       throw new Error("Product not found in any cart.");
//     }
//     await session.commitTransaction();
//     return { success: true, message: "Product removed from all carts." };
//   } catch (error) {
//     await session.abortTransaction();
//     throw new Error("Error removing product from all carts " + error.message);
//   } finally {
//     session.endSession();
//   }
// }
