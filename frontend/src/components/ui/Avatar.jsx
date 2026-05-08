import { cn } from "../../lib/utils";

export function Avatar({ name, size = "md", className = "" }) {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg",
  };

  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-primary-100 text-primary-700 font-semibold",
        sizes[size],
        className
      )}
    >
      {initials}
    </div>
  );
}