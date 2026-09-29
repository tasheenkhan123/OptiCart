import React from 'react';
import { ChatInterface } from '../components/chat/ChatInterface';

interface HomePageProps {
  onMessageCountChange?: (count: number) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onMessageCountChange }) => {
  return (
    <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-4 flex flex-col justify-between">
      <ChatInterface onMessageCountChange={onMessageCountChange} />
    </main>
  );
};
