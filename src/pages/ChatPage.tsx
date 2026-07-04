import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ChatWindow } from '@/components/messages/MessageBubble';
import { messageService } from '@/services/messageService';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import type { MessageResponse } from '@/types';
import { ArrowLeft, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const exchangeId = Number(id);

  const loadMessages = async (isPolling = false) => {
    if (!exchangeId) {
      setLoading(false);
      return;
    }
    try {
      const data = await messageService.getByExchange(exchangeId);
      setMessages(data);
    } catch (err: any) {
      if (!isPolling) {
        const msg = err?.response?.status === 404
          ? 'Exchange not found'
          : 'Failed to load messages';
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMessages(); }, [exchangeId]);

  useEffect(() => {
    if (!exchangeId) return;
    const interval = setInterval(() => loadMessages(true), 5000);
    return () => clearInterval(interval);
  }, [exchangeId]);

  const handleSend = async () => {
    const content = newMessage.trim();
    if (!content || !exchangeId) return;

    setSending(true);
    try {
      const sent = await messageService.send({ exchangeId, content });
      setMessages((prev) => [...prev, sent]);
      setNewMessage('');
      inputRef.current?.focus();
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-1 h-4 w-4" />Back to Exchanges
        </Button>
        <h1 className="font-heading text-xl font-bold text-foreground">Exchange Chat</h1>
      </motion.div>

      <Card className="glass border-border/50 flex-1 overflow-hidden">
        <CardContent className="flex h-full flex-col p-0">
          <ChatWindow messages={messages} currentUserId={user?.id ?? 0} />

          <div className="border-t border-border/50 p-3">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={sending}
                className="bg-navy border-border focus:border-gold"
              />
              <Button
                onClick={handleSend}
                disabled={!newMessage.trim() || sending}
                size="icon"
                aria-label="Send message"
                className="bg-gold text-navy hover:bg-gold-light shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
