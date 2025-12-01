import React from "react";
import { craftStyles, cn } from "../styles/theme";
import { MessageSquare, Clock, User } from "lucide-react";

export default function CustomRequestsPage(): React.ReactElement {
  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-orange-50 to-amber-100">
      <div className={cn(craftStyles.layout.container, "py-8")}>
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-amber-900 font-baloo mb-2">
            Custom Requests
          </h1>
          <p className="text-amber-700 font-baloo text-lg">
            Personalized orders from your valued customers
          </p>
        </div>

        <div className={cn(craftStyles.card.default, "p-12 text-center")}>
          <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <MessageSquare className="w-8 h-8 text-amber-600" />
          </div>
          <h3 className="text-xl font-semibold text-amber-900 mb-2 font-baloo">
            Coming Soon
          </h3>
          <p className="text-amber-700 font-baloo max-w-md mx-auto">
            We're working on bringing you a seamless way to manage custom
            requests from your customers. Stay tuned for updates!
          </p>
        </div>
      </div>
    </div>
  );
}
