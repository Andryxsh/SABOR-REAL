import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface Option {
    value: string;
    label: string;
    subtitle?: string; // For roles, descriptions, etc.
}

interface CustomSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: Option[];
    placeholder?: string;
    label?: string;
    icon?: string;
    className?: string; // For wrapper margin etc
}

export default function CustomSelect({
    value,
    onChange,
    options,
    placeholder = 'Seleccionar...',
    label,
    icon,
    className = ''
}: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    // Initial value validation
    const selectedOption = options.find(opt => opt.value === value);

    const updateCoords = () => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            // Check if space below is sufficient, else flip? (Complex, sticking to simpler 'below' for now)
            setCoords({
                top: rect.bottom + window.scrollY + 8, // 8px gap
                left: rect.left + window.scrollX,
                width: rect.width
            });
        }
    };

    const toggleOpen = () => {
        if (!isOpen) {
            updateCoords();
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    };

    // Close on click outside and scroll/resize
    useEffect(() => {
        if (!isOpen) return;

        // Handler for closing on scroll/resize
        const handleScroll = () => setIsOpen(false);
        const handleResize = () => setIsOpen(false);

        window.addEventListener('scroll', handleScroll, true); // Capture phase for all scrolls
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('scroll', handleScroll, true);
            window.removeEventListener('resize', handleResize);
        };
    }, [isOpen]);

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {label && (
                <label className="block text-gray-400 text-xs font-bold mb-1.5 ml-1 uppercase tracking-wider">
                    {label}
                </label>
            )}

            {/* Trigger Button */}
            <button
                type="button"
                onClick={toggleOpen}
                className={`w-full px-4 py-3 bg-white/5 border ${isOpen ? 'border-yellow-500/50 bg-white/10' : 'border-white/10'} rounded-xl text-left flex items-center justify-between transition-all focus:outline-none group`}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    {icon && (
                        <span className={`material-symbols-outlined text-lg ${isOpen ? 'text-yellow-400' : 'text-gray-500 group-hover:text-gray-300'}`}>
                            {icon}
                        </span>
                    )}
                    <div className="flex flex-col truncate">
                        <span className={`font-medium truncate ${selectedOption ? 'text-white' : 'text-gray-500'}`}>
                            {selectedOption ? selectedOption.label : placeholder}
                        </span>
                    </div>
                </div>

                <span className={`material-symbols-outlined text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-yellow-400' : ''}`}>
                    expand_more
                </span>
            </button>

            {/* Portal Dropdown */}
            {isOpen && createPortal(
                <>
                    {/* Backdrop to handle outside clicks */}
                    <div
                        className="fixed inset-0 z-[9998]"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown Menu */}
                    <div
                        className="fixed z-[9999] bg-[#0a0a0a] border border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden animate-fade-in origin-top ring-1 ring-white/5"
                        style={{
                            top: `${coords.top - window.scrollY}px`, // Fixed uses viewport relative
                            left: `${coords.left}px`,
                            width: `${coords.width}px`
                        }}
                    >
                        <div className="max-h-60 overflow-y-auto custom-scrollbar p-1.5 space-y-0.5">
                            {options.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent backdrop click logic
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${value === option.value
                                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/10'
                                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <div>
                                        <div className="font-semibold">{option.label}</div>
                                        {option.subtitle && (
                                            <div className="text-[10px] opacity-60 font-medium uppercase tracking-wide mt-0.5">
                                                {option.subtitle}
                                            </div>
                                        )}
                                    </div>
                                    {value === option.value && (
                                        <span className="material-symbols-outlined text-lg">check</span>
                                    )}
                                </button>
                            ))}

                            {options.length === 0 && (
                                <div className="px-4 py-3 text-center text-gray-500 text-xs">
                                    No hay opciones disponibles
                                </div>
                            )}
                        </div>
                    </div>
                </>,
                document.body
            )}
        </div>
    );
}
