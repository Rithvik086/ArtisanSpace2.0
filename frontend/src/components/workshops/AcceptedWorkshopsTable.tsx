import type { Workshop } from "../../types/workshop";
import { craftStyles, cn } from "../../styles/theme";
import { Calendar, Clock, User, Mail, Phone, X, CheckCircle } from "lucide-react";

interface Props {
  workshops: Workshop[];
  onRemove: (workshopId: string) => void;
}

export function AcceptedWorkshopsTable({ workshops, onRemove }: Props) {
  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className={cn(craftStyles.card.warm, "p-6")}>
        <div className="flex items-center space-x-3 mb-2">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <h2 className="text-2xl font-bold text-amber-900 font-serif">Accepted Workshops</h2>
        </div>
        <p className="text-amber-700">Manage your scheduled workshops and connect with clients</p>
      </div>

      {/* Workshops Grid */}
      {workshops.length > 0 ? (
        <div className="grid gap-6">
          {workshops.map((workshop) => (
            <div key={workshop._id} className={cn(craftStyles.card.default, "p-6 border-l-4 border-green-500 hover:shadow-xl transition-all duration-300")}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800 border border-green-200">
                      Accepted
                    </span>
                    <h3 className="text-xl font-semibold text-amber-900 font-serif">
                      {workshop.workshopTitle}
                    </h3>
                  </div>
                  <p className="text-amber-700 mb-4 leading-relaxed">
                    {workshop.workshopDescription}
                  </p>
                </div>
                <button
                  onClick={() => onRemove(workshop._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 border border-red-300 hover:border-red-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Client Information */}
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <User className="w-4 h-4 text-amber-600" />
                    <p className="text-xs text-amber-700 font-bold uppercase tracking-wide">Client Details</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-amber-900">{workshop.userId.username}</p>
                    {workshop.userId.email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-amber-600" />
                        <p className="text-sm text-amber-700">{workshop.userId.email}</p>
                      </div>
                    )}
                    {workshop.userId.mobile_no && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-amber-600" />
                        <p className="text-sm text-amber-700">{workshop.userId.mobile_no}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Schedule Information */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <p className="text-xs text-blue-700 font-bold uppercase tracking-wide">Schedule</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <p className="text-lg font-semibold text-blue-900">
                        {new Date(workshop.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <p className="text-lg font-semibold text-blue-900">{workshop.time}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={cn(craftStyles.card.default, "p-12 text-center")}>
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-amber-900 mb-2">No Accepted Workshops</h3>
          <p className="text-amber-700">You haven't accepted any workshops yet. Check available workshops to get started!</p>
        </div>
      )}
    </div>
  );
}