"use client";

import { useState, useEffect, useCallback } from "react";
import { Toaster, toast } from "react-hot-toast";
import { TicketCard } from "@/components/support/TicketCard";
import { Ticket, TicketResponse, UserRole } from "../types/ticket";
import { AlertTriangle, RefreshCw } from "lucide-react";

// --- MOCK DATA (Replace with your actual API call)
const mockTickets: Ticket[] = [
  {
    _id: "t1",
    ticketId: "T-1001",
    subject: "Product Image Upload Failed",
    category: "Technical Issue",
    username: "ArtisanCrafts",
    role: "Artisan",
    email: "artisan@example.com",
    description: "I'm trying to upload a new product image, but it keeps failing with a '500 Server Error'. Please help.",
    status: "open",
    priority: "high",
    createdAt: "2025-11-02T10:30:00.000Z",
    updatedAt: "2025-11-02T10:30:00.000Z",
  },
  {
    _id: "t2",
    ticketId: "T-1002",
    subject: "Payment Not Received",
    category: "Billing",
    username: "CustomerPriya",
    role: "Customer",
    email: "priya@example.com",
    description: "My order #ORD-123 shows as paid, but the artisan says they haven't received the payment.",
    status: "in_progress",
    priority: "high",
    createdAt: "2025-11-01T14:45:00.000Z",
    updatedAt: "2025-11-01T15:30:00.000Z",
  },
  {
    _id: "t3",
    ticketId: "T-1003",
    subject: "Question about Custom Order",
    category: "General Inquiry",
    username: "WoodWorkerIndia",
    role: "Artisan",
    email: "woodwork@example.com",
    description: "A customer requested a custom order, but I need to ask them a few more questions. How do I contact them?",
    status: "open",
    priority: "medium",
    createdAt: "2025-11-01T09:15:00.000Z",
    updatedAt: "2025-11-01T09:15:00.000Z",
  },
];
// --- END MOCK DATA ---

export default function SupportTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const fetchTickets = useCallback(async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true);
    setRefreshing(isRefreshing);
    setError(null);

    try {
      // In a real app, you'd fetch tickets here
      // const response = await fetch('/api/admin/support-tickets');
      // const data: TicketResponse = await response.json();
      // if (!response.ok || !data.success) {
      //   throw new Error(data.error || 'Failed to fetch tickets');
      // }
      // setTickets(data.tickets || []);
      
      // Using mock data
      setTickets(mockTickets);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load support tickets';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleResolveTicket = async (ticketId: string) => {
    if (!ticketId) {
      toast.error('Invalid ticket ID');
      return;
    }

    setResolvingId(ticketId);

    try {
      // In a real app, you'd make an API call here
      // const response = await fetch(`/api/admin/support-tickets/${ticketId}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ status: 'resolved' }),
      // });
      
      // const data: TicketResponse = await response.json();
      // if (!response.ok || !data.success) {
      //   throw new Error(data.error || 'Failed to update ticket status');
      // }

      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Optimistically update the ticket status
      setTickets(prevTickets => 
        prevTickets.map(ticket => 
          ticket._id === ticketId 
            ? { 
                ...ticket, 
                status: 'resolved', 
                updatedAt: new Date().toISOString(),
                resolvedAt: new Date().toISOString()
              } 
            : ticket
        )
      );
      
      toast.success('Ticket marked as resolved');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resolve ticket';
      console.error('Error resolving ticket:', err);
      toast.error(errorMessage);
    } finally {
      setResolvingId(null);
    }
  };

  const handleRefresh = () => {
    fetchTickets(true);
  };

  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-4 border-gray-200 rounded-full animate-spin border-t-[#6B4F3A] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading support tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <main className="container mx-auto p-4 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#4F3824]">Support Tickets</h1>
            <p className="text-sm sm:text-base text-neutral-600">
              Manage all support requests from your dashboard.
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#6B4F3A] bg-white border border-[#6B4F3A]/20 rounded-md hover:bg-[#6B4F3A]/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {refreshing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Refresh
              </>
            )}
          </button>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
            <p>{error}</p>
          </div>
        )}

        {tickets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tickets.map(ticket => (
              <TicketCard
                key={ticket._id}
                ticket={ticket}
                onResolve={handleResolveTicket}
                isResolving={resolvingId === ticket._id}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 p-12 text-center">
            <AlertTriangle className="h-12 w-12 text-neutral-400" />
            <h3 className="mt-4 text-xl font-semibold text-neutral-700">
              No Support Tickets Found
            </h3>
            <p className="mt-1 text-neutral-500">
              When new tickets are created, they will appear here.
            </p>
          </div>
        )}
      </main>
    </>
  );
}