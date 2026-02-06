export type UserRole = 'Artisan' | 'Customer' | 'Admin';

export interface Ticket {
  _id: string;
  ticketId: string;
  subject: string;
  category: string;
  username: string;
  role: UserRole;
  email: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high';
  assignedTo?: string; // User ID of admin/team member
  createdAt: string; // ISO date string
  updatedAt?: string; // ISO date string
  resolvedAt?: string; // ISO date string
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
}

export interface TicketResponse {
  success: boolean;
  message?: string;
  ticket?: Ticket;
  tickets?: Ticket[];
  error?: string;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}