import React, { useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

interface ToastProps {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  onClose: (id: string) => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({
  id,
  message,
  type,
  onClose,
  duration = 5000,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, onClose, duration]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5" />;
      case "error":
        return <AlertCircle className="w-5 h-5" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5" />;
      case "info":
        return <Info className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-100 border-green-500 text-green-800";
      case "error":
        return "bg-red-100 border-red-500 text-red-800";
      case "warning":
        return "bg-amber-100 border-amber-500 text-amber-800";
      case "info":
        return "bg-blue-100 border-blue-500 text-blue-800";
      default:
        return "bg-gray-100 border-gray-500 text-gray-800";
    }
  };

  return (
    <div
      className={`
      ${getStyles()} 
      border-l-4 p-4 rounded-r-lg shadow-md flex items-center justify-between 
      animate-in slide-in-from-right-full duration-300 ease-out
    `}
    >
      <div className="flex items-center">
        {getIcon()}
        <span className="ml-2 font-medium">{message}</span>
      </div>
      <button
        onClick={() => onClose(id)}
        className="ml-4 hover:opacity-70 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
