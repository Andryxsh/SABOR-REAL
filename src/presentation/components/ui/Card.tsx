import React from 'react';

interface CardProps {
    children: React.ReactNode;
    variant?: 'glass' | 'solid' | 'neon';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    className?: string;
    onClick?: () => void;
    hover?: boolean;
}

/**
 * Card (v2)
 * Componente base para contenedores con estética Glassmorphism.
 */
const Card: React.FC<CardProps> = ({
    children,
    variant = 'glass',
    padding = 'md',
    className = '',
    onClick,
    hover = false,
}) => {
    const variants = {
        glass: 'bg-black/40 backdrop-blur-xl border border-white/5',
        solid: 'bg-surface-dark border border-white/5',
        neon: 'bg-black/40 backdrop-blur-xl border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]',
    };

    const paddings = {
        none: 'p-0',
        sm: 'p-3',
        md: 'p-5',
        lg: 'p-8',
    };

    const hoverStyle = hover ? 'hover:scale-[1.01] hover:bg-white/5 hover:border-white/10 transition-all duration-300' : '';
    const clickStyle = onClick ? 'cursor-pointer active:scale-95' : '';

    return (
        <div
            className={`rounded-3xl ${variants[variant]} ${paddings[padding]} ${hoverStyle} ${clickStyle} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

export default Card;
