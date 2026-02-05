import { AlertTriangle, Trash2 } from 'lucide-react';
import { GlassModal } from './ui/GlassModal';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
}

export default function DeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'CONFIRMAR ELIMINACIÓN',
    message = '¿Estás seguro de que deseas eliminar este elemento? Esta acción no se puede deshacer.'
}: DeleteConfirmationModalProps) {
    if (!isOpen) return null;

    return (
        <GlassModal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            headerColor="#ef4444" // Red header for danger
            maxWidth="max-w-md"
        >
            <div className="text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                    <Trash2 size={32} />
                </div>

                <h3 className="text-lg font-bold text-slate-800 mb-2">
                    ¿Estás seguro?
                </h3>

                <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                    {message}
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={onConfirm}
                        className="w-full py-4 rounded-xl font-bold text-white shadow-lg shadow-red-500/30 hover:shadow-red-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest text-sm bg-red-500 flex items-center justify-center gap-2"
                    >
                        <AlertTriangle size={18} />
                        Sí, Eliminar
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full py-4 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors uppercase tracking-widest text-sm"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </GlassModal>
    );
}
