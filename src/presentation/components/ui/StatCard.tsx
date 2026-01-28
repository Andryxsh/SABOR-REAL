import React from 'react';
import Card from './Card';

interface StatCardProps {
    title: string;
    value: string | number;
    unit?: string;
    icon: string;
    color: 'emerald' | 'blue' | 'purple' | 'yellow' | 'rose';
    description?: string;
    isLoading?: boolean;
}

/**
 * StatCard (v2)
 * Componente para mostrar métricas financieras o estadísticas con estilo Neon.
 */
const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    unit = 'Bs',
    icon,
    color,
    description,
    isLoading = false,
}) => {
    // Definición de estilos dinámicos basados en el color
    const colorMap = {
        emerald: {
            border: 'border-emerald-500/30 hover:border-emerald-400/50',
            glow: 'bg-emerald-500/10',
            glowHover: 'group-hover:bg-emerald-500/25',
            iconColor: 'text-emerald-400',
            iconShadow: 'drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]',
            text: 'text-emerald-400/90',
            gradient: 'from-emerald-500/5 to-transparent'
        },
        blue: {
            border: 'border-blue-500/30 hover:border-blue-400/50',
            glow: 'bg-blue-500/10',
            glowHover: 'group-hover:bg-blue-500/25',
            iconColor: 'text-blue-400',
            iconShadow: 'drop-shadow-[0_0_8px_rgba(96,165,250,0.6)]',
            text: 'text-blue-400/90',
            gradient: 'from-blue-500/5 to-transparent'
        },
        purple: {
            border: 'border-purple-500/30 hover:border-purple-400/50',
            glow: 'bg-purple-500/10',
            glowHover: 'group-hover:bg-purple-500/25',
            iconColor: 'text-purple-400',
            iconShadow: 'drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]',
            text: 'text-purple-400/90',
            gradient: 'from-purple-500/5 to-transparent'
        },
        yellow: {
            border: 'border-yellow-500/30 hover:border-yellow-400/50',
            glow: 'bg-yellow-500/10',
            glowHover: 'group-hover:bg-yellow-500/25',
            iconColor: 'text-yellow-400',
            iconShadow: 'drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]',
            text: 'text-yellow-400/90',
            gradient: 'from-yellow-500/5 to-transparent'
        },
        rose: {
            border: 'border-rose-500/30 hover:border-rose-400/50',
            glow: 'bg-rose-500/10',
            glowHover: 'group-hover:bg-rose-500/25',
            iconColor: 'text-rose-400',
            iconShadow: 'drop-shadow-[0_0_8px_rgba(251,113,133,0.6)]',
            text: 'text-rose-400/90',
            gradient: 'from-rose-500/5 to-transparent'
        }
    };

    const theme = colorMap[color];

    return (
        <Card
            className={`p-5 relative overflow-hidden group transition-all duration-300 ${theme.border} bg-gradient-to-br ${theme.gradient}`}
        >
            {/* Background Glow Effect */}
            <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full blur-[50px] transition-all duration-500 ${theme.glow} ${theme.glowHover}`}></div>

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                    <span className={`material-symbols-outlined text-2xl ${theme.iconColor} ${theme.iconShadow}`}>
                        {icon}
                    </span>
                </div>

                <div className="flex items-baseline gap-1 animate-fade-in">
                    {isLoading ? (
                        <div className="h-9 w-20 bg-white/5 rounded-lg animate-pulse"></div>
                    ) : (
                        <>
                            <span className="text-3xl font-black text-white tracking-tight">
                                {value}
                            </span>
                            {unit && (
                                <span className="text-sm font-medium text-white/40 uppercase tracking-widest">{unit}</span>
                            )}
                        </>
                    )}
                </div>

                <div className={`text-[10px] font-bold tracking-widest mt-1.5 uppercase ${theme.text}`}>
                    {title}
                </div>

                {description && (
                    <p className="text-[9px] text-white/20 mt-2 line-clamp-1 italic font-medium">
                        {description}
                    </p>
                )}
            </div>
        </Card>
    );
};

export default StatCard;
