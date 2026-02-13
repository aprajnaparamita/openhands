import React, { useState, useEffect, useRef } from 'react';
import { usePubNub } from 'pubnub-react';
import { chatApi } from '../../api/chat';
import { uploadToCloudinary } from '../../utils/upload';
import styles from './Chat.module.css';

interface ChatProps {
  channel: string;
  uuid: string;
  token?: string | null;
}

export const Chat: React.FC<ChatProps> = ({ channel, uuid, token }) => {
  const pubnub = usePubNub();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastTypingSignalRef = useRef<number>(0);

  const commissionId = channel.split('.')[1];

  useEffect(() => {
    if (token) {
      pubnub.setToken(token);
    }
    pubnub.setUUID(uuid);
  }, [pubnub, token, uuid]);

  useEffect(() => {
    if (!pubnub || !channel) return;

    // Subscribe
    pubnub.subscribe({ channels: [channel] });

    // Listener
    const listener = {
      message: (event: any) => {
        setMessages((prev) => [...prev, event]);
      },
      signal: (event: any) => {
        if (event.channel === channel && event.message.type === 'typing') {
          const typer = event.publisher;
          if (typer !== uuid) {
            setTypingUsers((prev) => {
              const next = new Set(prev);
              next.add(typer);
              return next;
            });

            // Remove after 3 seconds
            setTimeout(() => {
              setTypingUsers((prev) => {
                const next = new Set(prev);
                next.delete(typer);
                return next;
              });
            }, 3000);
          }
        }
      }
    };

    pubnub.addListener(listener);

    // Fetch last 50 messages
    pubnub.fetchMessages(
      {
        channels: [channel],
        count: 50,
      },
      (status, response) => {
        if (status.statusCode === 200 && response?.channels[channel]) {
          setMessages(response.channels[channel]);
        }
      }
    );

    return () => {
      pubnub.removeListener(listener);
      pubnub.unsubscribe({ channels: [channel] });
    };
  }, [pubnub, channel, uuid]);

  const handleTyping = () => {
    const now = Date.now();
    if (now - lastTypingSignalRef.current > 2000) {
      pubnub.signal({
        channel,
        message: { type: 'typing' }
      }).catch(err => console.error('Signal error', err));
      lastTypingSignalRef.current = now;
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    try {
      await chatApi.sendMessage(commissionId, { text: input });
      setInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message: ' + ((error as any).response?.data?.message || (error as Error).message));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploading(true);
      try {
        const url = await uploadToCloudinary(file);
        await chatApi.sendMessage(commissionId, { imageUrl: url });
      } catch (error) {
        console.error('Upload failed:', error);
        alert('Failed to upload image');
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  return (
    <div className={styles.chatContainer}>
      <div className={styles.messageList}>
        {messages.map((msg, index) => {
          const content = msg.message;
          const isOwn = content.uuid === uuid || msg.uuid === uuid;
          // msg.timetoken is high-precision (17 digits), Date expects ms (13 digits)
          const time = new Date(parseInt(msg.timetoken) / 10000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          return (
            <div
              key={msg.timetoken || index}
              className={`${styles.message} ${isOwn ? styles.ownMessage : styles.otherMessage}`}
            >
              <div className={styles.messageHeader}>
                <span>{isOwn ? 'You' : (content.uuid || msg.uuid || 'User').slice(0, 6)}</span>
                <span>{time}</span>
              </div>
              {content.imageUrl ? (
                 <img src={content.imageUrl} alt="Shared" className={styles.sharedImage} style={{maxWidth: '100%', borderRadius: '8px'}} />
              ) : (
                 <div>{content.text}</div>
              )}
            </div>
          );
        })}
        {typingUsers.size > 0 && (
          <div className={styles.typingIndicator}>
             {Array.from(typingUsers).map(u => u.slice(0,6)).join(', ')} is typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className={styles.inputArea}>
        <button 
          className={styles.uploadButton} 
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? '...' : '📷'}
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          style={{ display: 'none' }} 
          accept="image/*"
        />
        <input
          type="text"
          className={styles.input}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            handleTyping();
          }}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
        />
        <button className={styles.sendButton} onClick={sendMessage} disabled={!input.trim()}>
          Send
        </button>
      </div>
    </div>
  );
};
