import React, { useState, useEffect, useRef } from 'react';
import { usePubNub } from 'pubnub-react';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
  }, [pubnub, channel]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    try {
      await pubnub.publish({
        channel,
        message: {
          text: input,
          uuid,
          timestamp: Date.now(),
        },
      });
      setInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className={styles.chatContainer}>
      <div className={styles.messageList}>
        {messages.map((msg, index) => {
          const content = msg.message;
          const isOwn = content.uuid === uuid || msg.uuid === uuid;
          const time = new Date(msg.timetoken / 10000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          return (
            <div
              key={msg.timetoken || index}
              className={`${styles.message} ${isOwn ? styles.ownMessage : styles.otherMessage}`}
            >
              <div className={styles.messageHeader}>
                <span>{isOwn ? 'You' : (content.uuid || msg.uuid || 'User').slice(0, 6)}</span>
                <span>{time}</span>
              </div>
              <div>{content.text}</div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className={styles.inputArea}>
        <input
          type="text"
          className={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
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
