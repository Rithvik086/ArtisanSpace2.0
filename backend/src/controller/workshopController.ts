import type { Request, Response } from "express";
import { getUserById } from "../services/userServices.js";
import {
  acceptWorkshop,
  bookWorkshop,
  getAcceptedWorkshops,
  getAvailableWorkshops,
  getWorkshopById,
  getWorkshopByUserId,
  removeWorkshop,
} from "../services/workshopServices.js";
import { sendMail } from "../utils/emailSerice.js";

export const getWorkshops = async (req: Request, res: Response) => {
  try {
    let availableWorkshops = await getAvailableWorkshops();
    let acceptedWorkshops = await getAcceptedWorkshops(req.user.id as string);

    res.status(200).json({
      success: true,
      availableWorkshops,
      acceptedWorkshops,
    });
  } catch (error) {
    throw new Error("Error fetching workshops: " + (error as Error).message);
  }
};

export const getUserWorkshops = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;
    const workshops = await getWorkshopByUserId(userId);
    res.status(200).json({ success: true, workshops });
  } catch (error) {
    throw new Error(
      "Error fetching user workshops: " + (error as Error).message
    );
  }
};

export const bookUserWorkshop = async (req: Request, res: Response) => {
  const { workshopTitle, workshopDesc, date, time } = req.body;
  console.log(workshopTitle, workshopDesc);

  if (!workshopTitle || !workshopDesc || !date || !time) {
    return res
      .status(400)
      .json({ success: false, error: "All fields are required!" });
  }

  try {
    const user = await getUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const newWorkshop = await bookWorkshop(
      req.user.id,
      workshopTitle,
      workshopDesc,
      date,
      time
    );

    res.json({
      success: newWorkshop.success,
      message: "Workshop booked!",
      workshop: newWorkshop,
    });
  } catch (error) {
    throw new Error("Error booking workshop: " + (error as Error).message);
  }
};

export const handleWorksopAction = async (req: Request, res: Response) => {
  try {
    if (req.params.action === "accept") {
      const result = await acceptWorkshop(
        req.params.workshopId as string,
        req.user.id
      );
      if (result.success) {
        const artisanUser = await getUserById(req.user.id);
        const customerUser = await getWorkshopById(
          req.params.workshopId as string
        );

        if (!artisanUser || !customerUser) {
          return res
            .status(404)
            .json({ success: false, message: "User or workshop not found" });
        }

        const customer = customerUser.userId as any;
        const artisan = artisanUser as any;

        // compose email body safely
        const body = `Hello ${customer.username},<br><br>

          Great news! Your workshop request, <b>"${
            customerUser.workshopTitle
          }"</b>, has been accepted by <b>${
          artisan.username
        }</b> on <b>${new Date(
          (customerUser.acceptedAt as any) || Date.now()
        ).toLocaleString()}</b>.<br><br>

          You can now connect with the artisan to finalize the details and make your workshop a success.<br><br>

          <b>Artisan Contact Information:</b><br>
          - 📧 Email: ${artisan.email || "N/A"}<br>
          - 📞 Mobile: ${artisan.mobile_no || "N/A"}<br><br>

          If you have any questions or need assistance, feel free to reach out to us. We're here to help!<br><br>

          Best regards,<br>
          <b>The ArtisanSpace Team</b>`;

        if (customer.email) {
          await sendMail(
            customer.email,
            "Workshop Accepted - ArtisanSpace",
            body
          );
        }

        res.status(200).json({ success: true });
      }
    } else if (req.params.action === "remove") {
      const result = await removeWorkshop(req.params.workshopId as string);
      if (result.success) {
        res.status(200).json({ success: true });
      }
    }
  } catch (error) {
    throw new Error(
      "Error handling workshop action: " + (error as Error).message
    );
  }
};
