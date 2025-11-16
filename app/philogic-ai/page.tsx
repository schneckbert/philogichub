'use client';

import { useState, useRef, useEffect } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface PresetAction {
  id: string;
  title: string;
  description: string;
  prompt: string;
  icon: string;
}

const presetActions: PresetAction[] = [
  {
    id: 'crm-analyze',
    title: 'CRM Daten Analyse',
    description: 'Analysiere Verkaufschancen und Pipeline',
    prompt: 'Analysiere bitte die aktuellen CRM-Daten und gib mir einen Überblick über die wichtigsten Verkaufschancen und Trends.',
    icon: '📊',
  },
  {
    id: 'email-draft',
    title: 'E-Mail Entwurf',
    description: 'Erstelle professionelle Geschäfts-E-Mails',
    prompt: 'Hilf mir beim Verfassen einer professionellen Geschäfts-E-Mail.',
    icon: '✉️',
  },
  {
    id: 'meeting-prep',
    title: 'Meeting Vorbereitung',
    description: 'Bereite Meetings mit Kunden vor',
    prompt: 'Hilf mir bei der Vorbereitung eines Kundengesprächs. Was sollte ich beachten?',
    icon: '🤝',
  },
  {
    id: 'report-summary',
    title: 'Report Zusammenfassung',
    description: 'Fasse wichtige Informationen zusammen',
    prompt: 'Erstelle eine Zusammenfassung der wichtigsten Punkte aus den aktuellen Geschäftsdaten.',
    icon: '📝',
  },
];

