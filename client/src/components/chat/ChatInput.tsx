import React, { useState, useRef, useEffect } from 'react';
import { Send, Grid, Coins, X, Mic, MicOff, AlertCircle } from 'lucide-react';
import { CategoryPopover } from './CategoryPopover';
import { startSpeechRecognition, isSpeechRecognitionSupported } from '../../utils/speech';

interface ChatInputProps {
  onSendMessage: (text: string, budget?: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading = false,
  disabled = false,
}) => {
  const [text, setText] = useState('');
  const [budget, setBudget] = useState('');
  const [showBudgetBar, setShowBudgetBar] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  
  // Voice Input (Speech-to-Text) State
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionSessionRef = useRef<{ stop: () => void; abort: () => void } | null>(null);
  const baseTextRef = useRef<string>('');

  useEffect(() => {
    return () => {
      // Clean up recognition session on unmount
      if (recognitionSessionRef.current) {
        recognitionSessionRef.current.abort();
      }
    };
  }, []);

  const handleToggleVoiceInput = () => {
    setSpeechError(null);

    if (isListening) {
      if (recognitionSessionRef.current) {
        recognitionSessionRef.current.stop();
        recognitionSessionRef.current = null;
      }
      setIsListening(false);
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      setSpeechError('Speech recognition is not supported in this browser. Please type or use Chrome/Edge/Safari.');
      return;
    }

    baseTextRef.current = text ? text + (text.endsWith(' ') ? '' : ' ') : '';

    const session = startSpeechRecognition({
      onStart: () => {
        setIsListening(true);
        setSpeechError(null);
      },
      onResult: (transcript, _isFinal) => {
        setText(baseTextRef.current + transcript);
      },
      onError: (errMsg) => {
        setIsListening(false);
        setSpeechError(errMsg);
        recognitionSessionRef.current = null;
      },
      onEnd: () => {
        setIsListening(false);
        recognitionSessionRef.current = null;
      },
    });

    if (session) {
      recognitionSessionRef.current = session;
    }
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanText = text.trim().replace(/[\\"]/g, '');
    if (!cleanText || isLoading || disabled) return;

    if (isListening) {
      handleToggleVoiceInput();
    }

    const cleanBudget = budget.trim() ? budget.trim().replace(/[\\"]/g, '') : undefined;
    onSendMessage(cleanText, cleanBudget);
    setText('');
    setSpeechError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSelectCategoryPrompt = (prompt: string) => {
    setText(prompt);
    setSpeechError(null);
  };

  const canSend = text.trim().length > 0 && !isLoading && !disabled;

  return (
    <div className="relative w-full">
      {/* Voice / Speech Error Notification Banner */}
      {speechError && (
        <div className="mb-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
            <span>{speechError}</span>
          </div>
          <button
            type="button"
            onClick={() => setSpeechError(null)}
            className="p-1 text-amber-600 hover:text-amber-900"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Listening State Banner */}
      {isListening && (
        <div className="mb-2 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between animate-pulse duration-700">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <span className="font-medium">Listening to your voice... Speak your shopping request</span>
          </div>
          <button
            type="button"
            onClick={handleToggleVoiceInput}
            className="text-[11px] font-semibold text-rose-700 hover:text-rose-900 underline ml-2"
          >
            Stop Listening
          </button>
        </div>
      )}

      {/* Category & Stores Popover */}
      <CategoryPopover
        isOpen={isPopoverOpen}
        onClose={() => setIsPopoverOpen(false)}
        onSelectPrompt={handleSelectCategoryPrompt}
      />

      {/* Main Input Box */}
      <div
        className={`bg-white border rounded-2xl p-2.5 sm:p-3 shadow-xs transition-all ${
          isListening
            ? 'border-rose-400 ring-2 ring-rose-100'
            : 'border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100'
        }`}
      >
        {/* Optional Target Budget Bar */}
        {showBudgetBar && (
          <div className="flex items-center gap-2 pb-2 mb-2 border-b border-slate-100 animate-in fade-in duration-150">
            <Coins className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs font-medium text-slate-600">Target Budget:</span>
            <div className="relative">
              <span className="absolute left-2 top-1 text-xs text-slate-400">₹</span>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g. 15000"
                className="w-28 bg-slate-50 border border-slate-200 rounded-lg pl-5 pr-2 py-0.5 text-xs text-slate-800 focus:bg-white focus:border-blue-500 outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setBudget('');
                setShowBudgetBar(false);
              }}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 ml-auto"
              title="Close budget filter"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Text Area */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isListening
              ? 'Listening... Your voice will appear here in real-time...'
              : "Ask OptiCart by text or voice (e.g. 'Skincare products under ₹5,000' or 'Samsung phone under ₹30k')..."
          }
          rows={2}
          disabled={isLoading || disabled}
          className="w-full bg-transparent border-0 resize-none text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-0 leading-relaxed px-1 disabled:opacity-60"
        />

        {/* Action Row */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-1">
          {/* Left Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Category / Store Popover Trigger */}
            <button
              type="button"
              onClick={() => setIsPopoverOpen(!isPopoverOpen)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border ${
                isPopoverOpen
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5 text-blue-600" />
              <span>Browse Categories</span>
            </button>

            {/* Budget Toggle Button */}
            <button
              type="button"
              onClick={() => setShowBudgetBar(!showBudgetBar)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border ${
                showBudgetBar || budget
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Coins className="w-3.5 h-3.5 text-amber-500" />
              <span>{budget ? `₹${budget}` : 'Set Budget'}</span>
            </button>
          </div>

          {/* Right Action: Voice Input & Send Buttons */}
          <div className="flex items-center gap-1.5">
            {/* Microphone Button */}
            <button
              type="button"
              onClick={handleToggleVoiceInput}
              disabled={isLoading || disabled}
              className={`inline-flex items-center justify-center p-2 rounded-xl font-medium text-xs transition-all ${
                isListening
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-200 animate-pulse'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
              title={isListening ? 'Stop recording voice' : 'Speak your request (Voice Input)'}
            >
              {isListening ? (
                <MicOff className="w-4 h-4 text-white" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>

            {/* Send Button */}
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!canSend}
              className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-xs shadow-2xs transition-all ${
                canSend
                  ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer active:scale-95'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
