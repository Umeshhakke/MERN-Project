import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { getConversations, getMessages, sendMessage } from '../services/api';
import { playNotificationSound } from '../utils/playNotification';
import { FaArrowLeft, FaPaperPlane } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ChatPage = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const [conversations, setConversations] = useState([]);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);

  // ---------------- Load conversations ----------------
  const fetchConversations = useCallback(async () => {
    try {
      const data = await getConversations();
      setConversations(data);
    } catch (err) {
      toast.error('Could not load conversations');
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // ---------------- Real‑time listeners ----------------
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (msg) => {
      // If the message is from the active chat user, append it
      if (
        activeChatUser &&
        (msg.sender._id === activeChatUser._id || msg.receiver === activeChatUser._id)
      ) {
        setMessages((prev) => [...prev, msg]);
      }

      // Update conversation list (increase unread count if not in active chat)
      setConversations((prev) => {
        const otherId = msg.sender._id === user._id ? msg.receiver : msg.sender._id;
        const exists = prev.find((c) => c.user._id === otherId);
        if (exists) {
          return prev.map((c) => {
            if (c.user._id === otherId) {
              const isActive = activeChatUser && activeChatUser._id === otherId;
              return {
                ...c,
                lastMessage: {
                  text: msg.text,
                  createdAt: msg.createdAt,
                  isMine: msg.sender._id === user._id,
                },
                unreadCount: isActive ? 0 : c.unreadCount + 1,
              };
            }
            return c;
          });
        } else {
          // New conversation
          const newConvo = {
            user: msg.sender._id === user._id ? msg.receiver : msg.sender,
            lastMessage: {
              text: msg.text,
              createdAt: msg.createdAt,
              isMine: msg.sender._id === user._id,
            },
            unreadCount: activeChatUser && activeChatUser._id === msg.sender._id ? 0 : 1,
          };
          return [...prev, newConvo];
        }
      });

      // Play sound only if message is not from me and the page is visible
      if (msg.sender._id !== user._id && document.visibilityState === 'visible') {
        playNotificationSound();
      }
    };

    const handleConversationUpdate = ({ userId, lastMessage }) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.user._id === userId
            ? {
                ...c,
                lastMessage: {
                  ...c.lastMessage,
                  text: lastMessage.text,
                  createdAt: lastMessage.createdAt,
                },
              }
            : c
        )
      );
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('conversation_update', handleConversationUpdate);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('conversation_update', handleConversationUpdate);
    };
  }, [socket, activeChatUser, user._id]);

  // ---------------- Load messages when chat opens ----------------
  useEffect(() => {
    if (!activeChatUser) return;
    const fetchMsgs = async () => {
      setLoadingMessages(true);
      try {
        const data = await getMessages(activeChatUser._id);
        setMessages(data);
        // Reset unread count for this conversation
        setConversations((prev) =>
          prev.map((c) =>
            c.user._id === activeChatUser._id ? { ...c, unreadCount: 0 } : c
          )
        );
      } catch (err) {
        toast.error('Could not load messages');
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMsgs();
  }, [activeChatUser]);

  // ---------------- Auto scroll to bottom ----------------
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ---------------- Handlers ----------------
  const handleSelectConversation = (chatUser) => {
    setActiveChatUser(chatUser);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChatUser) return;
    try {
      const sent = await sendMessage(activeChatUser._id, newMessage.trim());
      setMessages((prev) => [...prev, sent]);
      setNewMessage('');

      // Optimistically update conversation list
      setConversations((prev) =>
        prev.map((c) =>
          c.user._id === activeChatUser._id
            ? {
                ...c,
                lastMessage: {
                  text: sent.text,
                  createdAt: sent.createdAt,
                  isMine: true,
                },
                unreadCount: 0,
              }
            : c
        )
      );
    } catch (err) {
      toast.error('Message could not be sent');
    }
  };

  // ---------------- Render ----------------
  return (
    <div className="flex flex-col h-[calc(100vh-56px)] bg-white">
      {activeChatUser ? (
        /* ====== Message view ====== */
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center p-3 border-b">
            <button onClick={() => setActiveChatUser(null)} className="mr-3 text-xl">
              <FaArrowLeft />
            </button>
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center font-bold mr-2">
              {activeChatUser.profilePic ? (
                <img
                  src={activeChatUser.profilePic}
                  alt=""
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                activeChatUser.username?.[0]?.toUpperCase()
              )}
            </div>
            <span className="font-semibold">{activeChatUser.username}</span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {loadingMessages ? (
              <p className="text-center text-gray-500">Loading...</p>
            ) : messages.length === 0 ? (
              <p className="text-center text-gray-500">No messages yet. Say hello!</p>
            ) : (
              messages.map((msg) => {
                const isMine = msg.sender._id === user._id;
                return (
                  <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[75%] px-3 py-2 rounded-lg ${
                        isMine
                          ? 'bg-blue-500 text-white rounded-br-none'
                          : 'bg-white shadow rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="border-t p-3 flex items-center gap-2">
            <input
              type="text"
              placeholder="Message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="text-blue-500 disabled:text-gray-300 text-xl"
            >
              <FaPaperPlane />
            </button>
          </form>
        </div>
      ) : (
        /* ====== Conversation list ====== */
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold">Messages</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <p className="text-center text-gray-500 mt-10">
                No conversations yet. Follow someone and they follow you back!
              </p>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.user._id}
                  onClick={() => handleSelectConversation(conv.user)}
                  className="flex items-center p-3 w-full text-left hover:bg-gray-50 border-b"
                >
                  <div className="relative">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center font-bold mr-3">
                      {conv.user.profilePic ? (
                        <img
                          src={conv.user.profilePic}
                          alt=""
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        conv.user.username?.[0]?.toUpperCase()
                      )}
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <p className="font-semibold">{conv.user.username}</p>
                      {conv.lastMessage && (
                        <span className="text-xs text-gray-400">
                          {new Date(conv.lastMessage.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {conv.lastMessage && (
                      <p className="text-sm text-gray-500 truncate">
                        {conv.lastMessage.isMine ? 'You: ' : ''}
                        {conv.lastMessage.text}
                      </p>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;