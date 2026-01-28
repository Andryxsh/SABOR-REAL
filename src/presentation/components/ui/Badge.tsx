import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'ghost';
    size?: 'xs' | 'sm';
    pulse?: boolean;
    className?: string;
}

/**
 * Badge (v2)
 * Pequeña etiqueta para estados (Confirmado, Pendiente, etc.) con estilo Neon.
 */
const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'primary',
    size = 'sm',
    pulse = false,
    className = '',
}) => {
    const variants = {
        primary: 'bg-purple-500/20 text-purple-200 border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.2)]',
        success: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]',
        warning: 'bg-yellow-500/10 text-yellow-200 border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.1)]',
        error: 'bg-rose-500/20 text-rose-200 border-rose-500/40 shadow-[0_0_10px_rgba(251,113,133,0.2)]',
        info: 'bg-blue-500/20 text-blue-200 border-blue-500/40 shadow-[0_0_10px_rgba(59,130,246,0.2)]',
        ghost: 'bg-white/5 text-white/50 border-white/10',
    };

    const sizes = {
        xs: 'px-1.5 py-0.5 text-[8px]',
        sm: 'px-2.5 py-1 text-[10px]',
    };

    return (
        <div className={`
            inline-flex items-center font-black uppercase tracking-wider rounded-full border
            ${variants[variant]} ${sizes[size]} 
            ${pulse ? 'animate-pulse' : ''}
            ${className}
        `}>
            {children}
        </div>
    );
};

export default Badge;
