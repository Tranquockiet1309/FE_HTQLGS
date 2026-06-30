import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import { MessageSquare, X, Check, HeadphonesIcon, Send, Bell } from 'lucide-react';

export const SupportChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [requests, setRequests] = useState([]); // [{ sessionId, customerName, status, createdAt }]
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [connection, setConnection] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const messagesEndRef = useRef(null);
  // Dùng ref để tránh stale closure trong SignalR event handler
  const activeSessionRef = useRef(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Sync ref mỗi khi activeSession thay đổi
  useEffect(() => {
    activeSessionRef.current = activeSession;
  }, [activeSession]);

  useEffect(() => {
    const setupSignalR = async () => {
      try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        if (!userStr || !token) return;
        
        const user = JSON.parse(userStr);
        if (user.role !== 'ADMIN' && user.role !== 'STAFF' && user.role !== 'OWNER') return;

        // Dùng URL tương đối /hub/support để Vite proxy xử lý
        const newConnection = new signalR.HubConnectionBuilder()
          .withUrl('/hub/support', {
            accessTokenFactory: () => localStorage.getItem('token'),
            transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
          })
          .withAutomaticReconnect()
          .configureLogging(signalR.LogLevel.Warning)
          .build();

        newConnection.on('ReceiveSupportRequest', (session) => {
          setRequests(prev => {
            // Tránh trùng lặp
            if (prev.some(r => r.sessionId === session.sessionId)) return prev;
            return [...prev, session];
          });
        });

        newConnection.on('SupportStatusUpdated', (session) => {
          setRequests(prev => prev
            .map(r => r.sessionId === session.sessionId ? session : r)
            .filter(r => r.status !== 'Closed')
          );
          // Dùng ref để tránh stale closure
          if (activeSessionRef.current?.sessionId === session.sessionId && session.status === 'Closed') {
            setActiveSession(null);
            activeSessionRef.current = null;
            setMessages([]);
            setIsOpen(false);
          }
        });

        // Nhận tin nhắn từ server (bao gồm cả tin của mình – server echo lại)
        newConnection.on('ReceiveMessage', (msg) => {
          // Chỉ thêm tin nhắn của khách hàng (Staff tự thêm ngay khi gửi)
          if (msg.senderRole !== 'Staff') {
            setMessages(prev => [...prev, msg]);
            // Nếu widget đang đóng → đánh dấu có tin nhắn mới
            setIsOpen(prev => {
              if (!prev) setHasNewMessage(true);
              return prev;
            });
          }
        });

        newConnection.on('SessionClosed', () => {
          // Khách hàng thoát / server đóng
          setMessages(prev => [...prev, { senderRole: 'System', senderName: 'Hệ thống', content: 'Khách hàng đã ngắt kết nối.' }]);
        });

        newConnection.onreconnected(() => {
          newConnection.invoke('JoinAdminGroup').catch(console.error);
          setIsConnected(true);
        });
        newConnection.onclose(() => setIsConnected(false));

        await newConnection.start();
        await newConnection.invoke('JoinAdminGroup');
        setIsConnected(true);
        setConnection(newConnection);
      } catch (err) {
        console.error('Error connecting to SupportHub:', err);
      }
    };

    setupSignalR();

    return () => {
      // Cleanup khi component unmount
      setConnection(prev => { prev?.stop(); return null; });
    };
  }, []);

  const handleAccept = async (req) => {
    if (!connection) return;
    try {
      const userStr = localStorage.getItem('user');
      const user = JSON.parse(userStr);
      // Login trả về UserId (PascalCase), JSON.parse ra là camelCase
      const staffId = user.userId ?? user.UserId ?? null;
      console.log('[SupportWidget] AcceptSupport:', { sessionId: req.sessionId, staffId });
      await connection.invoke('AcceptSupport', req.sessionId, staffId);
      await connection.invoke('JoinSession', req.sessionId);
      
      setActiveSession(req);
      activeSessionRef.current = req;
      setRequests(prev => prev.filter(r => r.sessionId !== req.sessionId));
      setIsOpen(true);
      setHasNewMessage(false);
      setMessages([{ senderRole: 'System', senderName: 'Hệ thống', content: `Bạn đã kết nối với ${req.customerName}. Bắt đầu hỗ trợ!` }]);
    } catch (err) {
      console.error('Error accepting support:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !activeSession || !connection) return;
    const text = input.trim();
    try {
      const userStr = localStorage.getItem('user');
      const user = JSON.parse(userStr);
      const senderName = user.fullName ?? user.FullName ?? 'Nhân viên';
      // Hiển thị tin nhắn của mình ngay lập tức
      const optimisticMsg = { senderRole: 'Staff', senderName, content: text };
      setMessages(prev => [...prev, optimisticMsg]);
      setInput('');
      await connection.invoke('SendMessage', activeSession.sessionId, senderName, 'Staff', text);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleCloseSession = async () => {
    if (!activeSession || !connection) return;
    try {
      await connection.invoke('CloseSession', activeSession.sessionId);
      setActiveSession(null);
      activeSessionRef.current = null;
      setMessages([]);
      setIsOpen(false);
    } catch (err) {
      console.error('Error closing session:', err);
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'Waiting');

  // Không hiển thị gì nếu chưa kết nối và không có request
  if (!isConnected && pendingRequests.length === 0 && !activeSession) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      {/* Pending Requests Bubble – chớp nháy khi có yêu cầu mới */}
      {pendingRequests.map(req => (
        <div
          key={req.sessionId}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border-2 border-blue-400 dark:border-blue-500 p-4 w-72"
          style={{ animation: 'slideInRight 0.3s ease-out' }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg">
              <HeadphonesIcon size={16} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm text-slate-800 dark:text-white">{req.customerName}</p>
              <p className="text-xs text-blue-500 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block animate-pulse" />
                Đang yêu cầu hỗ trợ...
              </p>
            </div>
            <Bell size={18} className="text-blue-500 animate-bounce" />
          </div>
          <button
            onClick={() => handleAccept(req)}
            className="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-2 rounded-lg text-sm flex items-center justify-center gap-2 hover:opacity-90 hover:shadow-lg hover:shadow-blue-500/30 transition-all"
          >
            <Check size={16} /> Chấp nhận Chat
          </button>
        </div>
      ))}

      {/* Active Chat Window */}
      {isOpen && activeSession && (
        <div className="bg-white dark:bg-slate-900 w-80 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden" style={{ height: '420px' }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <HeadphonesIcon size={16} className="text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm truncate max-w-[150px]">{activeSession.customerName}</p>
                <p className="text-blue-100 text-[10px] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block animate-pulse" /> Đang kết nối
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCloseSession}
                className="text-white/80 hover:text-white text-[11px] font-semibold px-2 py-1 bg-white/20 hover:bg-white/30 rounded-md transition"
              >
                Kết thúc
              </button>
              <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white p-1 hover:bg-white/10 rounded transition">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-slate-50 dark:bg-slate-950/50">
            {messages.map((msg, idx) => {
              const isStaff = msg.senderRole === 'Staff';
              const isSystem = msg.senderRole === 'System';
              if (isSystem) {
                return (
                  <div key={idx} className="flex justify-center">
                    <span className="text-[10px] text-slate-400 bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                      {msg.content}
                    </span>
                  </div>
                );
              }
              return (
                <div key={idx} className={`flex flex-col ${isStaff ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] text-slate-400 mb-0.5 px-1">{msg.senderName}</span>
                  <div className={`px-3 py-2 rounded-2xl text-sm max-w-[85%] shadow-sm ${
                    isStaff
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-br-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-bl-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2 flex-shrink-0">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSendMessage(); }}
              placeholder="Nhập tin nhắn trả lời..."
              className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white placeholder-slate-400"
            />
            <button
              onClick={handleSendMessage}
              disabled={!input.trim()}
              className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-2 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Minimized Icon (if active but closed) */}
      {!isOpen && activeSession && (
        <button
          onClick={() => { setIsOpen(true); setHasNewMessage(false); }}
          className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform relative"
        >
          <MessageSquare size={24} />
          {hasNewMessage && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold animate-bounce">!</span>
          )}
        </button>
      )}
    </div>
  );
};
