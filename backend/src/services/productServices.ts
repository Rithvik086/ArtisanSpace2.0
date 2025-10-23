import mongoose from "mongoose";
import Product from "../models/productModel.js";

export async function addProductService(
  userId: string,
  uploadedBy: string,
  name: string,
  category: string,
  material: string,
  image: string,
  oldPrice: string | number,
  quantity: string | number,
  description: string
) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // normalize and validate price and quantity
    const oldPriceNum =
      typeof oldPrice === "string" ? parseFloat(oldPrice) : oldPrice;
    if (Number.isNaN(oldPriceNum) || typeof oldPriceNum !== "number") {
      throw new Error("Invalid oldPrice");
    }

    const quantityNum =
      typeof quantity === "string" ? parseInt(quantity, 10) : quantity;
    if (!Number.isInteger(quantityNum) || quantityNum < 0) {
      throw new Error("Invalid quantity");
    }

    // Round prices to 2 decimals and keep as numbers
    const oldPriceRounded = Math.round(oldPriceNum * 100) / 100;
    const newPriceRounded = Math.round(oldPriceRounded * 0.9 * 100) / 100;

    const product = new Product({
      userId,
      uploadedBy,
      name,
      category,
      material,
      image,
      oldPrice: oldPriceRounded,
      newPrice: newPriceRounded,
      quantity: quantityNum,
      description,
      status: "pending",
    });

    await product.save({ session });
    await session.commitTransaction();
    return { success: true };
  } catch (e) {
    await session.abortTransaction();
    throw new Error("Error adding product: " + (e as Error).message);
  } finally {
    session.endSession();
  }
}

export async function deleteProductService(productId: string) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new Error("Invalid product ID");
    }

    const product = await Product.findById(productId).session(session);
    if (!product) {
      throw new Error("Product not found");
    }

    await product.deleteOne({ session });
    await session.commitTransaction();
    return { success: true };
  } catch (e) {
    await session.abortTransaction();
    throw new Error("Error deleting product: " + (e as Error).message);
  } finally {
    session.endSession();
  }
}

// export async function getProduct(productId) {
//   try {
//     const product = await Product.findById(productId);
//     if (!product) {
//       throw new Error("Product not found");
//     }
//     return product;
//   } catch (e) {
//     throw new Error("Error getting product: " + e.message);
//   }
// }

export async function getProducts(
  artisanId: string | null = null,
  approved = false,
  page = 1,
  limit = 10
) {
  try {
    const skip = (page - 1) * limit;

    let query;
    if (artisanId) {
      if (approved) {
        query = Product.find({
          userId: artisanId,
          status: "approved",
        }).populate("userId");
      } else {
        query = Product.find({ userId: artisanId }).populate("userId");
      }
    } else {
      if (approved) {
        query = Product.find({ status: "approved" }).populate("userId");
      } else {
        query = Product.find().populate("userId");
      }
    }

    // Get total count for pagination
    const totalCount = await query.clone().countDocuments();

    // Apply pagination
    const products = await query.skip(skip).limit(limit);

    return {
      products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalProducts: totalCount,
        hasNextPage: page * limit < totalCount,
        hasPrevPage: page > 1,
      },
    };
  } catch (e) {
    throw new Error("Error getting products: " + (e as Error).message);
  }
}

// export async function getProductsByRole(role) {
//   try {
//     const products = Product.find({ uploadedBy: role });
//     return products;
//   } catch (e) {
//     throw new Error("Error getting products by role: " + e.message);
//   }
// }

export async function productCount(productId: string, session: any = null) {
  try {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new Error("Invalid product ID");
    }

    let product;
    if (session && session.inTransaction()) {
      product = await Product.findOne({
        status: "approved",
        _id: productId,
      }).session(session);
    } else {
      product = await Product.findOne({
        status: "approved",
        _id: productId,
      });
    }

    return product ? product.quantity : 0;
  } catch (e) {
    throw new Error("Error getting product count: " + (e as Error).message);
  }
}

export async function approveProduct(productId: string) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new Error("Invalid product ID");
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { status: "approved" },
      { new: true, runValidators: true, session }
    );

    if (!updatedProduct) {
      throw new Error("Product not found");
    } else {
      await session.commitTransaction();
      return { success: true };
    }
  } catch (e) {
    await session.abortTransaction();
    throw new Error("Error approving product: " + (e as Error).message);
  } finally {
    session.endSession();
  }
}

