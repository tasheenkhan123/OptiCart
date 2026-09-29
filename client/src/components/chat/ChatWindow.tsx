import React, { useEffect, useRef } from 'react';
import { ShoppingBag, Sparkles } from 'lucide-react';
import { ChatMessage } from '../../types';
import { MessageBubble } from './MessageBubble';
import { LoadingIndicator } from './LoadingIndicator';
import { SuggestedPrompt } from './SuggestedPrompt';

interface ChatWindowProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSelectPrompt: (prompt: string) => void;
  speakingMessageId?: string | null;
  onToggleSpeech?: (messageId: string, text: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  isLoading,
  onSelectPrompt,
  speakingMessageId,
  onToggleSpeech,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const hasConversations = messages.length > 0;

  return (
    <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-4 space-y-4">
      {!hasConversations ? (
        /* Empty State / Welcome Screen */
        <div className="h-full flex flex-col justify-center items-center text-center max-w-2xl mx-auto py-8 px-2 space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/15">
              <ShoppingBag className="w-6 h-6" />
            </div>
            
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-semibold">
                <Sparkles className="w-3 h-3 text-blue-600" />
                <span>AI-Powered Purchase Optimizer</span>
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                What can I help you find today?
              </h2>
            </div>

            <p className="text-sm text-slate-500 max-w-lg leading-relaxed">
              OptiCart is your category-independent shopping agent. Type or use your voice to specify your requirements, budget, or preferred brands — I'll formulate your optimal purchase strategy.
            </p>
          </div>

          {/* Category-independent suggested prompts */}
          <div className="w-full text-left pt-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 px-1">
              Try asking by text or voice:
            </div>
            <SuggestedPrompt onSelectPrompt={onSelectPrompt} />
          </div>
        </div>
      ) : (
        /* Message History */
        <div className="space-y-4">
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isSpeaking={speakingMessageId === msg.id}
              onToggleSpeech={onToggleSpeech}
            />
          ))}

          {/* Loading / Typing State */}
          {isLoading && <LoadingIndicator statusText="OptiCart is analyzing merchants and offers..." />}
          
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
};
