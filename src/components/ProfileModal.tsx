import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
    const { user, updateUserEmail, updateUserPassword, reauthenticate, refreshUser } = useAuth();
    const [activeTab, setActiveTab] = useState<'info' | 'email' | 'password'>('info');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form States
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Re-auth State
    const [reauthRequired, setReauthRequired] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [pendingAction, setPendingAction] = useState<'email' | 'password' | null>(null);
    const [verificationSent, setVerificationSent] = useState(false);

    if (!isOpen) return null;

    const handleUpdateEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        try {
            await updateUserEmail(newEmail);
            setVerificationSent(true);
            setMessage({ type: 'success', text: `Te hemos enviado un correo de verificación a ${newEmail}. Por favor revísalo para confirmar el cambio.` });
        } catch (error: any) {
            if (error.code === 'auth/requires-recent-login') {
                setPendingAction('email');
                setReauthRequired(true);
                setLoading(false);
                return;
            }
            setMessage({ type: 'error', text: 'Error: ' + error.message });
        } finally {
            if (!reauthRequired) setLoading(false);
        }
    };

    const handleCheckVerification = async () => {
        setLoading(true);
        await refreshUser();
        setLoading(false);
        if (user?.email === newEmail) {
            setVerificationSent(false);
            setMessage({ type: 'success', text: '¡Correo actualizado y verificado con éxito!' });
            setNewEmail('');
        } else {
            setMessage({ type: 'error', text: 'Aún no detectamos el cambio. Asegúrate de hacer clic en el enlace del correo.' });
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Las contraseñas no coinciden.' });
            return;
        }
        setLoading(true);
        setMessage(null);
        try {
            await updateUserPassword(newPassword);
            setMessage({ type: 'success', text: 'Contraseña actualizada correctamente.' });
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            if (error.code === 'auth/requires-recent-login') {
                setPendingAction('password');
                setReauthRequired(true);
                setLoading(false);
                return;
            }
            setMessage({ type: 'error', text: 'Error: ' + error.message });
        } finally {
            if (!reauthRequired) setLoading(false);
        }
    };

    const handleReauth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        try {
            await reauthenticate(currentPassword);
            setReauthRequired(false);
            setCurrentPassword('');

            // Retry pending action
            if (pendingAction === 'email') {
                await updateUserEmail(newEmail);
                setVerificationSent(true);
                setMessage({ type: 'success', text: `Te hemos enviado un correo de verificación a ${newEmail}. Por favor revísalo para confirmar el cambio.` });
            } else if (pendingAction === 'password') {
                await updateUserPassword(newPassword);
                setMessage({ type: 'success', text: 'Contraseña actualizada correctamente.' });
                setNewPassword('');
                setConfirmPassword('');
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: 'Contraseña incorrecta o error al verificar.' });
        } finally {
            setLoading(false);
            setPendingAction(null);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-md bg-[#121212] border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-6 flex items-center justify-between border-b border-white/10">
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-xl font-bold text-white shadow-lg">
                            {user?.email?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">
                                {reauthRequired ? 'Verificar Identidad' : 'Mi Perfil'}
                            </h2>
                            <p className="text-white/50 text-xs">Administrador</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {!reauthRequired && (
                    <div className="flex p-2 gap-2 border-b border-white/5">
                        <button
                            onClick={() => setActiveTab('info')}
                            className={`flex-1 py-2 text-xs font-medium rounded-xl transition-all ${activeTab === 'info' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                        >
                            Info
                        </button>
                        <button
                            onClick={() => setActiveTab('email')}
                            className={`flex-1 py-2 text-xs font-medium rounded-xl transition-all ${activeTab === 'email' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                        >
                            Correo
                        </button>
                        <button
                            onClick={() => setActiveTab('password')}
                            className={`flex-1 py-2 text-xs font-medium rounded-xl transition-all ${activeTab === 'password' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                        >
                            Contraseña
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className="p-6 min-h-[300px]">
                    {message && (
                        <div className={`mb-4 p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${message.type === 'success' ? 'bg-green-500/20 border-green-500/30 text-green-200' : 'bg-red-500/20 border-red-500/30 text-red-200'}`}>
                            <span className="material-symbols-outlined text-sm">{message.type === 'success' ? 'check_circle' : 'error'}</span>
                            {message.text}
                        </div>
                    )}

                    {reauthRequired ? (
                        <form onSubmit={handleReauth} className="space-y-4 animate-in fade-in slide-in-from-right-4">
                            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl mb-4">
                                <p className="text-yellow-400 text-xs font-medium flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">lock</span>
                                    Por seguridad, ingresa tu contraseña actual para continuar.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-white/80 text-xs font-bold">Contraseña Actual</label>
                                <input
                                    type="password"
                                    required
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                    placeholder="Confirmar contraseña"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition-all mt-4 disabled:opacity-50"
                            >
                                {loading ? 'Verificando...' : 'Confirmar y Guardar'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setReauthRequired(false);
                                    setPendingAction(null);
                                    setMessage(null);
                                }}
                                className="w-full bg-white/5 hover:bg-white/10 text-white/50 text-xs font-medium py-3 rounded-xl transition-all mt-2"
                            >
                                Cancelar
                            </button>
                        </form>
                    ) : (
                        <>
                            {/* ... (Existing Tabs Content: Info, Email, Password) ... */}
                            {activeTab === 'info' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                    <div className="space-y-1">
                                        <label className="text-white/40 text-xs font-bold uppercase">UID de Usuario</label>
                                        <div className="p-3 bg-white/5 rounded-xl text-white/80 font-mono text-xs break-all border border-white/5">
                                            {user?.uid}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-white/40 text-xs font-bold uppercase">Correo Actual</label>
                                        <div className="p-3 bg-white/5 rounded-xl text-white font-medium border border-white/5 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-purple-400">mail</span>
                                            {user?.email}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-white/40 text-xs font-bold uppercase">Cuenta Creada</label>
                                        <div className="p-3 bg-white/5 rounded-xl text-white/80 text-sm border border-white/5">
                                            {user?.metadata.creationTime}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'email' && (
                                !verificationSent ? (
                                    <form onSubmit={handleUpdateEmail} className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                        <p className="text-white/60 text-xs mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                                            <span className="font-bold text-blue-400">Nota:</span> Se enviará un enlace de verificación a tu nuevo correo.
                                        </p>
                                        <div className="space-y-2">
                                            <label className="text-white/80 text-xs font-bold">Nuevo Correo Electrónico</label>
                                            <input
                                                type="email"
                                                required
                                                value={newEmail}
                                                onChange={(e) => setNewEmail(e.target.value)}
                                                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                                placeholder="nuevo@correo.com"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition-all mt-4 disabled:opacity-50"
                                        >
                                            {loading ? 'Enviando...' : 'Enviar Verificación'}
                                        </button>
                                    </form>
                                ) : (
                                    <div className="space-y-6 text-center animate-in fade-in zoom-in-95">
                                        <div className="mx-auto size-20 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 animate-pulse">
                                            <span className="material-symbols-outlined text-4xl">mark_email_unread</span>
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-white font-bold text-lg">¡Verifica tu bandeja!</h3>
                                            <p className="text-white/60 text-sm">
                                                Hemos enviado un enlace a <span className="text-white font-medium">{newEmail}</span>.
                                                Haz clic en él para confirmar el cambio.
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleCheckVerification}
                                            disabled={loading}
                                            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {loading ? <span className="animate-spin material-symbols-outlined">refresh</span> : <span className="material-symbols-outlined">check_circle</span>}
                                            {loading ? 'Verificando...' : 'Ya verifiqué mi correo'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setVerificationSent(false)}
                                            className="text-white/40 text-xs hover:text-white transition-colors"
                                        >
                                            Cancelar / Probar otro correo
                                        </button>
                                    </div>
                                )
                            )}

                            {activeTab === 'password' && (
                                <form onSubmit={handleUpdatePassword} className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                    <p className="text-white/60 text-xs mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                                        <span className="font-bold text-yellow-400">Seguridad:</span> Elige una contraseña fuerte.
                                    </p>
                                    <div className="space-y-2">
                                        <label className="text-white/80 text-xs font-bold">Nueva Contraseña</label>
                                        <input
                                            type="password"
                                            required
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                            placeholder="••••••••"
                                            minLength={6}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-white/80 text-xs font-bold">Confirmar Contraseña</label>
                                        <input
                                            type="password"
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                            placeholder="••••••••"
                                            minLength={6}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-3 rounded-xl transition-all mt-4 disabled:opacity-50"
                                    >
                                        {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
                                    </button>
                                </form>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