export async function disapproveProduct(productId: string) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new Error("Invalid product ID");
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { status: "disapproved" },
      { new: true, runValidators: true, session }
    );

    if (!updatedProduct) {
      throw new Error("Product not found");
    } else {
      await session.commitTransaction();
      return { success: true };
    }
  } catch (e) {
    await session.abortTransaction();
    throw new Error("Error approving product: " + (e as Error).message);
  } finally {
    session.endSession();
  }
}

export async function getApprovedProducts(
  category: string | string[] | null = null,
  page = 1,
  limit = 10
) {
  try {
    const skip = (page - 1) * limit;

    let query;
    if (!category) {
      query = Product.find({ status: "approved" }).populate("userId");
    } else {
      if (!Array.isArray(category)) {
        //checking if category is not a array
        query = Product.find({ status: "approved", category }).populate(
          "userId"
        );
      } else {
        query = Product.find({
          status: "approved",
          category: { $in: category },
        }).populate("userId");
      }
    }

    // Get total count for pagination metadata
    const totalCount = await query.clone().countDocuments();

    // Apply pagination
    const products = await query.skip(skip).limit(limit);

    return {
      products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalProducts: totalCount,
        hasNextPage: page * limit < totalCount,
        hasPrevPage: page > 1,
      },
    };
  } catch (e) {
    throw new Error("Error getting approved products: " + (e as Error).message);
  }
}

// export async function getDisapprovedProducts() {
//   try {
//     return await Product.find({ status: "disapproved" }).populate("userId");
//   } catch (e) {
//     throw new Error("Error getting disapproved products: " + e.message);
//   }
// }

// export async function getPendingProducts() {
//   try {
//     return await Product.find({ status: "pending" }).populate("userId");
//   } catch (e) {
//     throw new Error("Error getting pending products: " + e.message);
//   }
// }

// export async function getProductsCount() {
//   try {
//     const result = await Product.aggregate([
//       {
//         $group: {
//           _id: "$status",
//           count: { $sum: 1 },
//         },
//       },
//     ]);

//     // Ensure all expected statuses are present
//     const counts = {
//       approved: 0,
//       pending: 0,
//       disapproved: 0,
//     };

//     result.forEach(({ _id, count }) => {
//       counts[_id] = count;
//     });

//     return counts;
//   } catch (e) {
//     throw new Error("Error getting products count: " + e.message);
//   }
// }

export async function decreaseProductQuantity(
  productId: string,
  quantity: number,
  session: any = null
) {
  let newSession = false;

  if (!session) {
    session = await mongoose.startSession();
    session.startTransaction();
    newSession = true;
  }

  try {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new Error("Invalid product ID");
    }

    const count = await productCount(productId, session);

    if (count < quantity) {
      throw new Error("Not enough stock");
    }
    if (quantity < 0) {
      throw new Error("Quantity cannot be negative");
    }
    if (quantity === 0) {
      throw new Error("Quantity cannot be zero");
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { quantity },
      { new: true, runValidators: true, session }
    );

    if (!updatedProduct) {
      throw new Error("Product not found");
    } else {
      if (newSession) {
        await session.commitTransaction();
      }
      return {
        success: true,
        message: "Product quantity updated successfully!",
      };
    }
  } catch (e) {
    if (newSession) {
      await session.abortTransaction();
    }
    throw new Error(
      "Error decreasing product quantity: " + (e as Error).message
    );
  } finally {
    if (newSession) {
      session.endSession();
    }
  }
}

export async function updateProduct(
  productId: string,
  name: string,
  oldPrice: number,
  newPrice: number,
  quantity: number,
  description: string
) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new Error("Invalid product ID");
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { name, oldPrice, newPrice, quantity, description },
      { new: true, runValidators: true, session }
    );

    if (!updatedProduct) {
      throw new Error("Product not found");
    } else {
      await session.commitTransaction();
      return { success: true, message: "Product updated successfully!" };
    }
  } catch (e) {
    await session.abortTransaction();
    throw new Error("Error updating product: " + (e as Error).message);
  } finally {
    session.endSession();
  }
}
