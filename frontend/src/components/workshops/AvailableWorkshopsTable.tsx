import type { Workshop } from "../../types/workshop";
import { craftStyles, cn } from "../../styles/theme";
import { Calendar, Clock, User, CheckCircle } from "lucide-react";

interface Props {
  workshops: Workshop[];
  onAccept: (workshopId: string) => void;
  acceptingWorkshops: Set<string>;
  searchTerm?: string;
}

export function AvailableWorkshopsTable({
  workshops,
  onAccept,
  acceptingWorkshops,
}: Props) {
  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className={cn(craftStyles.card.warm, "p-6")}>
        <div className="flex items-center space-x-3 mb-2">
          <Calendar className="w-6 h-6 text-amber-600" />
          <h2 className="text-2xl font-bold text-amber-900 font-baloo">
            Available Workshops
          </h2>
        </div>
        <p className="text-amber-700 font-baloo">
          Discover new workshop opportunities to share your craft expertise
        </p>
      </div>

      {/* Workshops Grid */}
      {workshops.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
          {workshops.map((workshop) => (
            <div
              key={workshop._id}
              className={cn(
                craftStyles.card.default,
                "p-6 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 border-l-4 border-l-amber-400 bg-gradient-to-br from-white to-amber-50/30"
              )}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-amber-900 font-baloo mb-1">
                        {workshop.workshopTitle}
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        Available
                      </span>
                    </div>
                  </div>
                  <p className="text-amber-700 mb-4 leading-relaxed font-baloo text-sm">
                    {workshop.workshopDescription}
                  </p>
                </div>
              </div>

              <div className="bg-amber-50/50 rounded-lg p-4 mb-6 border border-amber-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-amber-200 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-amber-700" />
                    </div>
                    <div>
                      <p className="text-xs text-amber-600 font-medium uppercase tracking-wide font-baloo">
                        Client
                      </p>
                      <p className="text-sm font-semibold text-amber-900 font-baloo">
                        {workshop.userId.username}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-blue-700" />
                    </div>
                    <div>
                      <p className="text-xs text-blue-600 font-medium uppercase tracking-wide font-baloo">
                        Date
                      </p>
                      <p className="text-sm font-semibold text-blue-900 font-baloo">
                        {new Date(workshop.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center">
                      <Clock className="w-4 h-4 text-green-700" />
                    </div>
                    <div>
                      <p className="text-xs text-green-600 font-medium uppercase tracking-wide font-baloo">
                        Time
                      </p>
                      <p className="text-sm font-semibold text-green-900 font-baloo">
                        {workshop.time}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => onAccept(workshop._id)}
                  disabled={acceptingWorkshops.has(workshop._id)}
                  className={cn(
                    craftStyles.button.primary,
                    "flex items-center space-x-2 px-6 py-3 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200",
                    acceptingWorkshops.has(workshop._id) &&
                      "opacity-50 cursor-not-allowed transform-none"
                  )}
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>
                    {acceptingWorkshops.has(workshop._id)
                      ? "Accepting..."
                      : "Accept Workshop"}
                  </span>
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
          <h3 className="text-xl font-semibold text-amber-900 mb-2 font-baloo">
            No Available Workshops
          </h3>
          <p className="text-amber-700 font-baloo">
            Check back later for new workshop opportunities to showcase your
            skills!
          </p>
        </div>
      )}
    </div>
  );
}
