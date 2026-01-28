import React from 'react';

interface EventSearchBarProps {
    value: string;
    onChange: (val: string) => void;
}

/**
 * EventSearchBar (v2)
 * Barra de búsqueda modular con estilos premium.
 */
const EventSearchBar: React.FC<EventSearchBarProps> = ({ value, onChange }) => {
    return (
        <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-gray-500 group-focus-within:text-purple-400 transition-colors">search</span>
            </div>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Buscar evento, cliente o fecha..."
                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:bg-white/10 focus:border-purple-500/30 transition-all shadow-lg"
            />
        </div>
    );
};

export default EventSearchBar;
