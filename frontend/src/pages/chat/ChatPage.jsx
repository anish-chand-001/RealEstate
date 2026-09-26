import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import API_URL from '../../config';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, useParams } from 'react-router-dom';
import { chatService } from '../../services/chat.service';
import PaginationControls from '../../components/molecules/PaginationControls';

const ChatPage = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(chatId || '');
  const [activeChat, setActiveChat] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [chatPage, setChatPage] = useState(1);
  const [chatPagination, setChatPagination] = useState(null);
  const [messagePagination, setMessagePagination] = useState(null);
  const [loadingOlder, setLoadingOlder] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const loadChats = async () => {
      try {
        const response = await chatService.getUserChats({ page: chatPage, limit: 20 });
        if (!active) return;
        const list = response.chats || response.data || response || [];
        setChats(list);
        setChatPagination(response.pagination || null);

        if (chatId) {
          setSelectedChatId(chatId);
        } else if (chatPage === 1 && list.length > 0) {
          setSelectedChatId((current) => current || list[0]._id);
        }
      } catch (error) {
        if (active) toast.error(error.response?.data?.message || 'Could not load your conversations.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadChats();
    return () => { active = false; };
  }, [chatId, chatPage]);

  useEffect(() => {
    if (chatId) setSelectedChatId(chatId);
    else setSelectedChatId('');
  }, [chatId]);

  useEffect(() => {
    if (!selectedChatId || !isAuthenticated) return undefined;
    const socket = io(API_URL, { withCredentials: true });
    socket.on('connect', () => socket.emit('joinChat', selectedChatId));
    socket.on('receiveMessage', ({ chatId: receivedChatId, message }) => {
      if (receivedChatId !== selectedChatId) return;
      setActiveChat((current) => {
        if (!current) return current;
        const messages = current.messages || [];
        if (messages.some((item) => item._id === message._id)) return current;
        return { ...current, messages: [...messages, message] };
      });
    });
    socket.on('connect_error', () => toast.error('Live chat connection failed. Messages can still be sent.'));
    return () => socket.disconnect();
  }, [selectedChatId, isAuthenticated]);

  useEffect(() => {
    let active = true;
    const loadSelectedChat = async () => {
      if (!selectedChatId) {
        setActiveChat(null);
        setMessagePagination(null);
        return;
      }

      setActiveChat(null);
      try {
        const response = await chatService.getChatById(selectedChatId);
        if (!active) return;
        const chat = response.data || response.chat || response;
        setActiveChat(chat);
        setMessagePagination(chat.messagesPagination || null);
      } catch (error) {
        if (active) toast.error(error.response?.data?.error || 'Could not load this conversation.');
      }
    };

    loadSelectedChat();
    return () => { active = false; };
  }, [selectedChatId]);

  const loadOlderMessages = async () => {
    if (!selectedChatId || !messagePagination?.hasMore || loadingOlder) return;
    setLoadingOlder(true);
    try {
      const response = await chatService.getChatById(selectedChatId, { before: messagePagination.before });
      const olderChat = response.data || response.chat || response;
      setActiveChat((current) => current?._id === selectedChatId
        ? { ...current, messages: [...(olderChat.messages || []), ...(current.messages || [])] }
        : current);
      setMessagePagination(olderChat.messagesPagination || null);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Could not load older messages.');
    } finally {
      setLoadingOlder(false);
    }
  };

  const currentUserId = user?._id || user?.id;

  const selectedChatTitle = useMemo(() => {
    if (!activeChat) return 'Messages';
    return activeChat.property?.title || 'Property chat';
  }, [activeChat]);

  const handleSend = async () => {
    if (!selectedChatId || !messageText.trim() || sending) return;

    try {
      setSending(true);
      const result = await chatService.sendMessage({ chatId: selectedChatId, text: messageText.trim() });
      setMessageText('');
      const updated = await chatService.getChatById(selectedChatId);
      const chat = updated.data || updated.chat || updated;
      setActiveChat((current) => current?._id === selectedChatId ? chat : current);
      setMessagePagination(chat.messagesPagination || null);
      setChats((current) => current.map((item) => item._id === selectedChatId ? { ...item, updatedAt: result.chat?.updatedAt || new Date().toISOString() } : item));
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Message could not be sent. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-600">Loading chats...</div>;
  }

  return (
    <div className="mx-auto flex h-[calc(100dvh-8rem)] min-h-[28rem] max-w-6xl overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
      <aside className={`${selectedChatId ? 'hidden' : 'flex'} w-full shrink-0 flex-col border-r border-gray-200 bg-gray-50 md:flex md:w-80`}>
        <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="border-b border-gray-200 p-4">
          <h1 className="text-xl font-bold text-gray-900">Messages</h1>
        </div>

        <div className="divide-y divide-gray-200">
          {chats.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">No chats yet.</div>
          ) : (
            chats.map((chat) => (
              <button
                key={chat._id}
                onClick={() => setSelectedChatId(chat._id)}
                className={`block w-full p-4 text-left transition ${selectedChatId === chat._id ? 'bg-white' : 'hover:bg-gray-100'}`}
              >
                <p className="font-semibold text-gray-900">{chat.property?.title || 'Property chat'}</p>
                <p className="mt-1 text-sm text-gray-500">
                  {chat.buyer?.name || 'Buyer'} • {chat.seller?.name || 'Seller'}
                </p>
              </button>
            ))
          )}
        </div>
        </div>
        <PaginationControls pagination={chatPagination} onPageChange={setChatPage} className="px-3 pb-3" />
      </aside>

      <main className={`${selectedChatId ? 'flex' : 'hidden'} min-w-0 flex-1 flex-col md:flex`}>
        <header className="flex items-center gap-3 border-b border-gray-200 p-4">
          <button type="button" onClick={() => { setSelectedChatId(''); if (chatId) navigate('/chat'); }} className="text-sm font-medium text-indigo-600 md:hidden">Back</button>
          <h2 className="truncate text-lg font-semibold text-gray-900">{selectedChatTitle}</h2>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messagePagination?.hasMore && (
            <button type="button" onClick={loadOlderMessages} disabled={loadingOlder} className="mx-auto block rounded-lg px-3 py-2 text-sm font-semibold text-indigo-600 disabled:opacity-50">
              {loadingOlder ? 'Loading…' : 'Load older messages'}
            </button>
          )}
          {activeChat?.messages?.length ? (
            activeChat.messages.map((msg, idx) => (
              <div key={`${msg._id || idx}`} className={`max-w-md rounded-2xl px-4 py-3 ${(msg.sender?._id || msg.sender) === currentUserId ? 'ml-auto bg-indigo-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                {msg.text && <p className="text-sm leading-6 whitespace-pre-wrap break-words">{msg.text}</p>}
                {msg.image && <img src={msg.image} alt="Message attachment" loading="lazy" className="mt-2 max-h-64 rounded-lg object-cover" />}
              </div>
            ))
          ) : (
            <div className="mt-8 text-center text-sm text-gray-500">Start the conversation.</div>
          )}
        </div>

        <div className="border-t border-gray-200 p-4">
          <div className="flex gap-3">
            <input
              value={messageText}
              onChange={(event) => setMessageText(event.target.value)}
              onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); handleSend(); } }}
              maxLength={5000}
              placeholder="Type a message"
              className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white"
            />
            <button
              onClick={handleSend}
              disabled={!selectedChatId || !messageText.trim() || sending}
              className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white disabled:opacity-50"
            >
              {sending ? 'Sending…' : 'Send'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatPage;
