import React from 'react';
import { MapPin, Phone, Mail, Clock, Navigation, Shirt, Star, MessageCircle } from 'lucide-react';
import { Chatbot } from '../components/Chatbot';

/* ============================================================
   🗺️  HƯỚNG DẪN GẮN LINK GOOGLE MAPS
   ============================================================
   Có 2 cách để nhúng bản đồ Google Maps:

   CÁCH 1 – Dùng <iframe> Embed (KHUYÊN DÙNG, miễn phí):
     1. Vào https://maps.google.com
     2. Tìm địa chỉ tiệm của bạn
     3. Nhấn "Chia sẻ" → "Nhúng bản đồ"
     4. Chép đoạn <iframe> được cấp
     5. Dán vào phần GOOGLE_MAPS_EMBED_SRC bên dưới (chỉ lấy src="...")

   CÁCH 2 – Dùng Google Maps API (cần API Key):
     Thêm key vào .env: VITE_GOOGLE_MAPS_API_KEY=<your_key>
     Sau đó dùng thư viện @react-google-maps/api
   ============================================================ */

// 🔽🔽🔽 THAY src DƯỚI ĐÂY BẰNG LINK EMBED CỦA BẠN 🔽🔽🔽
const GOOGLE_MAPS_EMBED_SRC =
  'https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d454997.54026915634!2d106.00678380625001!3d10.096109971962262!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e1!3m2!1svi!2s!4v1782756036735!5m2!1svi!2s" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="strict-origin-when-cross-origin';
// 🔼🔼🔼 THAY ĐÊN ĐÂY 🔼🔼🔼

// 🔽 Link mở Google Maps khi bấm nút "Xem bản đồ lớn hơn"
const GOOGLE_MAPS_DIRECT_LINK =
  'https://maps.google.com/?q=113+ấp+Khúc+Ngay,+xã+Hiệp+Mỹ,huyện+Cầu+Ngang,Phường+Trà+Vinh,Tỉnh+Vĩnh+Long,Việt+Nam';
// 🔼 THAY LINK NÀY THÀNH ĐỊA CHỈ THẬT CỦA TIỆM 🔼

const FAQ = [
  {
    icon: Shirt,
    color: 'bg-blue-50 dark:bg-blue-500/10',
    iconColor: 'text-blue-500',
    q: 'Thời gian giặt sấy mất bao lâu?',
    a: 'Thông thường từ 2–4 tiếng. Dịch vụ nhanh hoàn thành trong 1 tiếng.',
  },
  {
    icon: Star,
    color: 'bg-amber-50 dark:bg-amber-500/10',
    iconColor: 'text-amber-500',
    q: 'Có nhận giặt đồ cao cấp không?',
    a: 'Có! Chúng tôi chuyên giặt áo vest, váy dạ hội, đồ len với quy trình đặc biệt.',
  },
  {
    icon: MessageCircle,
    color: 'bg-emerald-50 dark:bg-emerald-500/10',
    iconColor: 'text-emerald-500',
    q: 'Có dịch vụ giao nhận tận nơi không?',
    a: 'Có, chúng tôi hỗ trợ giao nhận trong bán kính 10km từ cửa hàng.',
  },
];

export const Contact = () => {

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 py-12 px-4">
      <div className="max-w-6xl mx-auto">

        {/* ===== TIÊU ĐỀ ===== */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-slate-800 dark:text-white mb-3">
            Liên Hệ{' '}
            <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
              Chúng Tôi
            </span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy liên hệ với chúng tôi!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* ===== CỘT TRÁI — BẢN ĐỒ + THÔNG TIN ===== */}
          <div className="flex flex-col gap-6">

            {/* 🗺️ KHUNG GOOGLE MAPS */}
            <div className="rounded-2xl overflow-hidden shadow-xl border border-white/70 dark:border-slate-700/50 bg-white dark:bg-slate-900">
              {/* Header card bản đồ */}
              <div className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <MapPin size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-black text-sm">Vị Trí Salon</p>
                  <p className="text-blue-100 text-xs">Tìm chúng tôi trên bản đồ</p>
                </div>
              </div>

              {/*
               * =========================================================
               * 📌 ĐÂY LÀ CHỖ NHÚNG GOOGLE MAPS
               *    Thay GOOGLE_MAPS_EMBED_SRC ở đầu file bằng link của bạn
               * =========================================================
               */}
              <div className="relative w-full" style={{ height: '300px' }}>
                <iframe
                  title="Vị trí tiệm giặt sấy"
                  src={GOOGLE_MAPS_EMBED_SRC}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0"
                />
              </div>

              {/* Nút mở Google Maps */}
              <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <a
                  href={GOOGLE_MAPS_DIRECT_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
                >
                  <Navigation size={13} />
                  Xem bản đồ lớn hơn
                </a>
              </div>
            </div>

            {/* THÔNG TIN LIÊN HỆ */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-white/70 dark:border-slate-700/50 divide-y divide-slate-100 dark:divide-slate-800">

              {/* Địa chỉ */}
              <div className="flex items-start gap-4 p-5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <MapPin size={18} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Địa Chỉ</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">20 Tăng Nhơn Phú</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Phước Long B, Thủ Đức, Hồ Chí Minh</p>
                </div>
              </div>

              {/* Liên hệ */}
              <div className="flex items-start gap-4 p-5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <Phone size={18} className="text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Liên Hệ</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">Điện thoại: 0900.999.333</p>
                  <a href="mailto:salonbooking@example.com" className="text-xs text-blue-500 hover:underline">
                    Email: salonbooking@example.com
                  </a>
                </div>
              </div>

              {/* Giờ hoạt động */}
              <div className="flex items-start gap-4 p-5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <Clock size={18} className="text-amber-500" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Giờ Hoạt Động</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">Thứ 2 – Chủ nhật: 8:00 – 20:00</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Nghỉ lễ: 9:00 – 18:00</p>
                </div>
              </div>
            </div>
          </div>

          {/* ===== CỘT PHẢI — AI CHATBOT ===== */}
          <div className="flex flex-col">
            <Chatbot />
          </div>
        </div>

        {/* ===== FOOTER BUTTONS ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          <a
            href="tel:0900999333"
            className="flex items-center justify-center gap-3 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black shadow-lg shadow-emerald-500/30 hover:scale-[1.02] transition-all"
          >
            <Phone size={20} />
            <div className="text-left">
              <p className="text-sm">Gọi Ngay</p>
              <p className="text-xs font-normal opacity-80">(123) 456-7890</p>
            </div>
          </a>
          <a
            href="mailto:salonbooking@example.com"
            className="flex items-center justify-center gap-3 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black shadow-lg shadow-blue-500/30 hover:scale-[1.02] transition-all"
          >
            <Mail size={20} />
            <div className="text-left">
              <p className="text-sm">Email</p>
              <p className="text-xs font-normal opacity-80">salonbooking@example.com</p>
            </div>
          </a>
        </div>

      </div>
    </div>
  );
};
