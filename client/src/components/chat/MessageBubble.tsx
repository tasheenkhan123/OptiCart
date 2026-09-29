import React from 'react';
import { ShoppingBag, User, Coins, Volume2, VolumeX } from 'lucide-react';
import { ChatMessage } from '../../types';
import { StrategyComparisonView } from '../strategy/StrategyComparisonView';

interface MessageBubbleProps {
  message: ChatMessage;
  isSpeaking?: boolean;
  onToggleSpeech?: (messageId: string, text: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isSpeaking = false,
  onToggleSpeech,
}) => {
  const isUser = message.sender === 'user';
  const hasRecommendations = !isUser && message.strategies && message.strategies.length > 0;

  return (
    <div
      className={`flex items-start gap-2.5 sm:gap-3 ${
        isUser ? 'justify-end' : 'justify-start'
      } animate-in fade-in slide-in-from-bottom-1 duration-200 group`}
    >
      {/* Assistant Avatar */}
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-2xs">
          <ShoppingBag className="w-4 h-4" />
        </div>
      )}

      {/* Bubble Container */}
      <div
        className={`relative max-w-[92%] sm:max-w-[85%] px-4 py-3 text-sm leading-relaxed transition-all ${
          isUser
            ? 'bg-blue-600 text-white rounded-2xl rounded-br-xs shadow-xs'
            : isSpeaking
            ? 'bg-white text-slate-800 border-2 border-blue-400 shadow-sm rounded-2xl rounded-bl-xs ring-2 ring-blue-100'
            : 'bg-white text-slate-800 border border-slate-200/90 shadow-xs rounded-2xl rounded-bl-xs'
        }`}
      >
        {/* User Budget Indicator */}
        {isUser && message.budget && (
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-700/90 text-blue-100">
              <Coins className="w-3 h-3" />
              <span>Budget: {message.budget.replace(/[\\"]/g, '')}</span>
            </span>
          </div>
        )}

        {/* Message Content: Render conversation text only when not presenting full recommendation view or if meaningful */}
        {(!hasRecommendations || (message.text && !message.text.toLowerCase().startsWith('got it') && !message.text.toLowerCase().startsWith('below are'))) && (
          <div className={`whitespace-pre-wrap font-normal select-text space-y-1 ${hasRecommendations ? 'text-xs text-slate-600 mb-2' : ''}`}>
            {message.text}
          </div>
        )}

        {/* Render Product Recommendations (Options 1, 2, 3) */}
        {hasRecommendations && message.strategies && (
          <StrategyComparisonView
            strategies={message.strategies}
            budget={message.intent?.budget?.amount}
          />
        )}

        {/* Footer: Timestamp & Speaker Control */}
        <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100/60 text-[10px]">
          {/* Left: Speaker TTS button for Assistant Messages */}
          {!isUser && onToggleSpeech && (
            <button
              type="button"
              onClick={() => onToggleSpeech(message.id, message.text)}
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md font-medium transition-all ${
                isSpeaking
                  ? 'bg-blue-100 text-blue-700 animate-pulse'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
              }`}
              title={isSpeaking ? 'Stop reading' : 'Read message aloud (Voice Output)'}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-3 h-3 text-blue-600" />
                  <span>Speaking...</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3 h-3" />
                  <span>Read aloud</span>
                </>
              )}
            </button>
          )}

          {/* Right: Timestamp */}
          <div
            className={`font-medium ml-auto ${
              isUser ? 'text-blue-200' : 'text-slate-400'
            }`}
          >
            {message.timestamp}
          </div>
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shadow-2xs">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};
