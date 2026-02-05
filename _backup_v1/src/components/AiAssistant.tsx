import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Sparkles, Mic, MicOff } from 'lucide-react';
import { aiAssistantService, type ChatMessage } from '../services/aiAssistantService';
import { useNavigate } from 'react-router-dom';

// Type definition for Web Speech API
interface IWindow extends Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
}

export default function AiAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'assistant', content: '¡Hola! Soy VitaBot 🤖. Puedo ayudarte a ver tus finanzas, buscar pacientes o navegar por la app. ¿Qué necesitas hoy?' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const recognitionRef = useRef<any>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMsg: ChatMessage = { role: 'user', content: inputValue };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        // Call AI Service
        const response = await aiAssistantService.chat([...messages, userMsg]);

        setIsTyping(false);
        setMessages(prev => [...prev, response as ChatMessage]);

        // Handle Navigation Action
        if (response.action && response.action.type === 'navigate') {
            navigate(response.action.payload);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        const { webkitSpeechRecognition, SpeechRecognition } = window as unknown as IWindow;
        if (!webkitSpeechRecognition && !SpeechRecognition) {
            alert("Tu navegador no soporta reconocimiento de voz.");
            return;
        }

        const Recognition = SpeechRecognition || webkitSpeechRecognition;
        const recognition = new Recognition();

        recognition.lang = 'es-EC'; // Spanish (Ecuador) or 'es-ES'
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInputValue(transcript);
            // Optionally auto-send:
            // handleSendParams(transcript); 
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">

            {/* Chat Window */}
            {isOpen && (
                <div className="pointer-events-auto mb-4 w-[350px] md:w-[400px] h-[500px] bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">

                    {/* Header */}
                    <div className="h-14 bg-gradient-to-r from-slate-800 to-slate-900 flex items-center justify-between px-4 shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center shadow-inner">
                                <Bot size={18} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-medium text-sm">VitaBot Assistant</h3>
                                <p className="text-indigo-200 text-xs flex items-center gap-1">
                                    <Sparkles size={10} />
                                    AI Powered
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1.5 hover:bg-white/10 rounded-full text-slate-300 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`
                                        max-w-[85%] rounded-2xl p-3 text-sm shadow-sm
                                        ${msg.role === 'user'
                                            ? 'bg-blue-600 text-white rounded-br-none'
                                            : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none'
                                        }
                                    `}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-slate-100 rounded-2xl p-3 rounded-bl-none shadow-sm flex items-center gap-2">
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-white border-t border-slate-100">
                        {isListening && (
                            <div className="mb-2 text-xs text-center text-blue-600 font-medium animate-pulse flex items-center justify-center gap-2">
                                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                Escuchando...
                            </div>
                        )}
                        <div className="flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2 border border-transparent focus-within:border-blue-500 focus-within:bg-white transition-all">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder={isListening ? "Escuchando..." : "Pregunta sobre finanzas o navega..."}
                                className="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 placeholder:text-slate-400"
                                autoFocus
                            />

                            {/* Mic Button */}
                            <button
                                onClick={toggleListening}
                                className={`
                                    p-1.5 rounded-full transition-all
                                    ${isListening
                                        ? 'bg-red-100 text-red-500 animate-pulse'
                                        : 'hover:bg-slate-200 text-slate-500'}
                                `}
                                title={isListening ? "Detener grabación" : "Halar con VitaBot"}
                            >
                                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                            </button>

                            <button
                                onClick={handleSend}
                                disabled={!inputValue.trim() || isTyping}
                                className={`
                                    p-1.5 rounded-full transition-all
                                    ${inputValue.trim()
                                        ? 'bg-blue-600 text-white shadow-md hover:scale-105'
                                        : 'bg-slate-300 text-slate-500 cursor-not-allowed'}
                                `}
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle Button (Floating) */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    pointer-events-auto
                    w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300
                    hover:scale-110 active:scale-95
                    ${isOpen
                        ? 'bg-slate-700 text-white rotate-90'
                        : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white animate-pulse-slow'}
                `}
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={28} />}
            </button>
        </div>
    );
}
