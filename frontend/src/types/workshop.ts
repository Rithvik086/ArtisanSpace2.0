// Workshop type definitions for ArtisanSpace

export interface Workshop {
  _id: string;
  workshopTitle: string;
  workshopDescription: string;
  userId: {
    username: string;
    email?: string;
    mobile_no?: string;
  };
  date: string;
  time: string;
  acceptedAt?: string;
  status?: 'available' | 'accepted' | 'completed' | 'cancelled';
}

export interface WorkshopTableProps {
  workshops: Workshop[];
  onAccept?: (workshopId: string) => void;
  onRemove?: (workshopId: string) => void;
}
