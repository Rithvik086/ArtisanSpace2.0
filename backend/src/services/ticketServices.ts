import Ticket from "../models/supportTicketModel.js";

export async function addTicket(
  userId: string,
  subject: string,
  category: string,
  description: string
) {
  try {
    const ticket = new Ticket({
      userId,
      subject,
      category,
      description,
    });
    await ticket.save();
    return { success: true };
  } catch (e) {
    throw new Error("Error adding ticket: " + (e as Error).message);
  }
}

export async function getTickets() {
  try {
    const tickets = await Ticket.find().populate(
      "userId",
      "username name email mobile_no role"
    );
    return tickets;
  } catch (e) {
    throw new Error("Error fetching tickets: " + (e as Error).message);
  }
}

export async function removeTicket(ticketId: string) {
  try {
    const ticket = await Ticket.findByIdAndDelete(ticketId);
    if (!ticket) {
      throw new Error("Ticket not found");
    }
    return { success: true };
  } catch (e) {
    throw new Error("Error deleting ticket: " + (e as Error).message);
  }
}

export async function updateTicketStatus(
  ticketId: string,
  status: "open" | "in-progress" | "closed"
) {
  try {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new Error("Ticket not found");
    }
    ticket.status = status;
    await ticket.save();
    return { success: true };
  } catch (e) {
    throw new Error("Error updating ticket status: " + (e as Error).message);
  }
}
