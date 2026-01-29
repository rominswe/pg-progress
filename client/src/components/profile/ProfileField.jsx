import React from 'react';
import { cn } from "@/lib/utils";

/**
 * Shared component for displaying profile information in a consistent "Info Card" style.
 * Supports read-only display and can be used as a trigger for Select or Popover.
 */
const ProfileField = React.forwardRef(({
    label,
    value,
    icon: Icon,
    children,
    className,
    readOnly = false,
    onClick,
    suffix,
    placeholder = "Not Provided",
    ...props
}, ref) => {
    const hasValue = value && value !== "" && value !== "Not Provided";
    const hasChildren = !!children;

    const content = hasChildren ? children :
        hasValue ? value :
        <span className="text-slate-400 font-medium italic">{placeholder}</span>;

    return (
        <div
            ref={ref}
            className={cn(
                "space-y-1.5 w-full",
                className
            )}
            onClick={onClick}
            {...props}
        >
            {label && (
                <label className="text-[13px] font-semibold text-slate-500 ml-1 block">
                    {label}
                </label>
            )}
            <div className={cn(
                "relative flex items-center min-h-[44px] rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2 transition-all focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary/30 group",
                !readOnly && "hover:border-slate-200 cursor-text",
                readOnly && "bg-slate-50/30 cursor-default"
            )}>
                {Icon && (
                    <Icon className="h-4 w-4 text-slate-400 mr-3 shrink-0" />
                )}
                <div className="flex-1 min-w-0 flex items-center text-[14px] font-bold text-slate-700">
                    {content}
                </div>
                {suffix && (
                    <span className="ml-3 text-slate-400 flex items-center">
                        {suffix}
                    </span>
                )}
            </div>
        </div>
    );
});

ProfileField.displayName = "ProfileField";

export default ProfileField;
