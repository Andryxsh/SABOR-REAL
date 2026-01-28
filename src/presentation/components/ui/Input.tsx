import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

/**
 * Input (v2)
 * Campo de texto modular con soporte para iconos y validaciones.
 */
const Input: React.FC<InputProps> = ({
    label,
    error,
    icon,
    className = '',
    ...props
}) => {
    return (
        <div className="w-full space-y-1.5">
            {label && (
                <label className="block text-gray-400 text-xs font-bold mb-1.5 ml-1 uppercase tracking-wider">
                    {label}
                </label>
            )}
            <div className="relative group">
                {icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors">
                        {icon}
                    </div>
                )}
                <input
                    className={`
                        w-full bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/20 
                        focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all duration-200
                        ${icon ? 'pl-11' : 'px-4'} py-3.5
                        ${error ? 'border-rose-500/50 focus:border-rose-500' : ''}
                        ${className}
                    `}
                    {...props}
                />
            </div>
            {error && (
                <p className="text-rose-400 text-[10px] font-bold ml-1 animate-fade-in">
                    {error}
                </p>
            )}
        </div>
    );
};

export default Input;
