import type { Request, Response } from "express";
import {
  addItem,
  changeProductAmount,
  deleteItem,
  getUserCart,
  removeCompleteItem,
} from "../services/cartServices.js";

export const getCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const cart = await getUserCart(userId);

    let amount = 0;
    for (const item of cart) {
      amount += item.quantity * (item.productId as any).newPrice;
    }

    res.status(200).json({
      success: true,
      cart,
      amount,
      itemCount: cart.length,
    });
  } catch (error) {
    throw new Error("Error processing request: " + (error as Error).message);
  }
};

export const addToCart = async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { productId } = req.query;
  if (!userId || !productId) {
    return res
      .status(400)
      .json({ success: false, message: "userId and productId are required" });
  }
  try {
    res.status(200).json(await addItem(userId as string, productId as string));
  } catch (error) {
    throw new Error("Error processing request: " + (error as Error).message);
  }
};

export const editCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { productId, action, amount } = req.query;

    if (!userId || !productId || !action) {
      return res.status(400).json({
        success: false,
        message: "userId, productId, and action are required",
      });
    }

    const userIdStr = userId as string;
    const productIdStr = productId as string;
    const actionStr = action as string;

    let msg;
    if (actionStr === "add") {
      msg = await addItem(userIdStr, productIdStr);
    } else if (actionStr === "del") {
      msg = await deleteItem(userIdStr, productIdStr);
    } else if (actionStr === "rem") {
      msg = await removeCompleteItem(userIdStr, productIdStr);
    } else if (actionStr === "none") {
      if (!amount) {
        return res.status(400).json({
          success: false,
          message: "amount is required for 'none' action",
        });
      }
      const amountNum = parseInt(amount as string);
      if (isNaN(amountNum)) {
        return res.status(400).json({
          success: false,
          message: "amount must be a valid number",
        });
      }
      msg = await changeProductAmount(userIdStr, productIdStr, amountNum);
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid action",
      });
    }
    res.json(msg);
  } catch (error) {
    throw new Error("Error processing request: " + (error as Error).message);
  }
};
