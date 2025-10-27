import type { Request, Response } from "express";

const demoSettings = {
  profile: {
    _id: "1",
    name: "John Doe",
    username: "johndoe",
    email: "john.doe@example.com",
    mobile: "+1 (555) 123-4567",
    createdAt: "2024-01-15T08:30:00Z",
  },
  addresses: [
    {
      id: "a1",
      type: "home",
      street: "123 Main St",
      city: "Anytown",
      state: "CA",
      zip: "12345",
    },
    {
      id: "a2",
      type: "work",
      street: "456 Business Ave",
      city: "Metropolis",
      state: "NY",
      zip: "67890",
    },
  ],
  notifications: {
    email: true,
    sms: false,
    push: true,
  },
  payments: [
    { id: "pm1", brand: "Visa", last4: "1234", exp: "12/2026" },
    { id: "pm2", brand: "Mastercard", last4: "5678", exp: "08/2025" },
  ],
};

export const getSettings = async (_req: Request, res: Response) => {
  try {
    return res.json(demoSettings);
  } catch (err: any) {
    return res.status(500).json({ message: "Error fetching settings", error: err.message });
  }
};

export default { getSettings };
