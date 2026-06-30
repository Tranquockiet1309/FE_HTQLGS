import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, RotateCcw, Zap, HeadphonesIcon } from 'lucide-react';
import * as signalR from '@microsoft/signalr';

/* ============================================================
   🤖 OPENROUTER AI CHATBOT
   Sử dụng API miễn phí 100% từ OpenRouter
   ============================================================ */
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Thông tin cố định của tiệm (không thay đổi)
const SHOP_INFO = `
Thông tin tiệm:
- Tên: QuocKiet Laundry Service
- Địa chỉ: 20 Tăng Nhơn Phú, Phường Long B, Thủ Đức, Hồ Chí Minh
- Điện thoại: 0900.999.333
- Email: salonbooking@example.com
- Giờ mở cửa: Thứ 2 – Chủ nhật: 8:00 – 20:00 | Nghỉ lễ: 9:00 – 18:00

Điểm tích lũy:
- Mỗi 10.000đ = 1 điểm
- 100 điểm = giảm 10.000đ cho đơn tiếp theo

Giao nhận tận nơi:
- Bán kính 10km, phí 15.000đ – 30.000đ
- Miễn phí cho đơn từ 200.000đ trở lên
- Thời gian trả đồ thường: 2–4 tiếng; dịch vụ nhanh: 60 phút`;

// Tạo system prompt động từ nhiều nguồn dữ liệu DB
function buildSystemPrompt(services, customer, recentOrders) {
  // 1. Bảng giá dịch vụ
  const serviceLines = services && services.length > 0
    ? services.map(s =>
        `- ${s.serviceName}: ${s.unitPrice?.toLocaleString('vi-VN')}đ/${s.unit || 'kg'}${s.description ? ` (${s.description})` : ''}`
      ).join('\n')
    : '- Vui lòng liên hệ 0900.999.333 để biết bảng giá chi tiết.';

  // 2. Thông tin khách hàng đang đăng nhập (cá nhân hóa)
  const customerSection = customer
    ? `
Thông tin khách hàng đang trò chuyện:
- Họ tên: ${customer.fullName || 'Khách'}
- Điểm tích lũy hiện tại: ${customer.pointBalance?.toLocaleString() || 0} điểm (tương đương ${((customer.pointBalance || 0) * 100).toLocaleString()}đ giảm giá)
- Địa chỉ thường dùng: ${customer.address || 'Chưa cập nhật'}`
    : `
Khách hàng chưa đăng nhập (khách vãng lai).`;

  // 3. Đơn hàng gần đây (để bot hỗ trợ tra cứu)
  const orderSection = recentOrders && recentOrders.length > 0
    ? `
Lịch sử đơn hàng gần đây của khách (3 đơn mới nhất):
${recentOrders.slice(0, 3).map(o =>
  `- Mã đơn: ${o.orderCode} | Trạng thái: ${translateStatus(o.status)} | Tổng: ${o.totalAmount?.toLocaleString('vi-VN')}đ | Ngày đặt: ${new Date(o.receivedAt).toLocaleDateString('vi-VN')}`
).join('\n')}`
    : '';

  return `Bạn là trợ lý chăm sóc khách hàng thân thiện của tiệm giặt sấy QuocKiet Laundry Service.
${SHOP_INFO}
${customerSection}

Bảng giá dịch vụ (cập nhật từ hệ thống):
${serviceLines}
${orderSection}

Quy tắc trả lời:
- Trả lời bằng tiếng Việt, ngắn gọn, thân thiện, dùng emoji phù hợp
- Nếu khách hỏi về đơn hàng của họ, dùng thông tin lịch sử ở trên để trả lời
- Nếu khách hỏi điểm tích lũy, hãy cho biết số điểm hiện tại và quy đổi được bao nhiêu tiền
- Gọi khách bằng tên (nếu đã đăng nhập)
- Không bịa thông tin, nếu không chắc hướng khách gọi 0900.999.333`;
}

