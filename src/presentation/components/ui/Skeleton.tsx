import React from 'react';

interface SkeletonProps {
    className?: string; // Clases de Tailwind adicionales (w-*, h-*, rounded-*)
    variant?: 'text' | 'circular' | 'rectangular';
}

/**
 * Skeleton UI Component (v2)
 * Placeholder animado para estados de carga premium.
 */
const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'rectangular' }) => {
    const baseClasses = "animate-pulse bg-white/5 border border-white/5";

    let variantClasses = "";
    if (variant === 'circular') variantClasses = "rounded-full";
    if (variant === 'text') variantClasses = "rounded-lg h-4";
    if (variant === 'rectangular') variantClasses = "rounded-2xl";

    return (
        <div className={`${baseClasses} ${variantClasses} ${className}`}></div>
    );
};

export default Skeleton;
