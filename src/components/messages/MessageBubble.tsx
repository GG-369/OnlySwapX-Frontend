import { useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { formatRelative } from '@/utils/formatDate';
import type { MessageResponse } from '@/types';

interface MessageBubbleProps {
  message: MessageResponse;
  isOwn: boolean;
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}
    >
      <div className={`max-w-[75%] rounded-xl px-4 py-2.5 ${
        isOwn
          ? 'bg-gold/15 text-foreground border border-gold/20'
          : 'bg-secondary text-foreground border border-border'
      }`}>
        {!isOwn && (
          <p className="mb-1 text-xs font-medium text-gold">{message.senderName}</p>
        )}
        <p className="text-sm">{message.content}</p>
        <p className="mt-1 text-[10px] text-muted-foreground">{formatRelative(message.createdAt)}</p>
      </div>
    </motion.div>
  );
}

export function ChatWindow({ messages, currentUserId }: {
  messages: MessageResponse[];
  currentUserId: number;
  onSend?: (content: string) => void;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {messages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">No messages yet. Say hello!</p>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} isOwn={msg.senderId === currentUserId} />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
