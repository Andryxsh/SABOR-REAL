import React from 'react';
import UserMenu from '@/presentation/components/ui/UserMenu';

/**
 * Header (v2) - Clean Refactor
 * Componente puramente presentacional que delega la lógica de usuario a UserMenu.
 */
const HeaderV2: React.FC = () => {
    return (
        <header className="absolute top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between shrink-0 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">

            {/* Logo Section */}
            <div className="flex items-center gap-3">
                <div className="size-14 bg-white/5 rounded-full border border-white/10 flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.1)] group cursor-pointer hover:bg-white/10 transition-colors overflow-visible">
                    <img
                        src="/assets/logo.webp"
                        alt="Sabor Real"
                        className="size-12 object-contain drop-shadow-lg group-hover:scale-110 transition-transform"
                    />
                </div>
                <div>
                    <h1 className="text-xl font-black text-white tracking-tighter leading-none flex items-center gap-2">
                        Sabor Real
                        <span className="px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[8px] tracking-wide border border-purple-500/30">PRO</span>
                    </h1>
                    <p className="text-[9px] text-white/40 font-black uppercase tracking-[0.3em]">System v2.0</p>
                </div>
            </div>

            {/* User Actions */}
            <UserMenu />
        </header>
    );
};

export default HeaderV2;
