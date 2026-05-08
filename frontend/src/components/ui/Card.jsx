import { cn } from "../../lib/utils";

export function Card({ className = "", children, ...props }) {
  return (
    <div
      className={cn("bg-white rounded-xl border border-gray-200 shadow-soft", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children }) {
  return (
    <div className={cn("px-6 py-4 border-b border-gray-100", className)}>
      {children}
    </div>
  );
}

export function CardBody({ className = "", children }) {
  return <div className={cn("px-6 py-4", className)}>{children}</div>;
}

export function CardFooter({ className = "", children }) {
  return (
    <div className={cn("px-6 py-4 border-t border-gray-100", className)}>
      {children}
    </div>
  );
}