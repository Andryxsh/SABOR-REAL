import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const navigate = useNavigate();
    const { login, user } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [imagesLoaded, setImagesLoaded] = useState(false);

    // Preload Critical Images
    useEffect(() => {
        const bgImage = new Image();
        bgImage.src = "/assets/SaborRealLargo.webp";

        const logoImage = new Image();
        logoImage.src = "/assets/logo.webp";

        let loadedCount = 0;
        const checkLoaded = () => {
            loadedCount++;
            if (loadedCount === 2) setImagesLoaded(true);
        };

        bgImage.onload = checkLoaded;
        logoImage.onload = checkLoaded;

        // Safety timeout in case images fail
        setTimeout(() => setImagesLoaded(true), 3000);
    }, []);

    // Si ya hay usuario, redirigir al dashboard
    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    if (!imagesLoaded) {
        return (
            <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
                <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            setError('Por favor ingresa email y contraseña');
            return;
        }

        try {
            setError('');
            setLoading(true);
            await login(email, password);
            navigate('/dashboard');
        } catch (error: any) {
            console.error('Login error:', error);
            if (error.message.includes('invalid-credential') || error.message.includes('user-not-found')) {
                setError('Email o contraseña incorrectos');
            } else if (error.message.includes('wrong-password')) {
                setError('Contraseña incorrecta');
            } else {
                setError('Error al iniciar sesión. Intenta de nuevo.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="font-display fixed inset-0 h-screen w-screen overflow-hidden flex flex-col items-center justify-center selection:bg-purple-500 selection:text-white bg-black">

            {/* 1. Fondo Base Animado (Aurora) */}
            <div className="absolute inset-0 z-0">
                {/* Degradado Gigante Animado */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-black to-blue-900 opacity-80 animate-aurora"></div>
            </div>

            {/* 2. Contenedor Audio-Reactivo (Simulado) detrás de la imagen */}
            <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-full h-full max-w-7xl max-h-screen">

                    {/* Luz pulsante detrás de la banda */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-[80%] h-[60%] bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-full blur-[120px] opacity-50 animate-pulse duration-[4s] mix-blend-screen"></div>
                    </div>

                    {/* Imagen de la Banda */}
                    <img
                        src="/assets/SaborRealLargo.webp"
                        alt="Background Sabor Real"
                        className="w-full h-full object-cover relative z-10 opacity-90 transition-opacity duration-1000 ease-in-out"
                    />
                    <div className="absolute inset-0 bg-black/10 z-20"></div>
                </div>
            </div>

            {/* 3. Login Card (Visible) */}
            <main className="w-full max-w-[400px] px-6 relative z-30 flex flex-col items-center justify-center h-full">

                {/* Glassmorphism Card Mejorada */}
                <div className="w-full bg-black/40 backdrop-blur-sm p-8 rounded-[2.5rem] border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] ring-1 ring-white/10 flex flex-col items-center relative overflow-hidden transition-all duration-500 hover:shadow-[0_0_50px_rgba(168,85,247,0.2)]">

                    {/* Brillo interno superior */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>

                    {/* Logo Container con Flotación */}
                    <div className="w-64 h-auto flex items-center justify-center -mt-8 mb-6 relative hover:scale-105 transition-transform duration-500 z-10 animate-float">
                        {/* Luz Neón Trasera del Logo */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-purple-500/30 rounded-full blur-[50px] animate-pulse z-0"></div>
                        <img
                            alt="Sabor Real Logo"
                            className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                            src="/assets/logo.webp"
                        />
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5 w-full z-10">
                        {/* Email Input con Glow en Focus */}
                        <div className="space-y-2">
                            <label className="text-white/90 text-xs font-bold uppercase tracking-wider ml-1 drop-shadow-md">
                                Email
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-white/60 group-focus-within:text-purple-400 transition-colors duration-300">mail</span>
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3.5 bg-black/30 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 focus:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all duration-300 hover:bg-black/40 backdrop-blur-sm"
                                    placeholder="admin@saborreal.com"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Password Input con Glow en Focus */}
                        <div className="space-y-2">
                            <label className="text-white/90 text-xs font-bold uppercase tracking-wider ml-1 drop-shadow-md">
                                Contraseña
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-white/60 group-focus-within:text-purple-400 transition-colors duration-300">lock</span>
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-12 py-3.5 bg-black/30 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 focus:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all duration-300 hover:bg-black/40 backdrop-blur-sm"
                                    placeholder="••••••••"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/50 hover:text-white transition-colors cursor-pointer outline-none"
                                >
                                    <span className="material-symbols-outlined text-xl">
                                        {showPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-red-200 text-sm">error</span>
                                    <p className="text-red-100 text-xs font-medium">{error}</p>
                                </div>
                            </div>
                        )}

                        {/* Botón con Efecto Shine/Brillo */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-900/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-4 border border-white/10 group"
                        >
                            {/* Shine Animation overlay */}
                            <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 animate-shine group-hover:animate-none"></div>

                            {loading ? (
                                <div className="flex items-center justify-center gap-2 relative z-10">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Ingresando...</span>
                                </div>
                            ) : (
                                <span className="relative z-10">Iniciar Sesión</span>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <a href="#" className="inline-block text-white/50 text-xs hover:text-white transition-colors hover:underline">
                            ¿Olvidaste tu contraseña?
                        </a>
                    </div>
                </div>
            </main>
        </div>
    );
}
