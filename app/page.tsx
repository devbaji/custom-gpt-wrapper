'use client';

import { useRef, useEffect, useState } from 'react';
import MarkdownRenderer from './components/MarkdownRenderer';
import { cn } from './lib/cn';
import { SUPPORTED_MODELS } from './constants/model';
import { Listbox } from '@headlessui/react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Get app name from injected global variable (set in layout)
const appName = typeof window !== 'undefined' && (window as unknown as { APP_NAME?: string }).APP_NAME ? (window as unknown as { APP_NAME?: string }).APP_NAME : 'GPT Wrapper';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(SUPPORTED_MODELS[0]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleNewChat = () => {
    setMessages([]);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No reader available');
      }

      let assistantMessage = '';
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = new TextDecoder().decode(value);
        assistantMessage += text;
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            role: 'assistant',
            content: assistantMessage,
          };
          return newMessages;
        });
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, there was an error processing your request.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header with New Chat button (full width) */}
      <div className="border-b border-gray-200 p-4 bg-white w-full">
        <div className={cn('flex justify-between items-center', 'max-w-3xl mx-auto w-full')}>
          <h1 className="text-xl font-semibold text-gray-800">{appName}</h1>
          <div className="flex items-center gap-4">
            <Listbox value={selectedModel} onChange={setSelectedModel}>
              <div className="relative">
                <Listbox.Button className="px-3 py-2 border rounded-lg text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 text-left relative">
                  {selectedModel}
                  <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                    <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                      <path d="M7 7l3-3 3 3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M7 13l3 3 3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </Listbox.Button>
                <Listbox.Options className="absolute mt-1 max-h-60 w-48 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                  {SUPPORTED_MODELS.map((model) => (
                    <Listbox.Option
                      key={model}
                      value={model}
                      className={({ active, selected }) =>
                        cn(
                          'cursor-pointer select-none relative py-2 pl-10 pr-4',
                          active ? 'bg-blue-100 text-blue-900' : 'text-gray-900',
                          selected ? 'font-semibold' : 'font-normal'
                        )
                      }
                    >
                      {({ selected }) => (
                        <>
                          <span className={cn('block truncate', selected && 'font-semibold')}>{model}</span>
                          {selected ? (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">✓</span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </div>
            </Listbox>
            <button
              onClick={handleNewChat}
              className={cn('px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors')}
            >
              New Chat
            </button>
          </div>
        </div>
      </div>

      {/* Chat container (centered, max width) */}
      <div className="flex-1 overflow-y-auto flex justify-center">
        <div className={cn('w-full max-w-3xl p-4 space-y-4')}>
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              <div
                className={cn(
                  'w-auto rounded-lg p-2',
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-800 shadow'
                )}
              >
                <MarkdownRenderer content={message.content} />
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area (full width) */}
      <div className="border-t border-gray-200 p-4 w-full bg-white">
        <form onSubmit={handleSubmit} className={cn('max-w-3xl mx-auto w-full')}>
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
              className={cn('w-full p-4 pr-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white text-gray-800')}
              rows={1}
              style={{ minHeight: '60px', maxHeight: '200px' }}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                'absolute right-4 bottom-4 px-4 py-2 rounded-lg transition-colors text-white',
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              )}
            >
              {isLoading ? 'Thinking...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
