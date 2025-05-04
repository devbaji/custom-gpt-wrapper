'use client';

import { useRef, useEffect, useState } from 'react';
import { Header, Message, ChatInput, ScrollToBottomButton } from './components';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  id: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [isClearingChat, setIsClearingChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const lastScrollTop = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const customName = (window as unknown as { APP_NAME?: string }).APP_NAME;
      if (customName) {
        setDisplayName(customName);
      }
    }
  }, []);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      setShouldAutoScroll(true);
    }
  };

  useEffect(() => {
    if (shouldAutoScroll) {
      scrollToBottom();
    }
  }, [messages, shouldAutoScroll]);

  const handleNewChat = () => {
    setIsClearingChat(true);
    setMessages([]);
    setInput('');
    setEditingMessageId(null);
    setEditingContent('');
    setIsClearingChat(false);
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  const handleRetry = async (messageId: string) => {
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    const messagesToRetry = messages.slice(0, messageIndex);
    const userMessage = messages[messageIndex - 1];
    setMessages(messagesToRetry);
    setIsLoading(true);

    try {
      abortControllerRef.current = new AbortController();
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messagesToRetry, userMessage],
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No reader available');
      }

      let assistantMessage = '';
      setMessages((prev) => [...prev, { role: 'assistant', content: '', id: (Date.now() + 1).toString() }]);

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
            id: newMessages[newMessages.length - 1].id,
          };
          return newMessages;
        });
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, there was an error processing your request.',
          id: Date.now().toString(),
        },
      ]);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleEdit = (message: Message) => {
    setEditingMessageId(message.id);
    setEditingContent(message.content);
  };

  const handleSaveEdit = async () => {
    if (!editingMessageId) return;

    const messageIndex = messages.findIndex(m => m.id === editingMessageId);
    if (messageIndex === -1) return;

    const updatedMessages = messages.slice(0, messageIndex + 1).map(msg =>
      msg.id === editingMessageId
        ? { ...msg, content: editingContent }
        : msg
    );
    setMessages(updatedMessages);
    setEditingMessageId(null);
    setEditingContent('');
    setInput('');
    setIsLoading(true);

    try {
      abortControllerRef.current = new AbortController();
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No reader available');
      }

      let assistantMessage = '';
      setMessages((prev) => [...prev, { role: 'assistant', content: '', id: (Date.now() + 1).toString() }]);

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
            id: newMessages[newMessages.length - 1].id,
          };
          return newMessages;
        });
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, there was an error processing your request.',
          id: Date.now().toString(),
        },
      ]);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      id: Date.now().toString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      abortControllerRef.current = new AbortController();
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No reader available');
      }

      let assistantMessage = '';
      setMessages((prev) => [...prev, { role: 'assistant', content: '', id: (Date.now() + 1).toString() }]);

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
            id: newMessages[newMessages.length - 1].id,
          };
          return newMessages;
        });
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, there was an error processing your request.',
          id: Date.now().toString(),
        },
      ]);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const onScroll = () => {
    const container = chatContainerRef.current;
    if (container) {
      const currentScrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;

      if (currentScrollTop < lastScrollTop.current) {
        setShouldAutoScroll(false);
      }
      setShowScrollButton(currentScrollTop + clientHeight < scrollHeight - 100);
      lastScrollTop.current = currentScrollTop;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setShouldAutoScroll(true);
      handleSubmit(e);
    }
  };

  useEffect(() => {
    const element = chatContainerRef.current;
    if (element) {
      element.addEventListener('scroll', onScroll);
      return () => element.removeEventListener('scroll', onScroll);
    }
  }, []);

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-50">
      <Header
        displayName={displayName}
        onNewChat={handleNewChat}
        isClearingChat={isClearingChat}
        hasMessages={messages.length > 0}
      />

      <div ref={chatContainerRef} className="flex-1 overflow-y-auto flex justify-center relative">
        <div className={'w-full max-w-3xl p-4 space-y-4'}>
          {messages.map((message) => (
            <Message
              key={message.id}
              message={message}
              onEdit={handleEdit}
              onSaveEdit={handleSaveEdit}
              onRetry={handleRetry}
              editingMessageId={editingMessageId}
              editingContent={editingContent}
              setEditingContent={setEditingContent}
            />
          ))}
          <div className='h-3' ref={messagesEndRef} />
        </div>
        {showScrollButton && (
          <ScrollToBottomButton onClick={scrollToBottom} />
        )}
      </div>

      <ChatInput
        input={input}
        isLoading={isLoading}
        onInputChange={setInput}
        onKeyDown={handleKeyDown}
        onSubmit={handleSubmit}
        onStop={handleStop}
      />
    </div>
  );
}
