'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Header, Message, ChatInput, ScrollToBottomButton } from './components';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  id: string;
  attachments?: {
    type: string;
    url: string;
    name: string;
    file?: File;
  }[];
  formDataEntries?: [string, string | Blob][];
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
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
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

  // Cleanup function for URL objects
  const cleanupURLObjects = useCallback((messages: Message[]) => {
    messages.forEach(message => {
      message.attachments?.forEach(attachment => {
        if (attachment.url.startsWith('blob:')) {
          URL.revokeObjectURL(attachment.url);
        }
      });
    });
  }, []);

  // Add cleanup on component unmount
  useEffect(() => {
    return () => {
      cleanupURLObjects(messages);
    };
  }, [cleanupURLObjects, messages]);

  const handleNewChat = () => {
    setIsClearingChat(true);
    cleanupURLObjects(messages);
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

    // Find the last user message before this assistant message
    const lastUserMessage = messages[messageIndex - 1];
    if (!lastUserMessage || lastUserMessage.role !== 'user') return;

    // Keep all messages up to the assistant's message that we're retrying
    const updatedMessages = messages.slice(0, messageIndex);
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      abortControllerRef.current = new AbortController();

      // Recreate the exact same FormData from the stored entries
      const formData = new FormData();
      if (lastUserMessage.formDataEntries) {
        for (const [key, value] of lastUserMessage.formDataEntries) {
          formData.append(key, value);
        }
      } else {
        // Fallback if formDataEntries is not available
        formData.append('message', lastUserMessage.content);
        formData.append('messages', JSON.stringify(updatedMessages));
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        body: formData,
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
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: '',
        id: (Date.now() + 1).toString(),
        attachments: []
      }]);

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
            attachments: []
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
          attachments: []
        },
      ]);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleEdit = (message: Message) => {
    if (editingMessageId === message.id) {
      // Cancel edit
      setEditingMessageId(null);
      setEditingContent('');
    } else {
      // Start edit
      setEditingMessageId(message.id);
      setEditingContent(message.content);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingMessageId) return;

    const trimmedContent = editingContent.trim();
    if (!trimmedContent) return;

    const messageIndex = messages.findIndex(m => m.id === editingMessageId);
    if (messageIndex === -1) return;

    const editedMessage = messages[messageIndex];

    // Create updated message with new content but preserve attachments and formDataEntries
    const updatedMessage = {
      ...editedMessage,
      content: trimmedContent
    };

    const updatedMessages = messages.slice(0, messageIndex + 1).map(msg =>
      msg.id === editingMessageId ? updatedMessage : msg
    );

    setMessages(updatedMessages);
    setEditingMessageId(null);
    setEditingContent('');
    setInput('');
    setIsLoading(true);

    try {
      abortControllerRef.current = new AbortController();
      const formData = new FormData();

      // If we have stored FormData entries, use them but update the message content
      if (editedMessage.formDataEntries) {
        for (const [key, value] of editedMessage.formDataEntries) {
          if (key === 'message') {
            formData.append(key, trimmedContent);
          } else if (key === 'messages') {
            formData.append(key, JSON.stringify(updatedMessages));
          } else {
            formData.append(key, value);
          }
        }
      } else {
        // Fallback if no stored FormData
        formData.append('message', trimmedContent);
        formData.append('messages', JSON.stringify(updatedMessages));
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        body: formData,
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
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: '',
        id: (Date.now() + 1).toString(),
        attachments: []
      }]);

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
            attachments: []
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
          attachments: []
        },
      ]);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && attachedFiles.length === 0) || isLoading) return;

    const formData = new FormData();
    const fileAttachments = [];

    // First create all file attachments and get their URLs
    for (const file of attachedFiles) {
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        fileAttachments.push({
          type: file.type,
          url: url,
          name: file.name,
          file: file // Store the original file
        });
      }
    }

    // Create the user message first with attachments
    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      id: Date.now().toString(),
      attachments: fileAttachments.map(({ type, url, name }) => ({ type, url, name }))
    };

    // Add files to formData after creating URLs
    for (const attachment of fileAttachments) {
      formData.append('files', attachment.file);
    }

    formData.append('message', input.trim());
    formData.append('messages', JSON.stringify([...messages, userMessage]));

    // Store the FormData entries for retry
    const formDataEntries = Array.from(formData.entries());
    userMessage.formDataEntries = formDataEntries;

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setAttachedFiles([]);
    setIsLoading(true);

    try {
      abortControllerRef.current = new AbortController();
      const response = await fetch('/api/chat', {
        method: 'POST',
        body: formData,
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
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: '',
        id: (Date.now() + 1).toString(),
        attachments: []
      }]);

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
            attachments: []
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
          attachments: []
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
    <main className="flex flex-col h-[100dvh] max-h-[100dvh] bg-gray-50">
      <Header
        displayName={displayName}
        onNewChat={handleNewChat}
        isClearingChat={isClearingChat}
        hasMessages={messages.length > 0}
      />
      <div className="flex-1 flex flex-col min-h-0">
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto"
          onScroll={onScroll}
        >
          <div className="max-w-3xl mx-auto pt-4 pb-24">
            {messages.map((message, index) => (
              <Message
                key={message.id}
                message={message}
                onRetry={handleRetry}
                onEdit={handleEdit}
                editingMessageId={editingMessageId}
                editingContent={editingContent}
                setEditingContent={setEditingContent}
                onSaveEdit={handleSaveEdit}
                isLast={index === messages.length - 1}
                isLoading={isLoading}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
          {showScrollButton && <ScrollToBottomButton onClick={scrollToBottom} />}
        </div>
        <div className="sticky bottom-0 bg-white border-t border-gray-200 w-full">
          <div className="max-w-3xl mx-auto px-4 py-2 relative">
            {isLoading && (
              <div className="mb-4 absolute top-[0.3rem] left-1">
                <div className="max-w-3xl mx-auto px-4">
                  <div className="flex items-center space-x-2 animate-pulse">
                    <div className="h-1.5 w-1.5 bg-gray-500 rounded-full"></div>
                    <div className="h-1.5 w-1.5 bg-gray-500 rounded-full"></div>
                    <div className="h-1.5 w-1.5 bg-gray-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            )}
            <ChatInput
              input={input}
              onInputChange={setInput}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              onStop={handleStop}
              onKeyDown={handleKeyDown}
              onFilesSelected={setAttachedFiles}
              attachedFiles={attachedFiles}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
