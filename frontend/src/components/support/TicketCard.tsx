import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { Ticket } from "../../types/ticket";
import { Mail, Loader2, CheckCircle2, AlertCircle, Clock, MessageSquare, ArrowUp, ArrowDown, Minus, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const statusIcons = {
  open: <AlertCircle className="h-4 w-4" />,
  in_progress: <Loader2 className="h-4 w-4 animate-spin" />,
  resolved: <CheckCircle2 className="h-4 w-4" />,
  closed: <CheckCircle2 className="h-4 w-4" />
};

const statusColors = {
  open: 'bg-blue-100 text-blue-800 border-blue-200',
  in_progress: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  resolved: 'bg-green-100 text-green-800 border-green-200',
  closed: 'bg-gray-100 text-gray-800 border-gray-200'
};

const priorityColors = {
  high: 'bg-red-100 text-red-800 border-red-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-blue-100 text-blue-800 border-blue-200'
};

const priorityIcons = {
  high: <ArrowUp className="h-3 w-3" />,
  medium: <Minus className="h-3 w-3" />,
  low: <ArrowDown className="h-3 w-3" />
};

const roleColors = {
  Artisan: 'bg-purple-100 text-purple-800 border-purple-200',
  Customer: 'bg-sky-100 text-sky-800 border-sky-200',
  Admin: 'bg-amber-100 text-amber-800 border-amber-200'
};

interface TicketCardProps {
  ticket: Ticket;
  onResolve: (ticketId: string) => void;
  isResolving: boolean;
  className?: string;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export function TicketCard({ ticket, onResolve, isResolving, className }: TicketCardProps) {
  const status = ticket.status || 'open';
  const priority = ticket.priority || 'medium';
  const role = ticket.role as keyof typeof roleColors;

  return (
    <Card className={cn(
      "group flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md border border-gray-200/80 bg-white/80",
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-3">
          <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
            {ticket.subject}
          </CardTitle>
          <div className="flex flex-col items-end gap-2">
            <Badge
              className={cn(
                "flex items-center gap-1 text-xs font-medium whitespace-nowrap",
                statusColors[status as keyof typeof statusColors] || ''
              )}
            >
              {statusIcons[status as keyof typeof statusIcons]}
              {status.replace('_', ' ')}
            </Badge>
            {priority && (
              <Badge
                className={cn(
                  "flex items-center gap-1 text-xs font-medium",
                  priorityColors[priority as keyof typeof priorityColors] || ''
                )}
              >
                {priorityIcons[priority as keyof typeof priorityIcons]}
                {priority} priority
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-3">
          <Badge
            className={cn(
              "text-xs font-medium",
              roleColors[role] || 'bg-gray-100 text-gray-800 border-gray-200'
            )}
          >
            {ticket.role}
          </Badge>
          
          <Badge className="text-xs font-medium bg-[#6B4F3A]/10 text-[#6B4F3A] border-[#6B4F3A]/20">{ticket.category}</Badge>
        </div>
        
        <a
          href={`mailto:${ticket.email}`}
          className="mt-3 flex items-center gap-2 text-sm text-gray-600 hover:text-[#6B4F3A] transition-colors"
        >
          <Mail className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{ticket.email}</span>
        </a>
      </CardHeader>
      
      <CardContent className="py-2 px-6">
        <div className="flex items-start gap-2">
          <MessageSquare className="h-4 w-4 mt-0.5 text-gray-400 flex-shrink-0" />
          <p className="text-gray-700 text-sm line-clamp-3">
            {ticket.description}
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col items-stretch gap-3 bg-gray-50/50 py-3 px-6 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>Created: {formatDate(ticket.createdAt)}</span>
          </div>
          {ticket.updatedAt && ticket.updatedAt !== ticket.createdAt && (
            <div className="text-xs text-gray-400">
              Updated: {formatDate(ticket.updatedAt)}
            </div>
          )}
        </div>
        
        {status !== 'resolved' && status !== 'closed' && (
          <Dialog>
            <DialogTrigger asChild>
              <button
                type="button"
                className={cn(
                  "mt-2 w-full inline-flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium rounded-md",
                  isResolving ? 'opacity-60 cursor-not-allowed' : 'border border-green-600 text-green-600 hover:bg-green-50 hover:text-green-700'
                )}
                disabled={isResolving}
              >
                {isResolving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                {isResolving ? "Resolving..." : "Mark as Resolved"}
              </button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <DialogTitle>Confirm Resolution</DialogTitle>
                </div>
                <DialogDescription className="pt-2">
                  <p>Are you sure you want to mark this ticket as resolved?</p>
                  {ticket.status === 'in_progress' && (
                    <div className="mt-3 p-3 bg-yellow-50 text-yellow-700 text-sm rounded-md">
                      This ticket is currently marked as "In Progress". Please ensure all issues have been addressed before resolving.
                    </div>
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 flex justify-end gap-2">
                <DialogFooter>
                  <DialogClose asChild>
                    <button className="m-0 px-4 py-2 bg-gray-100 text-gray-800 rounded-md">Cancel</button>
                  </DialogClose>
                  <DialogClose asChild>
                    <button
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.preventDefault();
                        onResolve(ticket._id);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Mark as Resolved
                    </button>
                  </DialogClose>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardFooter>
    </Card>
  );
}