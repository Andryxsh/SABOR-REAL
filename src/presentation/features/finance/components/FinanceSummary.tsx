import React from 'react';
import Card from '@/presentation/components/ui/Card';
import StatCard from '@/presentation/components/ui/StatCard';

interface FinanceSummaryProps {
    summary: {
        totalIncome: number;
        totalExpenses: number;
        balance: number;
    };
}

/**
 * FinanceSummary (v2)
 * Dashboard de alto nivel para el estado financiero.
 */
const FinanceSummary: React.FC<FinanceSummaryProps> = ({ summary }) => {
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Tarjeta Principal de Balance */}
            <Card className="bg-gradient-to-br from-[#0a0a0a] to-[#150a1b] border-white/5 shadow-2xl overflow-hidden relative group p-8">
                <div className="absolute -right-16 -top-16 size-64 bg-primary/10 rounded-full blur-3xl opacity-50 group-hover:bg-primary/20 transition-all"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left">
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-2">Balance General en Caja</p>
                        <h2 className="text-5xl font-black text-white tracking-tighter flex items-baseline gap-2">
                            {summary.balance.toLocaleString()}
                            <span className="text-sm font-normal text-white/20">Bs</span>
                        </h2>
                        <div className="mt-4 flex items-center gap-2 justify-center md:justify-start">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${summary.balance >= 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                }`}>
                                {summary.balance >= 0 ? 'Estado Saludable' : 'Déficit en Caja'}
                            </span>
                        </div>
                    </div>

                    <div className="size-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-primary shadow-xl">
                        <span className="material-symbols-outlined text-4xl">account_balance</span>
                    </div>
                </div>
            </Card>

            {/* Sub-totales */}
            <div className="grid grid-cols-2 gap-4">
                <StatCard
                    title="Total Ingresos"
                    value={summary.totalIncome}
                    icon="trending_up"
                    color="emerald"
                    description="Cobros y Adelantos"
                />
                <StatCard
                    title="Total Egresos"
                    value={summary.totalExpenses}
                    icon="trending_down"
                    color="rose"
                    description="Pagos y Gastos"
                />
            </div>
        </div>
    );
};

export default FinanceSummary;
