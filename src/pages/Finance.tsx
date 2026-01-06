import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { Expense, Payment } from '../context/AppContext';
import CustomSelect from '../components/CustomSelect';

export default function Finance() {
    const navigate = useNavigate();
    const location = useLocation();
    const { events, musicians, payments, expenses, addPayment, addExpense, loading } = useApp();

    const [filter, setFilter] = useState<'all' | 'payments' | 'expenses'>('all');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showExpenseModal, setShowExpenseModal] = useState(false);

    // Pagination State
    const [visibleCount, setVisibleCount] = useState(3);
    const [visibleEventsCount, setVisibleEventsCount] = useState(3);

    // Initial check for navigation state
    useEffect(() => {
        if (location.state?.openPaymentModal) {
            setShowPaymentModal(true);
            // Clean state to avoid reopening on refresh (optional but good practice)
            window.history.replaceState({}, document.title);
        }
        if (location.state?.openExpenseModal) {
            setShowExpenseModal(true);
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    // Payment form
    const [paymentMusicianId, setPaymentMusicianId] = useState('');
    const [paymentMonto, setPaymentMonto] = useState('');
    const [paymentTipo, setPaymentTipo] = useState<Payment['tipo']>('evento');
    const [paymentMetodo, setPaymentMetodo] = useState<Payment['metodoPago']>('efectivo');
    const [paymentNotas, setPaymentNotas] = useState('');

    // Expense form
    const [expenseConcepto, setExpenseConcepto] = useState('');
    const [expenseMonto, setExpenseMonto] = useState('');
    const [expenseCategoria, setExpenseCategoria] = useState<Expense['categoria']>('transporte');
    const [expenseNotas, setExpenseNotas] = useState('');

    const stats = useMemo(() => {
        const totalIngresos = events
            .filter(e => e.status === 'Confirmado' || e.status === 'Finalizado')
            .reduce((sum, e) => sum + e.precio, 0);

        const totalGastos = expenses.reduce((sum, e) => sum + e.monto, 0);
        const totalPagos = payments.reduce((sum, p) => sum + p.monto, 0);

        const balance = totalIngresos - totalGastos - totalPagos;

        return { totalIngresos, totalGastos, totalPagos, balance };
    }, [events, expenses, payments]);

    const handleAddPayment = async () => {
        if (!paymentMusicianId || !paymentMonto) {
            alert('Por favor completa músico y monto');
            return;
        }

        try {
            const newPayment: any = {
                musicianId: paymentMusicianId,
                monto: parseFloat(paymentMonto),
                tipo: paymentTipo,
                fecha: new Date().toISOString().split('T')[0],
                metodoPago: paymentMetodo,
            };

            if (paymentNotas) newPayment.notas = paymentNotas;

            await addPayment(newPayment);

            setShowPaymentModal(false);
            setPaymentMusicianId('');
            setPaymentMonto('');
            setPaymentTipo('evento');
            setPaymentMetodo('efectivo');
            setPaymentNotas('');
        } catch (error) {
            console.error(error);
            alert('Error al registrar pago');
        }
    };

    const handleAddExpense = async () => {
        if (!expenseConcepto || !expenseMonto) {
            alert('Por favor completa concepto y monto');
            return;
        }

        try {
            const newExpense: any = {
                concepto: expenseConcepto,
                monto: parseFloat(expenseMonto),
                categoria: expenseCategoria,
                fecha: new Date().toISOString().split('T')[0],
            };

            if (expenseNotas) newExpense.notas = expenseNotas;

            await addExpense(newExpense);

            setShowExpenseModal(false);
            setExpenseConcepto('');
            setExpenseMonto('');
            setExpenseCategoria('transporte');
            setExpenseNotas('');
        } catch (error) {
            console.error(error);
            alert('Error al registrar gasto');
        }
    };

    const filteredTransactions = useMemo(() => {
        const all = [
            ...payments.map(p => ({ ...p, type: 'payment' as const, date: p.createdAt })),
            ...expenses.map(e => ({ ...e, type: 'expense' as const, date: e.createdAt }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        if (filter === 'payments') return all.filter(t => t.type === 'payment');
        if (filter === 'expenses') return all.filter(t => t.type === 'expense');
        return all;
    }, [payments, expenses, filter]);

    // Reset pagination when filter changes
    useEffect(() => {
        setVisibleCount(3);
    }, [filter]);

    const visibleTransactions = filteredTransactions.slice(0, visibleCount);

    // Event Income Logic
    const incomeEvents = useMemo(() => {
        return events
            .filter(e => ['Confirmado', 'Finalizado'].includes(e.status))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [events]);

    const visibleEvents = incomeEvents.slice(0, visibleEventsCount);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-background-dark">
                <div className="text-gray-400">Cargando...</div>
            </div>
        );
    }

    return (
        <div className="relative z-10 min-h-screen pb-20">
            {/* Header Glass - Compacto */}
            <header className="sticky top-0 z-40 bg-black/60 backdrop-blur-xl border-b border-white/5 px-4 h-16 flex items-center justify-between shrink-0">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center justify-center size-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all hover:scale-105 active:scale-95 group">
                    <span className="material-symbols-outlined text-xl group-hover:-translate-x-1 transition-transform">arrow_back_ios_new</span>
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Control</span>
                    <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-emerald-400 to-emerald-200 animate-text-flow">Finanzas</h1>
                </div>
                <div className="w-10"></div>
            </header>

            <div className="px-4 pt-6 space-y-6">
                {/* Balance Summary Card - Neon Premium */}
                <div className="relative bg-black/40 backdrop-blur-xl border border-emerald-500/30 rounded-[2rem] p-6 text-center overflow-hidden group shadow-[0_0_40px_rgba(16,185,129,0.1)]">
                    {/* Background Effects */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-50"></div>
                    <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl -ml-20 -mb-20 animate-pulse delay-700"></div>

                    <div className="relative z-10">
                        <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-3">Balance General</span>

                        <p className={`text-5xl font-extrabold mb-1 tracking-tighter drop-shadow-[0_0_15px_rgba(0,0,0,0.5)] ${stats.balance >= 0 ? 'text-white' : 'text-red-400'
                            }`}>
                            <span className="text-2xl align-top opacity-50 mr-1">Bs</span>
                            {stats.balance.toFixed(0)}
                        </p>
                        <p className="text-xs text-gray-400 font-medium mb-6">Total Disponible</p>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-black/40 border border-white/5 rounded-2xl p-3 backdrop-blur-sm hover:bg-white/5 transition-colors">
                                <div className="text-[10px] text-gray-400 mb-1 font-bold uppercase">Ingresos</div>
                                <div className="text-emerald-400 font-bold text-sm drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]">+{stats.totalIngresos}</div>
                            </div>
                            <div className="bg-black/40 border border-white/5 rounded-2xl p-3 backdrop-blur-sm hover:bg-white/5 transition-colors">
                                <div className="text-[10px] text-gray-400 mb-1 font-bold uppercase">Gastos</div>
                                <div className="text-red-400 font-bold text-sm drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]">-{stats.totalGastos}</div>
                            </div>
                            <div className="bg-black/40 border border-white/5 rounded-2xl p-3 backdrop-blur-sm hover:bg-white/5 transition-colors">
                                <div className="text-[10px] text-gray-400 mb-1 font-bold uppercase">Pagos</div>
                                <div className="text-yellow-400 font-bold text-sm drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]">-{stats.totalPagos}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions - Glass Buttons */}
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => setShowPaymentModal(true)}
                        className="group relative flex flex-col items-center justify-center gap-3 bg-black/40 backdrop-blur-md border border-yellow-500/30 hover:border-yellow-500/60 p-5 rounded-3xl transition-all hover:bg-yellow-500/10 active:scale-95">
                        <div className="size-12 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500/30 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                            <span className="material-symbols-outlined text-yellow-400 text-2xl">payments</span>
                        </div>
                        <span className="text-xs font-bold text-yellow-100 uppercase tracking-wide">Pagar Músico</span>
                    </button>

                    <button
                        onClick={() => setShowExpenseModal(true)}
                        className="group relative flex flex-col items-center justify-center gap-3 bg-black/40 backdrop-blur-md border border-red-500/30 hover:border-red-500/60 p-5 rounded-3xl transition-all hover:bg-red-500/10 active:scale-95">
                        <div className="size-12 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                            <span className="material-symbols-outlined text-red-400 text-2xl">remove_circle</span>
                        </div>
                        <span className="text-xs font-bold text-red-100 uppercase tracking-wide">Registrar Gasto</span>
                    </button>
                </div>



                {/* SECTION: INGRESOS POR EVENTO */}
                <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                        <span className="w-1.5 h-6 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]"></span>
                        Ingresos por Evento
                    </h2>

                    <div className="space-y-3">
                        {visibleEvents.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-6 text-white/30 bg-black/20 backdrop-blur-sm rounded-3xl border border-white/5">
                                <span className="material-symbols-outlined text-3xl mb-2 opacity-50">event_busy</span>
                                <p className="text-xs font-medium">No hay eventos recientes</p>
                            </div>
                        ) : (
                            visibleEvents.map(event => (
                                <div
                                    key={`income-${event.id}`}
                                    className="group flex items-center gap-4 p-4 bg-emerald-900/10 backdrop-blur-md rounded-2xl border border-emerald-500/10 hover:bg-emerald-500/20 hover:border-emerald-500/30 transition-all">
                                    <div className="size-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                                        <span className="material-symbols-outlined text-emerald-400 text-xl">event</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-white text-sm mb-0.5 truncate">
                                            {event.title}
                                        </div>
                                        <div className="text-[10px] text-emerald-200/60 font-medium uppercase tracking-wide flex items-center gap-2">
                                            <span>{event.date}</span>
                                            {event.cliente?.nombre && (
                                                <>
                                                    <span className="w-1 h-1 bg-emerald-500/30 rounded-full"></span>
                                                    <span className="truncate max-w-[100px]">{event.cliente.nombre}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <div className="text-sm font-bold text-emerald-400 shadow-emerald-500/50 drop-shadow-sm">+{event.precio}</div>
                                        <div className="text-[10px] text-gray-500">Bs</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Load More Events Button */}
                    {visibleEventsCount < incomeEvents.length && (
                        <div className="mt-4 flex justify-center">
                            <button
                                onClick={() => setVisibleEventsCount(prev => prev + 3)}
                                className="px-5 py-2 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 transition-all border border-emerald-500/20 flex items-center gap-2 group">
                                <span className="text-[10px] font-bold uppercase tracking-wider">Ver más eventos</span>
                                <span className="material-symbols-outlined text-sm group-hover:translate-y-0.5 transition-transform">expand_more</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Filters */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]"></span>
                            Movimientos
                        </h2>

                        <div className="flex bg-white/5 rounded-full p-1 border border-white/10">
                            {[
                                { key: 'all', label: 'Todos' },
                                { key: 'payments', label: 'Pagos' },
                                { key: 'expenses', label: 'Gastos' },
                            ].map(f => (
                                <button
                                    key={f.key}
                                    onClick={() => setFilter(f.key as any)}
                                    className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full transition-all ${filter === f.key
                                        ? 'bg-emerald-500 text-white shadow-lg'
                                        : 'text-gray-400 hover:text-white'
                                        }`}>
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Transactions List */}
                    <div className="space-y-3">
                        {visibleTransactions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-white/30 bg-black/20 backdrop-blur-sm rounded-3xl border border-white/5">
                                <span className="material-symbols-outlined text-4xl mb-2 opacity-50">receipt_long</span>
                                <p className="text-sm font-medium">No hay movimientos registrados</p>
                            </div>
                        ) : (
                            visibleTransactions.map(transaction => {
                                if (transaction.type === 'payment') {
                                    const musician = musicians.find(m => m.id === transaction.musicianId);
                                    return (
                                        <div
                                            key={`payment-${transaction.id}`}
                                            className="group flex items-center gap-4 p-4 bg-black/40 backdrop-blur-md rounded-2xl border border-white/5 hover:bg-white/5 hover:border-yellow-500/30 transition-all">
                                            <div className="size-10 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0 border border-yellow-500/20 group-hover:scale-110 transition-transform">
                                                <span className="material-symbols-outlined text-yellow-400 text-xl">payments</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-white text-sm mb-0.5">
                                                    {musician?.nombre || 'Músico'} <span className="text-yellow-400/80 font-normal text-xs capitalize">- {transaction.tipo}</span>
                                                </div>
                                                <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wide flex items-center gap-2">
                                                    <span className="bg-white/5 px-1.5 py-0.5 rounded text-gray-300">{transaction.metodoPago}</span>
                                                    <span>{transaction.date}</span>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <div className="text-sm font-bold text-yellow-400 shadow-yellow-500/50 drop-shadow-sm">-{transaction.monto}</div>
                                                <div className="text-[10px] text-gray-500">Bs</div>
                                            </div>
                                        </div>
                                    );
                                } else {
                                    return (
                                        <div
                                            key={`expense-${transaction.id}`}
                                            className="group flex items-center gap-4 p-4 bg-black/40 backdrop-blur-md rounded-2xl border border-white/5 hover:bg-white/5 hover:border-red-500/30 transition-all">
                                            <div className="size-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0 border border-red-500/20 group-hover:scale-110 transition-transform">
                                                <span className="material-symbols-outlined text-red-400 text-xl">
                                                    {transaction.categoria === 'transporte' ? 'local_taxi' :
                                                        transaction.categoria === 'alimentacion' ? 'restaurant' :
                                                            transaction.categoria === 'equipo' ? 'speaker' :
                                                                'shopping_bag'}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-white text-sm mb-0.5">
                                                    {transaction.concepto}
                                                </div>
                                                <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wide flex items-center gap-2">
                                                    <span className="bg-red-500/10 text-red-300 px-1.5 py-0.5 rounded border border-red-500/10">{transaction.categoria}</span>
                                                    <span>{transaction.date}</span>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <div className="text-sm font-bold text-red-400 shadow-red-500/50 drop-shadow-sm">-{transaction.monto}</div>
                                                <div className="text-[10px] text-gray-500">Bs</div>
                                            </div>
                                        </div>
                                    );
                                }
                            })
                        )}
                    </div>

                    {/* Load More Button */}
                    {visibleCount < filteredTransactions.length && (
                        <div className="mt-4 flex justify-center">
                            <button
                                onClick={() => setVisibleCount(prev => prev + 5)}
                                className="px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all border border-white/5 flex items-center gap-2 group">
                                <span className="text-xs font-bold uppercase tracking-wider">Ver más movimientos</span>
                                <span className="material-symbols-outlined text-lg group-hover:translate-y-1 transition-transform">expand_more</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Payment Modal */}
            {
                showPaymentModal && createPortal(
                    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm animate-fade-in flex items-end justify-center sm:items-center p-0 sm:p-4">
                        <div className="w-full sm:max-w-md bg-[#0a0a0a] sm:rounded-3xl rounded-t-3xl border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-slide-up will-change-transform">
                            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-yellow-400">payments</span>
                                    Registrar Pago
                                </h2>
                                <button
                                    onClick={() => setShowPaymentModal(false)}
                                    className="size-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition-colors">
                                    <span className="material-symbols-outlined text-lg">close</span>
                                </button>
                            </div>

                            <div className="overflow-y-auto p-6 space-y-4 custom-scrollbar">
                                <div>
                                    <CustomSelect
                                        label="MÚSICO *"
                                        value={paymentMusicianId}
                                        onChange={setPaymentMusicianId}
                                        options={musicians.map(m => ({
                                            value: m.id,
                                            label: `${m.nombre} ${m.apellido || ''}`,
                                            subtitle: m.role
                                        }))}
                                        placeholder="Seleccionar integrante..."
                                        icon="person"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-400 text-xs font-bold mb-1.5 ml-1">MONTO (BS) *</label>
                                        <input
                                            type="number"
                                            value={paymentMonto}
                                            onChange={(e) => setPaymentMonto(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-yellow-400 font-bold placeholder-white/10 focus:outline-none focus:border-yellow-500/50 focus:bg-white/10"
                                        />
                                    </div>
                                    <div>
                                        <CustomSelect
                                            label="TIPO"
                                            value={paymentTipo}
                                            onChange={(val) => setPaymentTipo(val as Payment['tipo'])}
                                            options={[
                                                { value: 'evento', label: 'Pago de Evento' },
                                                { value: 'adelanto', label: 'Adelanto' },
                                                { value: 'ajuste', label: 'Ajuste' },
                                                { value: 'descuento', label: 'Descuento' }
                                            ]}
                                            icon="category"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <CustomSelect
                                        label="MÉTODO DE PAGO"
                                        value={paymentMetodo}
                                        onChange={(val) => setPaymentMetodo(val as Payment['metodoPago'])}
                                        options={[
                                            { value: 'efectivo', label: 'Efectivo', subtitle: 'Pago directo' },
                                            { value: 'transferencia', label: 'Transferencia', subtitle: 'Banco / QR' }
                                        ]}
                                        icon="payments"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-400 text-xs font-bold mb-1.5 ml-1">NOTAS</label>
                                    <textarea
                                        value={paymentNotas}
                                        onChange={(e) => setPaymentNotas(e.target.value)}
                                        placeholder="Detalles adicionales..."
                                        rows={2}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-yellow-500/50 focus:bg-white/10 resize-none"
                                    />
                                </div>

                                {/* Balance Simulation Feedback */}
                                {paymentMusicianId && paymentMonto && (() => {
                                    const mId = paymentMusicianId;
                                    const amount = parseFloat(paymentMonto) || 0;

                                    // Calculate CURRENT Balance (Same logic as Musicians.tsx)
                                    const totalEarned = events.reduce((sum, ev) => {
                                        const assigned = ev.musicosAsignados.find(m => m.musicianId === mId && m.asistio);
                                        return sum + (assigned ? assigned.montoPagar : 0);
                                    }, 0);
                                    const totalPaid = payments.filter(p => p.musicianId === mId).reduce((sum, p) => sum + p.monto, 0);
                                    const currentBalance = totalEarned - totalPaid; // Positive = You owe musician

                                    // Calculate NEW Balance
                                    const newBalance = currentBalance - amount;

                                    return (
                                        <div className="p-3 bg-black/40 rounded-xl border border-white/10">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-gray-400">Saldo actual:</span>
                                                <span className={currentBalance >= 0 ? 'text-yellow-400' : 'text-blue-400'}>
                                                    {currentBalance > 0 ? `Debes ${currentBalance}` : `Adelanto ${Math.abs(currentBalance)}`}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Resultado:</span>
                                                <span className={`text-sm font-bold ${newBalance === 0 ? 'text-emerald-400' :
                                                    newBalance > 0 ? 'text-yellow-400' : 'text-blue-400'
                                                    }`}>
                                                    {newBalance === 0 ? '✅ Cuentas saldadas' :
                                                        newBalance > 0 ? `Te faltará pagar: ${newBalance} Bs` :
                                                            `El músico quedará debiendo: ${Math.abs(newBalance)} Bs`}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })()}

                                <div className="pt-4 border-t border-white/10">
                                    <button
                                        onClick={handleAddPayment}
                                        className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-all flex items-center justify-center gap-2 transform active:scale-95">
                                        <span className="material-symbols-outlined">save</span>
                                        Registrar Pago
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>,
                    document.body
                )
            }

            {/* Expense Modal */}
            {
                showExpenseModal && createPortal(
                    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm animate-fade-in flex items-end justify-center sm:items-center p-0 sm:p-4">
                        <div className="w-full sm:max-w-md bg-[#0a0a0a] sm:rounded-3xl rounded-t-3xl border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-slide-up will-change-transform">
                            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-red-500">remove_circle</span>
                                    Registrar Gasto
                                </h2>
                                <button
                                    onClick={() => setShowExpenseModal(false)}
                                    className="size-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition-colors">
                                    <span className="material-symbols-outlined text-lg">close</span>
                                </button>
                            </div>

                            <div className="overflow-y-auto p-6 space-y-4 custom-scrollbar">
                                <div>
                                    <label className="block text-gray-400 text-xs font-bold mb-1.5 ml-1">CONCEPTO *</label>
                                    <input
                                        type="text"
                                        value={expenseConcepto}
                                        onChange={(e) => setExpenseConcepto(e.target.value)}
                                        placeholder="Ej: Taxi, Comida..."
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-red-500/50 focus:bg-white/10"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-400 text-xs font-bold mb-1.5 ml-1">MONTO (BS) *</label>
                                        <input
                                            type="number"
                                            value={expenseMonto}
                                            onChange={(e) => setExpenseMonto(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-red-400 font-bold placeholder-white/10 focus:outline-none focus:border-red-500/50 focus:bg-white/10"
                                        />
                                    </div>
                                    <div>
                                        <CustomSelect
                                            label="CATEGORÍA"
                                            value={expenseCategoria}
                                            onChange={(val) => setExpenseCategoria(val as Expense['categoria'])}
                                            options={[
                                                { value: 'transporte', label: 'Transporte', subtitle: 'Taxi, Gasolina' },
                                                { value: 'alimentacion', label: 'Alimentación', subtitle: 'Cena, Refrigerio' },
                                                { value: 'equipo', label: 'Equipo', subtitle: 'Mantenimiento, Compra' },
                                                { value: 'marketing', label: 'Marketing', subtitle: 'Publicidad' },
                                                { value: 'administrativo', label: 'Administrativo', subtitle: 'Trámites' },
                                                { value: 'otro', label: 'Otro', subtitle: 'Varios' }
                                            ]}
                                            icon="label"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-400 text-xs font-bold mb-1.5 ml-1">NOTAS</label>
                                    <textarea
                                        value={expenseNotas}
                                        onChange={(e) => setExpenseNotas(e.target.value)}
                                        placeholder="Detalles adicionales..."
                                        rows={2}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-red-500/50 focus:bg-white/10 resize-none"
                                    />
                                </div>

                                <div className="pt-4 border-t border-white/10">
                                    <button
                                        onClick={handleAddExpense}
                                        className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all flex items-center justify-center gap-2 transform active:scale-95">
                                        <span className="material-symbols-outlined">save</span>
                                        Registrar Gasto
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>,
                    document.body
                )
            }
        </div >
    );
}
