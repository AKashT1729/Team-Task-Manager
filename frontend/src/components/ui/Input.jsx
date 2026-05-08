import { cn } from "../../lib/utils";

export function Input({
  label,
  error,
  className = "",
  ...props
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      )}
      <input
        className={cn(
          "w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900",
          "placeholder:text-gray-400",
          "focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none",
          "transition-all duration-200",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function Select({
  label,
  error,
  options = [],
  className = "",
  ...props
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      )}
      <select
        className={cn(
          "w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900",
          "focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none",
          "transition-all duration-200",
          error && "border-red-500",
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function Textarea({
  label,
  error,
  rows = 4,
  className = "",
  ...props
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      )}
      <textarea
        rows={rows}
        className={cn(
          "w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900",
          "placeholder:text-gray-400",
          "focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none",
          "transition-all duration-200 resize-none",
          error && "border-red-500",
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}