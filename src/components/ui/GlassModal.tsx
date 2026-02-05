import { X } from 'lucide-react';
import type { ReactNode } from 'react';

interface GlassModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    headerColor?: string; // Allow override, default to #5dc0bb
    children: ReactNode;
    maxWidth?: string;
}

export function GlassModal({
    isOpen,
    onClose,
    title,
    headerColor = '#5dc0bb',
    children,
    maxWidth = 'max-w-2xl'
}: GlassModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with blur */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Main Container - The "Frosted Glass" Outer Frame */}
            <div className={`relative w-full ${maxWidth} bg-white/30 backdrop-blur-md border border-white/50 p-3 rounded-[32px] shadow-2xl animate-in fade-in zoom-in-95 duration-200`}>

                {/* Screws (Corner decorations) */}
                <div className="absolute top-3 left-3 w-3 h-3 rounded-full bg-slate-200 border border-slate-300 shadow-inner"></div>
                <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-slate-200 border border-slate-300 shadow-inner"></div>
                <div className="absolute bottom-3 left-3 w-3 h-3 rounded-full bg-slate-200 border border-slate-300 shadow-inner"></div>
                <div className="absolute bottom-3 right-3 w-3 h-3 rounded-full bg-slate-200 border border-slate-300 shadow-inner"></div>

                {/* Inner Card (The actual content container) */}
                <div className="bg-white rounded-[24px] overflow-hidden shadow-sm h-full relative z-10">

                    {/* Header Bar */}
                    <div
                        className="h-12 w-full flex items-center justify-center relative"
                        style={{ backgroundColor: headerColor }}
                    >
                        <h2 className="text-white font-bold tracking-widest text-sm uppercase">
                            {title}
                        </h2>

                        {/* Close Button (Absolute right) */}
                        <button
                            onClick={onClose}
                            className="absolute right-4 text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Body Content */}
                    <div className="p-6">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
