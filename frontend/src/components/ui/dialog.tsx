"use client";

import * as React from "react";
import ReactDOM from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type DialogContextType = {
  open: boolean;
  setOpen: (v: boolean) => void;
};

const DialogContext = React.createContext<DialogContextType | null>(null);

function Dialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return (
    <DialogContext.Provider value={{ open, setOpen }}>{children}</DialogContext.Provider>
  );
}

function DialogTrigger({ children, asChild = false }: { children: React.ReactNode; asChild?: boolean }) {
  const ctx = React.useContext(DialogContext);
  if (!ctx) return null;

  // If asChild is true we expect a single React element child we can clone and attach handlers to.
  if (asChild) {
    const child = React.Children.only(children) as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>;
    const onClick = (e: React.MouseEvent) => {
      if (child.props && typeof (child.props as any).onClick === "function") (child.props as any).onClick(e);
      ctx.setOpen(true);
    };
    return React.cloneElement(child, { onClick });
  }

  // Otherwise wrap the children in a native button that opens the dialog.
  const onClick = () => {
    ctx.setOpen(true);
  };

  return (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  );
}

function DialogPortal({ children }: { children: React.ReactNode }) {
  if (typeof document === "undefined") return null;
  return ReactDOM.createPortal(children, document.body);
}

function DialogClose({ children, asChild = false }: { children: React.ReactNode; asChild?: boolean }) {
  const ctx = React.useContext(DialogContext);
  if (!ctx) return null;

  if (asChild) {
    const child = React.Children.only(children) as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>;
    const onClick = (e: React.MouseEvent) => {
      if (child.props && typeof (child.props as any).onClick === "function") (child.props as any).onClick(e);
      ctx.setOpen(false);
    };
    return React.cloneElement(child, { onClick });
  }

  return (
    <button type="button" onClick={() => ctx.setOpen(false)}>
      {children}
    </button>
  );
}

const DialogContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const ctx = React.useContext(DialogContext);
    if (!ctx) return null;
    if (!ctx.open) return null;

    return (
      <DialogPortal>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" aria-hidden />
          <div
            ref={ref}
            className={cn("relative z-10 w-full max-w-lg rounded-lg bg-white p-6 shadow-lg", className)}
            {...props}
          >
            {children}
            <button
              aria-label="Close"
              onClick={() => ctx.setOpen(false)}
              className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </DialogPortal>
    );
  }
);
DialogContent.displayName = "DialogContent";

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
));
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
DialogDescription.displayName = "DialogDescription";

export {
  Dialog,
  DialogPortal,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};