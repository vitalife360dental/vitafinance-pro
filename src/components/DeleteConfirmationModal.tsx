
import { useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { GlassModal } from './ui/GlassModal';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void> | void;
    title?: string;
    description?: string;
}

export default function DeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Eliminar Registro",
    description = "¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer."
}: DeleteConfirmationModalProps) {
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            await onConfirm();
        } finally {
            setIsLoading(false);
            onClose();
        }
    };

    return (
        <GlassModal isOpen={isOpen} onClose={onClose} title="">
            <div className="flex flex-col items-center text-center p-4">
                <div className="w-16 h-16 bg-[#5dc0bb]/10 rounded-full flex items-center justify-center mb-4 text-[#5dc0bb] shadow-lg shadow-[#5dc0bb]/20">
                    <AlertTriangle size={32} />
                </div>

                <h3 className="text-xl font-bold text-slate-800 mb-2">
                    {title}
                </h3>

                <p className="text-slate-500 mb-8 max-w-xs">
                    {description}
                </p>

                <div className="flex items-center gap-3 w-full">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="flex-1 py-3 px-4 bg-[#5dc0bb] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg shadow-[#5dc0bb]/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Trash2 size={18} />
                                Eliminar
                            </>
                        )}
                    </button>
                </div>
            </div>
        </GlassModal>
    );
}