export default function PhilogicAIPage() {
  const [chats, setChats] = useState<Chat[]>([
    {
      id: '1',
      title: 'Neuer Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  const [activeChat, setActiveChat] = useState<string>('1');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [showPresets, setShowPresets] = useState(true);
  const [selectedModel, setSelectedModel] = useState('llama3.1:latest');
  const [models, setModels] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeCharData = chats.find((c) => c.id === activeChat);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeCharData?.messages]);

  useEffect(() => {
    // Hide presets when there are messages
    if (activeCharData && activeCharData.messages.length > 0) {
      setShowPresets(false);
    } else {
      setShowPresets(true);
    }
  }, [activeCharData]);

  // Load models on mount
  useEffect(() => {
    loadModels();
    
    // Load saved model selection
    const savedModel = localStorage.getItem('philogic_ai_model');
    if (savedModel) {
      setSelectedModel(savedModel);
    }
  }, []);

  async function loadModels() {
    try {
      const response = await fetch('/api/philogic-ai/models');
      const data = await response.json();
      if (data.models && data.models.length > 0) {
        setModels(data.models.map((m: any) => m.name));
      }
    } catch (error) {
      console.error('Failed to load models:', error);
    }
  }

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'Neuer Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setChats([...chats, newChat]);
    setActiveChat(newChat.id);
  };

  const deleteChat = (chatId: string) => {
    if (chats.length === 1) return; // Keep at least one chat
    const newChats = chats.filter((c) => c.id !== chatId);
    setChats(newChats);
    if (activeChat === chatId) {
      setActiveChat(newChats[0].id);
    }
  };

  const startEditingChat = (chatId: string) => {
    const chat = chats.find((c) => c.id === chatId);
    if (chat) {
      setEditingChatId(chatId);
      setEditingTitle(chat.title);
    }
  };

  const saveEditingChat = () => {
    if (editingChatId && editingTitle.trim()) {
      setChats(
        chats.map((c) =>
          c.id === editingChatId ? { ...c, title: editingTitle.trim() } : c
        )
      );
    }
    setEditingChatId(null);
    setEditingTitle('');
  };

  const cancelEditingChat = () => {
    setEditingChatId(null);
    setEditingTitle('');
  };

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
    };

    // Generate chat title from first message
    const chatTitle = activeCharData?.messages.length === 0
      ? textToSend.slice(0, 30) + (textToSend.length > 30 ? '...' : '')
      : activeCharData?.title || 'Neuer Chat';

    // Update chat with user message
    const updatedChats = chats.map((c) =>
      c.id === activeChat
        ? {
            ...c,
            messages: [...c.messages, userMessage],
            updatedAt: new Date(),
            title: chatTitle,
          }
        : c
    );
    setChats(updatedChats);

    setInput('');
    setIsLoading(true);

    // Prepare assistant message placeholder
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };

    // Add empty assistant message
    const chatsWithAssistant = updatedChats.map((c) =>
      c.id === activeChat
        ? {
            ...c,
            messages: [...c.messages, assistantMessage],
          }
        : c
    );
    setChats(chatsWithAssistant);

    try {
      const currentChat = chats.find((c) => c.id === activeChat);
      const conversationMessages = currentChat ? [...currentChat.messages, userMessage] : [userMessage];
      
      const response = await fetch('/api/philogic-ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          messages: conversationMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          stream: true,
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter((line) => line.trim());

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || '';
                fullResponse += content;

                // Update assistant message in real-time
                setChats((prevChats) =>
                  prevChats.map((c) =>
                    c.id === activeChat
                      ? {
                          ...c,
                          messages: c.messages.map((m) =>
                            m.id === assistantMessageId
                              ? { ...m, content: fullResponse }
                              : m
                          ),
                        }
                      : c
                  )
                );
              } catch (e) {
                console.error('Parse error:', e);
              }
            }
          }
        }
      }

      // Save final state
      setChats((prevChats) =>
        prevChats.map((c) =>
          c.id === activeChat
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === assistantMessageId
                    ? { ...m, content: fullResponse, timestamp: new Date() }
                    : m
                ),
                updatedAt: new Date(),
              }
            : c
        )
      );
    } catch (error: any) {
      console.error('Error calling PhilogicAI:', error);
      
      // Update with error message
      setChats((prevChats) =>
        prevChats.map((c) =>
          c.id === activeChat
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === assistantMessageId
                    ? { 
                        ...m, 
                        content: `Fehler: ${error.message}. Bitte stelle sicher, dass PhilogicAI unter localhost:8000 läuft.`,
                        timestamp: new Date()
                      }
                    : m
                ),
              }
            : c
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handlePresetClick = (preset: PresetAction) => {
    setInput(preset.prompt);
    setShowPresets(false);
  };

  return (
    <div className="flex h-screen" style={{ backgroundColor: 'var(--clr-surface-a0)' }}>
      {/* Sidebar */}
      <div
        className="w-64 flex flex-col"
        style={{
          backgroundColor: 'var(--clr-surface-a10)',
          borderRightWidth: '1px',
          borderRightStyle: 'solid',
          borderRightColor: 'var(--clr-surface-a30)',
        }}
      >
        {/* New Chat Button */}
        <div className="p-4">
          <button
            onClick={createNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors"
            style={{
              backgroundColor: 'var(--clr-primary-a20)',
              color: 'white',
            }}
          >
            <PlusIcon className="h-5 w-5" />
            <span className="font-medium">Neuer Chat</span>
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto px-2">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`group relative mb-1 rounded-lg transition-colors ${
                activeChat === chat.id ? 'active-chat' : ''
              }`}
              style={{
                backgroundColor:
                  activeChat === chat.id ? 'var(--clr-surface-a30)' : 'transparent',
              }}
            >
              {editingChatId === chat.id ? (
                <div className="flex items-center gap-1 p-2">
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') saveEditingChat();
                      if (e.key === 'Escape') cancelEditingChat();
                    }}
                    className="flex-1 px-2 py-1 text-sm rounded outline-none"
                    style={{
                      backgroundColor: 'var(--clr-surface-a20)',
                      color: 'rgb(255 255 255 / 0.9)',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: 'var(--clr-primary-a20)',
                    }}
                    autoFocus
                  />
                  <button
                    onClick={saveEditingChat}
                    className="p-1 rounded hover:bg-green-500/20"
                  >
                    <CheckIcon className="h-4 w-4 text-green-500" />
                  </button>
                  <button
                    onClick={cancelEditingChat}
                    className="p-1 rounded hover:bg-red-500/20"
                  >
                    <XMarkIcon className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => setActiveChat(chat.id)}
                  className="w-full flex items-center gap-3 p-3 text-left cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setActiveChat(chat.id);
                    }
                  }}
                >
                  <ChatBubbleLeftRightIcon
                    className="h-5 w-5 flex-shrink-0"
                    style={{ color: 'rgb(255 255 255 / 0.6)' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium truncate"
                      style={{ color: 'rgb(255 255 255 / 0.9)' }}
                    >
                      {chat.title}
                    </p>
                    <p className="text-xs" style={{ color: 'rgb(255 255 255 / 0.5)' }}>
                      {chat.messages.length} Nachrichten
                    </p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditingChat(chat.id);
                      }}
                      className="p-1 rounded hover:bg-white/10"
                    >
                      <PencilIcon className="h-4 w-4" style={{ color: 'rgb(255 255 255 / 0.7)' }} />
                    </button>
                    {chats.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChat(chat.id);
                        }}
                        className="p-1 rounded hover:bg-red-500/20"
                      >
                        <TrashIcon className="h-4 w-4 text-red-500" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          className="p-4"
          style={{
            borderTopWidth: '1px',
            borderTopStyle: 'solid',
            borderTopColor: 'var(--clr-surface-a30)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: 'var(--clr-primary-a20)' }}
            >
              <SparklesIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
                PhilogicAI
              </p>
              <p className="text-xs" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
                Powered by llama.cpp
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{
            borderBottomWidth: '1px',
            borderBottomStyle: 'solid',
            borderBottomColor: 'var(--clr-surface-a30)',
          }}
        >
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
              {activeCharData?.title || 'Chat'}
            </h1>
            <p className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
              Powered by LLaMA 3.1 70B • Lokaler AI Server
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedModel}
              onChange={(e) => {
                setSelectedModel(e.target.value);
                localStorage.setItem('philogic_ai_model', e.target.value);
              }}
              className="px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--clr-surface-a20)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'var(--clr-surface-a30)',
                color: 'rgb(255 255 255 / 0.9)',
              }}
            >
              {models.length > 0 ? (
                models.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))
              ) : (
                <option value={selectedModel}>{selectedModel}</option>
              )}
            </select>
            <button
              onClick={loadModels}
              className="p-2 rounded-lg transition-colors"
              style={{
                backgroundColor: 'var(--clr-surface-a20)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'var(--clr-surface-a30)',
              }}
              title="Modelle neu laden"
            >
              <ArrowPathIcon className="h-5 w-5" style={{ color: 'rgb(255 255 255 / 0.7)' }} />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {activeCharData && activeCharData.messages.length === 0 && showPresets ? (
            // Preset Actions
            <div className="h-full flex items-center justify-center p-8">
              <div className="max-w-4xl w-full">
                <div className="text-center mb-8">
                  <div
                    className="inline-flex p-4 rounded-2xl mb-4"
                    style={{ backgroundColor: 'var(--clr-primary-a20)' }}
                  >
                    <SparklesIcon className="h-12 w-12 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold mb-2" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
                    Wie kann ich dir helfen?
                  </h2>
                  <p className="text-lg" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
                    Wähle eine Aktion oder stelle eine Frage
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {presetActions.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handlePresetClick(preset)}
                      className="p-6 rounded-xl text-left transition-all hover:scale-105"
                      style={{
                        backgroundColor: 'var(--clr-surface-a20)',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: 'var(--clr-surface-a30)',
                      }}
                    >
                      <div className="text-3xl mb-3">{preset.icon}</div>
                      <h3
                        className="text-lg font-semibold mb-2"
                        style={{ color: 'rgb(255 255 255 / 0.9)' }}
                      >
                        {preset.title}
                      </h3>
                      <p className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
                        {preset.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Messages
            <div className="max-w-4xl mx-auto w-full p-6 space-y-6">
              {activeCharData?.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'var(--clr-primary-a20)' }}
                    >
                      <SparklesIcon className="h-5 w-5 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[70%] rounded-2xl p-4 ${
                      message.role === 'user' ? 'rounded-br-none' : 'rounded-bl-none'
                    }`}
                    style={{
                      backgroundColor:
                        message.role === 'user' ? 'var(--clr-primary-a20)' : 'var(--clr-surface-a20)',
                    }}
                  >
                    <p
                      className="whitespace-pre-wrap"
                      style={{ color: 'rgb(255 255 255 / 0.9)' }}
                    >
                      {message.content}
                    </p>
                    <p
                      className="text-xs mt-2"
                      style={{ color: 'rgba(255, 255, 255, 0.5)' }}
                    >
                      {message.timestamp.toLocaleTimeString('de-DE', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  {message.role === 'user' && (
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'var(--clr-info-a10)' }}
                    >
                      <span className="text-white font-semibold">Du</span>
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4">
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'var(--clr-primary-a20)' }}
                  >
                    <SparklesIcon className="h-5 w-5 text-white" />
                  </div>
                  <div
                    className="rounded-2xl rounded-bl-none p-4"
                    style={{ backgroundColor: 'var(--clr-surface-a20)' }}
                  >
                    <div className="flex gap-1">
                      <div
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{
                          backgroundColor: 'var(--clr-primary-a20)',
                          animationDelay: '0ms',
                        }}
                      />
                      <div
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{
                          backgroundColor: 'var(--clr-primary-a20)',
                          animationDelay: '150ms',
                        }}
                      />
                      <div
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{
                          backgroundColor: 'var(--clr-primary-a20)',
                          animationDelay: '300ms',
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div
          className="p-6"
          style={{
            borderTopWidth: '1px',
            borderTopStyle: 'solid',
            borderTopColor: 'var(--clr-surface-a30)',
          }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3 items-end">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nachricht an PhilogicAI..."
                rows={1}
                className="flex-1 px-4 py-3 rounded-xl resize-none focus:ring-2 focus:ring-offset-0 outline-none"
                style={{
                  backgroundColor: 'var(--clr-surface-a20)',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: 'var(--clr-surface-a30)',
                  color: 'rgb(255 255 255 / 0.9)',
                }}
                disabled={isLoading}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                className="p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: 'var(--clr-primary-a20)',
                  color: 'white',
                }}
              >
                <PaperAirplaneIcon className="h-6 w-6" />
              </button>
            </div>
            <p className="text-xs mt-2 text-center" style={{ color: 'rgb(255 255 255 / 0.5)' }}>
              PhilogicAI kann Fehler machen. Überprüfe wichtige Informationen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
