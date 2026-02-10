import { useState, useEffect } from 'react';
import { Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function PinEntry() {
    const { login } = useAuth();
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);


    const handleNumberClick = (num: number) => {
        if (pin.length < 6) {
            setPin(prev => prev + num);
            setError(false);
        }
    };

    const handleBackspace = () => {
        setPin(prev => prev.slice(0, -1));
        setError(false);
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (pin.length !== 6) return;


        const success = await login(pin);
        if (!success) {
            setError(true);
            setPin('');
            // Shake effect could be added here
        }

    };

    // Auto-submit when 6 digits are entered
    useEffect(() => {
        if (pin.length === 6) {
            handleSubmit();
        }
    }, [pin]);

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-teal-500 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-teal-500/20">
                        <Lock size={40} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">VitaFINANCE</h1>
                    <p className="text-slate-400">Ingrese su PIN de seguridad</p>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                    {/* Security strip */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-500 to-emerald-500"></div>

                    {/* PIN Display */}
                    <div className="mb-8 flex justify-center gap-3">
                        {[0, 1, 2, 3, 4, 5].map((i) => (
                            <div
                                key={i}
                                className={`w-4 h-4 rounded-full transition-all duration-300 ${i < pin.length
                                    ? error ? 'bg-red-500 scale-110' : 'bg-teal-500 scale-110'
                                    : 'bg-slate-200'
                                    }`}
                            />
                        ))}
                    </div>

                    {error && (
                        <div className="mb-6 flex items-center justify-center gap-2 text-red-500 animate-pulse">
                            <AlertCircle size={16} />
                            <span className="text-sm font-medium">PIN Incorrecto</span>
                        </div>
                    )}

                    {/* Keypad */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                            <button
                                key={num}
                                onClick={() => handleNumberClick(num)}
                                className="h-16 rounded-2xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-100 text-2xl font-bold text-slate-700 transition-colors flex items-center justify-center"
                                type="button"
                            >
                                {num}
                            </button>
                        ))}
                        <div className="flex items-center justify-center">
                            {/* Empty slot for alignment */}
                        </div>
                        <button
                            onClick={() => handleNumberClick(0)}
                            className="h-16 rounded-2xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-100 text-2xl font-bold text-slate-700 transition-colors flex items-center justify-center"
                            type="button"
                        >
                            0
                        </button>
                        <button
                            onClick={handleBackspace}
                            className="h-16 rounded-2xl bg-slate-50 hover:bg-red-50 active:bg-red-100 border border-slate-100 text-slate-400 hover:text-red-500 transition-colors flex items-center justify-center"
                            type="button"
                        >
                            <span className="text-xl">⌫</span>
                        </button>
                    </div>

                    <div className="text-center">
                        <p className="text-xs text-slate-400">
                            Acceso restringido por rol
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
