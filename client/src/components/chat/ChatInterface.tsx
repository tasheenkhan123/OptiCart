import React, { useState, useEffect } from 'react';
import { ChatMessage, ShoppingIntent } from '../../types';
import { ChatWindow } from './ChatWindow';
import { ChatInput } from './ChatInput';
import { sendChatMessage, optimizePurchase } from '../../services/api';
import { speakText, stopSpeaking } from '../../utils/speech';

interface ChatInterfaceProps {
  onMessageCountChange?: (count: number) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onMessageCountChange }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [activeIntent, setActiveIntent] = useState<ShoppingIntent | null>(null);

  useEffect(() => {
    onMessageCountChange?.(messages.length);
  }, [messages.length, onMessageCountChange]);

  // Clean up speech synthesis when component unmounts
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const handleToggleSpeech = (messageId: string, text: string) => {
    if (speakingMessageId === messageId) {
      stopSpeaking();
      setSpeakingMessageId(null);
      return;
    }

    setSpeakingMessageId(messageId);
    speakText(
      text,
      () => setSpeakingMessageId(messageId),
      () => setSpeakingMessageId(null),
      () => setSpeakingMessageId(null)
    );
  };

  const handleSendMessage = async (text: string, budget?: string) => {
    // Stop any active text-to-speech when user sends a new message
    stopSpeaking();
    setSpeakingMessageId(null);

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp,
      budget,
    };

    // Append user message immediately
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // Call backend POST /api/chat with full conversation history and active intent
      const response = await sendChatMessage(text, messages, budget, activeIntent || undefined);

      let replyText = response.reply;
      let isMock = false;

      if (!response.success) {
        replyText = `⚠️ **Backend AI Notice**: ${response.error || 'Unable to connect to Gemini API.'}\n\n*To enable live Gemini AI responses, please add your \`GEMINI_API_KEY\` to \`server/.env\` and restart the server.*`;
        isMock = true;
      }

      if (response.intent) {
        setActiveIntent(response.intent);
      }

      // If intent is ready for recommendation (or has valid budget), fetch the 3 Purchase Strategies from the optimizer
      let strategies: import('../../types').PurchaseStrategyResult[] | undefined;
      const isReadyForRec = Boolean(
        response.intent && (
          response.intent.readinessState === 'ready_for_recommendation' ||
          (typeof response.intent.budget?.amount === 'number' && response.intent.budget.amount > 0)
        )
      );

      if (isReadyForRec && response.intent) {
        try {
          const optResponse = await optimizePurchase(response.intent);
          if (optResponse.success && optResponse.data?.strategies) {
            strategies = optResponse.data.strategies;
          }
        } catch (optErr) {
          console.warn('Could not compute purchase strategies:', optErr);
        }
      }

      const assistantMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intent: response.intent,
        strategies,
        isMockResponse: isMock,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: unknown) {

      const errorMsg = err instanceof Error ? err.message : 'An error occurred while contacting the AI service.';
      const errorMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: `⚠️ **Connection Error**: ${errorMsg}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMockResponse: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col h-[calc(100vh-7.5rem)] min-h-[520px]">
      {/* Scrollable Conversation Window with TTS and Intent indicators */}
      <ChatWindow
        messages={messages}
        isLoading={isLoading}
        onSelectPrompt={handleSelectPrompt}
        speakingMessageId={speakingMessageId}
        onToggleSpeech={handleToggleSpeech}
      />

      {/* Input Dock with Voice Input */}
      <div className="pt-2 pb-1 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent">
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
