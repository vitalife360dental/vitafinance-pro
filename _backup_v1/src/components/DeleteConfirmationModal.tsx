import { X, AlertTriangle, Trash2 } from 'lucide-react';

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
    title = 'Confirmar Eliminación',
    message = '¿Estás seguro de que deseas eliminar este elemento? Esta acción no se puede deshacer.'
}: DeleteConfirmationModalProps) {
    if (!isOpen) return null;

    return (
        <div className="glass-overlay">
            <div className="glass-card-container !max-w-md"> {/* Override max-width for smaller modal */}
                {/* Screws */}
                <div className="glass-screw tl"></div>
                <div className="glass-screw tr"></div>
                <div className="glass-screw bl"></div>
                <div className="glass-screw br"></div>

                {/* Badge */}
                <div className="glass-badge bg-red-500/10 text-red-500 border-red-500/20">
                    ACCIÓN IRREVERSIBLE
                </div>

                {/* Inner Content */}
                <div className="glass-inner-content">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <span className="bg-red-100 p-2 rounded-lg text-red-500">
                                    <Trash2 size={20} />
                                </span>
                                {title}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 -mr-2 -mt-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="mb-8">
                        <p className="text-slate-600 text-sm leading-relaxed font-medium">
                            {message}
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={onConfirm}
                            className="bg-red-500 hover:bg-red-600 text-white w-full py-3.5 rounded-xl font-bold shadow-lg shadow-red-500/30 transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wide hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <AlertTriangle size={18} />
                            Sí, Eliminar Permanentemente
                        </button>
                        <button
                            onClick={onClose}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-600 w-full py-3.5 rounded-xl font-bold transition-all text-sm uppercase tracking-wide"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
