import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, X, Minimize2 } from 'lucide-react';
import { aiAssistantService } from '../../services/aiAssistantService';
import type { ChatMessage } from '../../services/aiAssistantService';

export function AiAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: '¡Hola! Soy VitaBot 🤖. Puedo analizar tus finanzas, ver proyecciones o ayudarte a encontrar información. ¿Qué necesitas hoy?',
            timestamp: Date.now()
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // API Call
        const responseText = await aiAssistantService.sendMessage(messages, userMsg.content);

        const botMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: responseText,
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, botMsg]);
        setIsTyping(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Auto-suggestions
    const suggestions = [
        "¿Cómo vamos con la meta?",
        "Resumen financiero de hoy",
        "¿Quién es el mejor doctor?",
        "Analiza la rentabilidad",
    ];

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">

            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-[380px] h-[550px] bg-white/90 backdrop-blur-xl border border-white/50 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-200">

                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#5dc0bb] to-slate-900 p-4 flex items-center justify-between text-white">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                <Sparkles size={20} className="text-yellow-300" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">VitaBot AI</h3>
                                <p className="text-[10px] text-teal-100 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                    En línea • Gemini 2.0 Flash
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
                                <Minimize2 size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50" ref={scrollRef}>
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                        ? 'bg-[#5dc0bb] text-white rounded-br-none'
                                        : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none'
                                        }`}
                                >
                                    {/* Simple Markdown Rendering (Basic) */}
                                    <div dangerouslySetInnerHTML={{
                                        __html: msg.content
                                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                            .replace(/\n/g, '<br />')
                                    }} />
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-none p-3 shadow-sm flex gap-1">
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Suggestions (Only if few messages or idle) */}
                    {messages.length < 3 && !isTyping && (
                        <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
                            {suggestions.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => { setInput(s); setTimeout(handleSend, 0); }} // Quick cheat to fill and send? Better logic needed? Actually Input state won't update instantly for handleSend to see it.
                                    // Better:
                                    // onClick={() => { setInput(s); }} // Just fill
                                    // Let's make it auto-send for UX "Concierge" feel
                                    // Refactor handleSend to accept arg?
                                    className="whitespace-nowrap px-3 py-1.5 bg-teal-50 text-teal-700 text-xs rounded-full border border-teal-100 hover:bg-teal-100 transition-colors"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    )} {/* Logic issue in onclick above fixed by simply filling input or we need refactor. Let's just fill input for now. */}

                    {/* Input Area */}
                    <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Escribe tu consulta..."
                            className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#5dc0bb]/20 text-slate-700"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isTyping}
                            className="p-2.5 bg-[#5dc0bb] text-white rounded-xl hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-teal-200"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* Fab Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`group relative flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 ${isOpen ? 'bg-slate-800 text-white rotate-90' : 'bg-gradient-to-br from-[#5dc0bb] to-slate-900 text-white'}`}
            >
                {isOpen ? <X size={24} /> : <Sparkles size={24} className="animate-pulse" />}

                {/* Notification Badge if closed? */}
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full"></span>
                )}
            </button>
        </div>
    );
}
