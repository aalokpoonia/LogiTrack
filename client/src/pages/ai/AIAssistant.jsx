/**
 * pages/ai/AIAssistant.jsx
 *
 * LogiTrack AI Logistics Dispatcher Assistant.
 * Built-in chat console powered by Google Gemini 1.5 Flash.
 */

import { useState, useRef, useEffect } from 'react';
import { useQueryAssistant } from '../../hooks/useAI';
import {
    Brain, Send, Sparkles, AlertCircle, Bot, User,
    FileText, TrendingUp, AlertTriangle, ArrowRight
} from 'lucide-react';

const SUGGESTIONS = [
    {
        label: "Summarize business status",
        prompt: "Summarize today's business status, active shipments and operating margins.",
        icon: FileText,
        color: "text-blue-400"
    },
    {
        label: "Check margin health",
        prompt: "How are our financial margins looking? Highlight any low-profit operations.",
        icon: TrendingUp,
        color: "text-emerald-400"
    },
    {
        label: "Identify delayed shipments",
        prompt: "Show active fleet delayed shipments and delay prediction risks.",
        icon: AlertTriangle,
        color: "text-amber-400"
    }
];

// Simple, robust Markdown parser helper
const parseMarkdownToJSX = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, idx) => {
        let cleanLine = line.trim();

        // Headers
        if (cleanLine.startsWith('###')) {
            return (
                <h4 key={idx} className="text-slate-200 font-bold text-xs mt-4 mb-2 uppercase tracking-wide flex items-center gap-1.5 border-b border-slate-800 pb-1">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                    {cleanLine.replace('###', '').trim()}
                </h4>
            );
        }
        if (cleanLine.startsWith('##')) {
            return (
                <h3 key={idx} className="text-slate-200 font-bold text-sm mt-5 mb-2.5 uppercase tracking-wide">
                    {cleanLine.replace('##', '').trim()}
                </h3>
            );
        }

        // Bullets
        if (cleanLine.startsWith('*') || cleanLine.startsWith('-')) {
            const content = cleanLine.substring(1).trim();
            return (
                <li key={idx} className="text-slate-300 text-xs ml-4 mb-1.5 list-disc leading-relaxed">
                    {renderBoldText(content)}
                </li>
            );
        }

        // Standard Paragraphs
        if (cleanLine === '') return <div key={idx} className="h-2" />;

        return (
            <p key={idx} className="text-slate-350 text-xs leading-relaxed mb-2">
                {renderBoldText(cleanLine)}
            </p>
        );
    });
};

const renderBoldText = (text) => {
    const parts = text.split('**');
    return parts.map((part, i) => {
        if (i % 2 === 1) {
            return <strong key={i} className="text-slate-200 font-semibold">{part}</strong>;
        }
        return part;
    });
};

const AIAssistant = () => {
    const [messages, setMessages] = useState([
        {
            sender: 'bot',
            text: "Hello! I am your Gemini AI Dispatcher. Ask me about active fleet locations, delay prediction risk, client account standings, or operating profits.",
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);

    const queryMutation = useQueryAssistant();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (promptText) => {
        const text = promptText || inputValue;
        if (!text || text.trim() === '') return;

        // Add user message
        setMessages(prev => [...prev, { sender: 'user', text }]);
        setInputValue('');

        try {
            const res = await queryMutation.mutateAsync({ prompt: text });
            if (res.success && res.answer) {
                setMessages(prev => [...prev, { sender: 'bot', text: res.answer }]);
            } else {
                setMessages(prev => [...prev, { sender: 'bot', text: "⚠️ Failed to resolve Gemini AI prompt response." }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { sender: 'bot', text: "⚠️ Error contacting Gemini AI server. Make sure the API key is valid." }]);
        }
    };

    return (
        <div className="space-y-6 flex flex-col h-[calc(100vh-140px)]">
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                        <Brain className="w-5 h-5 text-blue-500" />
                        AI Dispatch Assistant
                    </h1>
                    <p className="text-slate-500 text-xs mt-0.5">
                        Ask natural language questions about logistics operations, profit reports, and delayed shipments.
                    </p>
                </div>
            </div>

            {/* Chat Frame */}
            <div className="flex-1 min-h-0 bg-slate-900 border border-slate-850 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
                {/* Message Board */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                    {messages.map((m, idx) => {
                        const isBot = m.sender === 'bot';
                        return (
                            <div key={idx} className={`flex gap-3 max-w-[85%] ${isBot ? 'self-start' : 'self-end ml-auto flex-row-reverse'}`}>
                                {/* Avatar */}
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border ${isBot
                                        ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                        : 'bg-slate-850 border-slate-800 text-slate-300'
                                    }`}>
                                    {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                </div>

                                {/* Balloon */}
                                <div className={`p-4 rounded-2xl text-xs space-y-1 ${isBot
                                        ? 'bg-slate-950/60 border border-slate-850 text-slate-300'
                                        : 'bg-blue-600 text-white shadow-lg'
                                    }`}>
                                    {isBot ? parseMarkdownToJSX(m.text) : <p className="leading-relaxed">{m.text}</p>}
                                </div>
                            </div>
                        );
                    })}

                    {queryMutation.isLoading && (
                        <div className="flex gap-3 max-w-[80%] self-start">
                            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center animate-pulse">
                                <Bot className="w-4 h-4" />
                            </div>
                            <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-2xl flex items-center gap-2">
                                <span className="text-slate-500 text-xs">Gemini is thinking</span>
                                <div className="flex gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce delay-100" />
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce delay-200" />
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce delay-300" />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Suggestions Shelf */}
                {messages.length === 1 && (
                    <div className="p-4 bg-slate-950/20 border-t border-slate-900/60 grid grid-cols-1 md:grid-cols-3 gap-3">
                        {SUGGESTIONS.map((s, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSendMessage(s.prompt)}
                                className="flex items-center justify-between p-3 bg-slate-950/40 border border-slate-850 hover:border-blue-500/40 rounded-xl text-left transition-all hover:bg-slate-950 group"
                            >
                                <div className="flex items-center gap-2.5">
                                    <s.icon className={`w-4 h-4 ${s.color}`} />
                                    <span className="text-slate-300 text-[11px] font-semibold">{s.label}</span>
                                </div>
                                <ArrowRight className="w-3.5 h-3.5 text-slate-650 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                        ))}
                    </div>
                )}

                {/* Input Console */}
                <form
                    onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                    className="p-4 bg-slate-950/40 border-t border-slate-900 flex gap-2.5"
                >
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type a query (e.g. 'Show delayed shipments' or 'Margin summary')..."
                        disabled={queryMutation.isLoading}
                        className="flex-1 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={queryMutation.isLoading || !inputValue.trim()}
                        className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white p-2.5 rounded-xl transition-colors shadow-lg flex items-center justify-center flex-shrink-0"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AIAssistant;
