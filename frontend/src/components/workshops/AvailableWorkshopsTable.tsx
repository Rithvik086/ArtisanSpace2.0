import type { Workshop } from "../../types/workshop";
import { craftStyles, cn } from "../../styles/theme";
import { Calendar, Clock, User, CheckCircle } from "lucide-react";

interface Props {
  workshops: Workshop[];
  onAccept: (workshopId: string) => void;
}

export function AvailableWorkshopsTable({ workshops, onAccept }: Props) {
  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className={cn(craftStyles.card.warm, "p-6")}>
        <div className="flex items-center space-x-3 mb-2">
          <Calendar className="w-6 h-6 text-amber-600" />
          <h2 className="text-2xl font-bold text-amber-900 font-serif">Available Workshops</h2>
        </div>
        <p className="text-amber-700">Discover new workshop opportunities to share your craft expertise</p>
      </div>

      {/* Workshops Grid */}
      {workshops.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
          {workshops.map((workshop) => (
            <div key={workshop._id} className={cn(craftStyles.card.default, "p-6 hover:shadow-xl transition-all duration-300")}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-amber-900 font-serif mb-2">
                    {workshop.workshopTitle}
                  </h3>
                  <p className="text-amber-700 mb-4 leading-relaxed">
                    {workshop.workshopDescription}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-amber-600" />
                  <div>
                    <p className="text-xs text-amber-700 font-medium uppercase tracking-wide">Client</p>
                    <p className="text-sm font-semibold text-amber-900">{workshop.userId.username}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <div>
                    <p className="text-xs text-amber-700 font-medium uppercase tracking-wide">Date</p>
                    <p className="text-sm font-semibold text-amber-900">
                      {new Date(workshop.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <div>
                    <p className="text-xs text-amber-700 font-medium uppercase tracking-wide">Time</p>
                    <p className="text-sm font-semibold text-amber-900">{workshop.time}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => onAccept(workshop._id)}
                  className={cn(craftStyles.button.primary, "flex items-center space-x-2")}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Accept Workshop</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={cn(craftStyles.card.default, "p-12 text-center")}>
          <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8 text-amber-600" />
          </div>
          <h3 className="text-xl font-semibold text-amber-900 mb-2">No Available Workshops</h3>
          <p className="text-amber-700">Check back later for new workshop opportunities to showcase your skills!</p>
        </div>
      )}
    </div>
  );
}