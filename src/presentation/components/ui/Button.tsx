import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    fullWidth?: boolean;
}

/**
 * Button (v2) 
 * Componente atómico con estilos neon y glassmorphism.
 */
const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    className = '',
    disabled,
    ...props
}) => {
    // Definición de estilos según variante
    const variants = {
        primary: `bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/20 hover:scale-[1.02] active:scale-95`,
        secondary: `bg-white/5 border border-white/10 text-white hover:bg-white/10 active:scale-95`,
        ghost: `bg-transparent text-gray-400 hover:text-white hover:bg-white/5`,
        danger: `bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20`,
        success: `bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20`,
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs rounded-xl',
        md: 'px-5 py-3 text-sm font-bold rounded-2xl',
        lg: 'px-8 py-4 text-base font-black rounded-3xl',
    };

    const baseStyles = `flex items-center justify-center gap-2 transition-all duration-200 outline-none disabled:opacity-50 disabled:pointer-events-none`;
    const widthStyle = fullWidth ? 'w-full' : '';

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
                <>
                    {leftIcon && <span className="flex items-center">{leftIcon}</span>}
                    {children}
                    {rightIcon && <span className="flex items-center">{rightIcon}</span>}
                </>
            )}
        </button>
    );
};

export default Button;
