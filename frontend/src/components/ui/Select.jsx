import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const SelectContext = createContext(null);

const Select = ({ children, value, onValueChange, onChange, defaultValue, name, disabled, label, options, placeholder, ...props }) => {
    const [open, setOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(value !== undefined ? value : defaultValue || "");
    const [selectedLabel, setSelectedLabel] = useState("");
    const containerRef = useRef(null);

    // Sync with controlled value
    useEffect(() => {
        if (value !== undefined) {
            setSelectedValue(value);
        }
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (val, label) => {
        // If val is an object (event), ignore it here? No, val is explicitly passed from SelectItem
        setSelectedValue(val);
        setSelectedLabel(label);
        if (onValueChange) {
            onValueChange(val);
        }
        // Backward compatibility for onChange which expects an event
        if (onChange) {
            onChange({ target: { name, value: val } });
        }
        setOpen(false);
    };

    // Determine if we are in Legacy Mode
    const isLegacyOptions = Array.isArray(options) && options.length > 0;
    // We check if children are NOT the composable components. 
    // A heuristic: if children is an array and contains <option>, or single <option>
    const childrenArray = React.Children.toArray(children);
    const isLegacyChildren = childrenArray.some(child => child.type === 'option' || (child.props?.value !== undefined && child.type !== SelectTrigger && child.type !== SelectContent));

    const isLegacy = isLegacyOptions || isLegacyChildren;

    return (
        <SelectContext.Provider value={{ open, setOpen, selectedValue, selectedLabel, setSelectedLabel, handleSelect, disabled }}>
            <div className="relative w-full" ref={containerRef} {...props}>
                {name && <input type="hidden" name={name} value={selectedValue} />}
                {label && (
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">
                        {label}
                    </label>
                )}

                {isLegacy ? (
                    <>
                        <SelectTrigger>
                            <SelectValue placeholder={placeholder || "Select Option"} />
                        </SelectTrigger>
                        <SelectContent>
                            {isLegacyOptions ? (
                                options.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))
                            ) : (
                                childrenArray.map((child, idx) => {
                                    if (child.type === 'option' || (child.props && (child.props.value || child.props.children))) {
                                        const childValue = child.props.value !== undefined ? child.props.value : child.props.children;
                                        return (
                                            <SelectItem key={idx} value={childValue}>
                                                {child.props.children}
                                            </SelectItem>
                                        );
                                    }
                                    return child;
                                })
                            )}
                        </SelectContent>
                    </>
                ) : (
                    children
                )}
            </div>
        </SelectContext.Provider>
    );
};

const SelectTrigger = ({ children, className = "" }) => {
    const { open, setOpen, disabled } = useContext(SelectContext);
    return (
        <button
            type="button"
            onClick={() => !disabled && setOpen(!open)}
            disabled={disabled}
            className={`flex h-12 w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ${className}`}
        >
            {children}
            <ChevronDown className={`h-4 w-4 opacity-50 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>
    );
};

const SelectValue = ({ placeholder }) => {
    const { selectedValue, selectedLabel } = useContext(SelectContext);

    return (
        <span className={`block truncate ${!selectedValue ? 'text-gray-500' : 'text-secondary'}`}>
            {selectedLabel || selectedValue || placeholder}
        </span>
    );
};

const SelectContent = ({ children, className = "" }) => {
    const { open } = useContext(SelectContext);

    if (!open) return null;

    return (
        <div className={`absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 top-[calc(100%+5px)] w-full ${className}`}>
            <div className="p-1 max-h-[300px] overflow-y-auto">
                {children}
            </div>
        </div>
    );
};

const SelectItem = ({ value, children, className = "" }) => {
    const { selectedValue, handleSelect, setSelectedLabel } = useContext(SelectContext);
    const isSelected = selectedValue == value; // Loose equality for number/string mismatch

    useEffect(() => {
        if (isSelected) {
            const label = typeof children === 'string' ? children :
                children?.props?.children || value;
            setSelectedLabel(label);
        }
    }, [isSelected, children, value, setSelectedLabel]);

    return (
        <div
            onClick={(e) => {
                e.stopPropagation();
                handleSelect(value, children);
            }}
            className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-2.5 pl-8 pr-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${isSelected ? 'bg-primary/5 text-primary font-medium' : 'text-secondary'} ${className}`}
        >
            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                {isSelected && <Check className="h-4 w-4" />}
            </span>
            <span className="truncate">{children}</span>
        </div>
    );
};

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
export default Select;