function translateStatus(status) {
  const map = {
    Pending: 'Chờ xử lý', Washing: 'Đang giặt', Drying: 'Đang sấy',
    Ironing: 'Đang ủi', Completed: 'Hoàn thành', Shipped: 'Đang giao',
    Arrived: 'Đã đến nơi', Delivered: 'Đã nhận hàng', Cancelled: 'Đã hủy',
  };
  return map[status] || status;
}

// ── Constants ─────────────────────────────────────────────────
const SUGGESTED = [
  '💰 Giá giặt sấy bao nhiêu?',
  '⏱️ Giặt mất bao lâu?',
  '🛵 Có giao nhận tận nơi không?',
  '📦 Đơn hàng của tôi đang ở đâu?',
  '⭐ Tôi có bao nhiêu điểm tích lũy?',
];

const WELCOME = {
  role: 'bot',
  text: 'Xin chào! 👋 Tôi là trợ lý AI của **QuocKiet Laundry**.\n\nTôi có thể giải đáp mọi thắc mắc về dịch vụ, tra cứu đơn hàng và điểm tích lũy của bạn. Bạn muốn hỏi gì nào? 😊',
};

function parseMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>');
}

// ── Component ─────────────────────────────────────────────────
export const Chatbot = () => {
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [systemPrompt, setSystemPrompt] = useState(buildSystemPrompt([], null, []));
  const [history, setHistory]   = useState([]);
  const [servicesLoaded, setServicesLoaded] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);
  
  // Live Chat state
  const [isLiveChat, setIsLiveChat] = useState(false);
  const [liveChatStatus, setLiveChatStatus] = useState(null); // 'Waiting', 'Active', 'Closed'
  const [supportConnection, setSupportConnection] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [customerInfo, setCustomerInfo] = useState(null);

  // ── Fetch tất cả dữ liệu cần thiết từ DB ─────────────────────
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const { productService } = await import('../services/productService');
        const { authService }    = await import('../services/authService');
        const { customerService } = await import('../services/customerService');
        const { orderService }   = await import('../services/orderService');

        // Chạy song song để nhanh hơn
        const [servicesRes, meRes] = await Promise.allSettled([
          productService.getAll(true),
          authService.getMe(),
        ]);

        const services = servicesRes.status === 'fulfilled'
          ? (servicesRes.value.data || []) : [];

        let customer = null;
        let recentOrders = [];

        // Nếu đã đăng nhập → lấy thêm thông tin cá nhân + đơn hàng
        if (meRes.status === 'fulfilled' && meRes.value.success) {
          const me = meRes.value.data;

          const [customerRes, ordersRes] = await Promise.allSettled([
            me.customerId ? customerService.getById(me.customerId) : Promise.resolve(null),
            orderService.getMyOrders(),
          ]);

          if (customerRes.status === 'fulfilled' && customerRes.value?.data) {
            customer = { ...me, ...customerRes.value.data };
          } else {
            customer = me;
          }
          setCustomerInfo(customer);

          if (ordersRes.status === 'fulfilled') {
            recentOrders = ordersRes.value.data || [];
          }
        }

        const prompt = buildSystemPrompt(services, customer, recentOrders);
        setSystemPrompt(prompt);
        setHistory([{ role: 'system', content: prompt }]);

        // Cá nhân hóa lời chào nếu đã đăng nhập
        if (customer?.fullName) {
          setMessages([{
            role: 'bot',
            text: `Xin chào **${customer.fullName}**! 👋 Tôi là trợ lý AI của **QuocKiet Laundry**.\n\nBạn đang có **${customer.pointBalance?.toLocaleString() || 0} điểm** tích lũy. Tôi có thể tra cứu đơn hàng, tư vấn dịch vụ cho bạn. Hỏi đi! 😊`,
          }]);
        }
      } catch (err) {
        console.warn('Chatbot: Lỗi khi tải dữ liệu.', err);
        setHistory([{ role: 'system', content: buildSystemPrompt([], null, []) }]);
      } finally {
        setServicesLoaded(true);
      }
    };
    fetchAllData();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const startSupportSession = async () => {
    try {
      const token = localStorage.getItem('token');
      // Dùng URL tương đối /hub/support để Vite proxy xử lý (không hardcode port)
      const connection = new signalR.HubConnectionBuilder()
        .withUrl('/hub/support', {
          accessTokenFactory: () => localStorage.getItem('token'),
          transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Warning)
        .build();

      await connection.start();

      connection.on('ReceiveMessage', (msg) => {
        if (msg.senderRole === 'Staff') {
          setMessages(prev => [...prev, { role: 'bot', text: `**${msg.senderName} (Nhân viên):** ${msg.content}` }]);
        }
      });

      connection.on('SupportAccepted', (staffId) => {
        setLiveChatStatus('Active');
        setMessages(prev => [...prev, { role: 'bot', text: 'Nhân viên đã tham gia cuộc trò chuyện. Hãy đặt câu hỏi của bạn!' }]);
      });

      connection.on('SessionClosed', () => {
        setLiveChatStatus('Closed');
        setMessages(prev => [...prev, { role: 'bot', text: 'Phiên hỗ trợ đã kết thúc. Bot sẽ trở lại phục vụ bạn.' }]);
        setIsLiveChat(false);
      });

      const cName = customerInfo ? customerInfo.fullName : 'Khách vãng lai';
      const cId = customerInfo ? customerInfo.customerId : null;

      const sid = await connection.invoke('RequestSupport', cName, cId);

      setSessionId(sid);
      setSupportConnection(connection);
      setIsLiveChat(true);
      setLiveChatStatus('Waiting');

      setMessages(prev => [...prev, { role: 'bot', text: 'Đang kết nối với nhân viên hỗ trợ. Vui lòng chờ trong giây lát...' }]);

      // Cài đặt timeout 60s
      setTimeout(() => {
        setLiveChatStatus(prevStatus => {
           if (prevStatus === 'Waiting') {
               setIsLiveChat(false);
               setMessages(m => [...m, { role: 'bot', text: 'Hiện tại tất cả nhân viên đều đang bận. Quý khách vui lòng để lại số điện thoại hoặc liên hệ Hotline 0900.999.333 để được hỗ trợ nhanh nhất!' }]);
               connection.stop();
               return 'Closed';
           }
           return prevStatus;
        });
      }, 60000);

    } catch (err) {
      console.error('SignalR Error: ', err);
      setMessages(prev => [...prev, { role: 'bot', text: '❌ Không thể kết nối với nhân viên hỗ trợ lúc này.' }]);
    }
  };

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setMessages(prev => [...prev, { role: 'user', text: trimmed }]);
    setInput('');
    
    if (isLiveChat) {
      if (liveChatStatus === 'Closed' || liveChatStatus === null) {
         setIsLiveChat(false);
         setSupportConnection(null);
         setSessionId(null);
      } else {
         try {
             const cName = customerInfo ? customerInfo.fullName : 'Khách vãng lai';
             // Hiển thị tin nhắn của mình ngay lập tức (optimistic update)
             await supportConnection.invoke('SendMessage', sessionId, cName, 'Customer', trimmed);
         } catch (e) {
             console.error('Send Error', e);
         }
         return;
      }
    } else {
        const triggerWords = ['kết nối với nhân viên', 'gặp nhân viên', 'nhân viên hỗ trợ', 'hỗ trợ trực tiếp'];
        if (triggerWords.some(w => trimmed.toLowerCase().includes(w))) {
           await startSupportSession();
           return;
        }
    }

    setLoading(true);

    if (!OPENROUTER_API_KEY) {
      setMessages(prev => [...prev, { role: 'bot', text: '⚠️ Lỗi: Chưa cấu hình VITE_OPENROUTER_API_KEY trong file `.env`.' }]);
      setLoading(false);
      return;
    }

    try {
      const newHistory = [
        ...history,
        { role: 'user', content: trimmed },
      ];

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': window.location.origin, 
          'X-Title': 'QuocKiet Laundry', 
        },
        body: JSON.stringify({
          model: 'cohere/north-mini-code:free', // Model theo yêu cầu của bạn
          messages: newHistory,
          temperature: 0.7,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        const botText = data.choices?.[0]?.message?.content || 'Xin lỗi, tôi không thể trả lời câu hỏi này lúc này.';
        setHistory([
          ...newHistory,
          { role: 'assistant', content: botText },
        ]);
        setMessages(prev => [...prev, { role: 'bot', text: botText }]);
      } else {
        const errMsg = data.error?.message || 'Lỗi kết nối tới OpenRouter API.';
        setMessages(prev => [...prev, { role: 'bot', text: `❌ Lỗi API: ${errMsg}` }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: `❌ Đã xảy ra lỗi hệ thống: ${err.message}` }]);
    }

    setLoading(false);
    inputRef.current?.focus();
  };

  const handleReset = () => {
    // Nếu đang live chat thì dừng kết nối trước
    if (supportConnection) {
      supportConnection.stop();
      setSupportConnection(null);
    }
    setIsLiveChat(false);
    setLiveChatStatus(null);
    setSessionId(null);
    setMessages([WELCOME]);
    setHistory([{ role: 'system', content: systemPrompt }]);
    setInput('');
  };

  return (
    <div
      className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-white/70 dark:border-slate-700/50 flex flex-col overflow-hidden"
      style={{ height: '520px' }}
    >
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-700 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              {isLiveChat ? <HeadphonesIcon size={18} className="text-white" /> : <Bot size={18} className="text-white" />}
            </div>
            <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-indigo-700 ${
              isLiveChat && liveChatStatus === 'Active' ? 'bg-green-400 animate-pulse' :
              isLiveChat && liveChatStatus === 'Waiting' ? 'bg-yellow-400 animate-bounce' :
              'bg-emerald-400'
            }`} />
          </div>
          <div>
            <p className="text-white font-black text-sm leading-tight">
              {isLiveChat ? 'Live Chat Hỗ Trợ' : 'QuocKiet AI'}
            </p>
            <p className="text-blue-100 text-[10px] flex items-center gap-1">
              {isLiveChat ? (
                <>
                  <HeadphonesIcon size={9} className="text-yellow-300" />
                  {liveChatStatus === 'Waiting' ? 'Đang chờ nhân viên...' :
                   liveChatStatus === 'Active'  ? 'Nhân viên đang trực tuyến' :
                   'Phức vụ kết thúc'}
                </>
              ) : (
                <>
                  <Zap size={9} className="text-yellow-300" /> OpenRouter AI
                </>
              )}
            </p>
          </div>
        </div>
        <button
          onClick={handleReset}
          title={isLiveChat ? 'Kết thúc chat với nhân viên' : 'Bắt đầu lại'}
          className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition"
        >
          <RotateCcw size={14} />
        </button>
      </div>

      {/* ── MESSAGES ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50 dark:bg-slate-950/50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'bot' && (
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mb-0.5 shadow ${isLiveChat && msg.text.includes('(Nhân viên)') ? 'bg-gradient-to-br from-yellow-500 to-orange-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600'}`}>
                {isLiveChat && msg.text.includes('(Nhân viên)') ? <HeadphonesIcon size={13} className="text-white" /> : <Bot size={13} className="text-white" />}
              </div>
            )}
            <div
              className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-br-md'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-bl-md border border-slate-100 dark:border-slate-700'
              }`}
              dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.text) }}
            />
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex items-end gap-2 justify-start">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mb-0.5 shadow">
              <Bot size={13} className="text-white" />
            </div>
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
              <div className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── SUGGESTED ── */}
      {messages.length === 1 && !loading && (
        <div className="px-3 py-2 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex gap-1.5 overflow-x-auto flex-shrink-0 scrollbar-hide">
          {SUGGESTED.map((q, i) => (
            <button
              key={i}
              onClick={() => sendMessage(q)}
              className="flex-shrink-0 text-[10px] font-bold px-2.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition whitespace-nowrap"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* ── INPUT ── */}
      <div className="flex items-center gap-2 px-3 py-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0">
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }}}
          placeholder="Nhập câu hỏi của bạn..."
          disabled={loading}
          className="flex-1 text-xs px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-blue-300 dark:focus:border-blue-600 focus:outline-none text-slate-800 dark:text-white placeholder-slate-400 transition disabled:opacity-60"
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || loading}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow hover:shadow-blue-400/50 hover:scale-105 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 flex-shrink-0"
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
};
