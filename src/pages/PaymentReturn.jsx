import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { paymentService } from '../services/paymentService';
import { CheckCircle, XCircle, ArrowLeft, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

export const PaymentReturn = () => {
  const [status, setStatus] = useState('loading');
  const [paymentData, setPaymentData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const hasProcessed = useRef(false); // Ngăn gọi 2 lần (React StrictMode)

  useEffect(() => {
    if (hasProcessed.current) return; // Nếu đã xử lý rồi thì bỏ qua
    hasProcessed.current = true;

    const processPayment = async () => {
      try {
        const queryString = location.search;
        if (!queryString) {
          setStatus('error');
          setErrorMessage('Không tìm thấy thông tin thanh toán.');
          return;
        }

        const response = await paymentService.vnPayCallback(queryString);

        if (response.success && response.data?.success) {
          setStatus('success');
          setPaymentData(response.data);
          toast.success('Thanh toán thành công!');
        } else {
          setStatus('error');
          setErrorMessage(response.message || 'Thanh toán thất bại hoặc có lỗi xảy ra.');
          toast.error('Thanh toán thất bại');
        }
      } catch (error) {
        setStatus('error');
        setErrorMessage(error.response?.data?.message || 'Lỗi kết nối đến máy chủ.');
        toast.error('Lỗi khi xử lý thanh toán');
      }
    };

    processPayment();
  }, [location.search]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 dark:bg-gray-900 transition-colors duration-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Kết Quả Thanh Toán
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200 dark:border-gray-700">
          
          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader className="w-12 h-12 text-blue-500 animate-spin" />
              <p className="text-gray-600 dark:text-gray-300">Đang xử lý kết quả thanh toán, vui lòng đợi...</p>
            </div>
          )}

          {status === 'success' && paymentData && (
            <div className="flex flex-col items-center space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Thanh Toán Thành Công!</h3>
                <p className="text-gray-500 dark:text-gray-400">Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.</p>
              </div>

              <div className="w-full bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Mã đơn hàng:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">#{paymentData.orderId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Mã giao dịch:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{paymentData.transactionId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Nội dung:</span>
                  <span className="font-semibold text-gray-900 dark:text-white truncate max-w-[150px]" title={paymentData.orderDescription}>
                    {paymentData.orderDescription}
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate('/')}
                className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Về trang chủ
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center space-y-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-12 h-12 text-red-500" />
              </div>
              
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Giao Dịch Thất Bại</h3>
                <p className="text-red-500 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-800/30">
                  {errorMessage}
                </p>
              </div>

              <div className="flex w-full space-x-3 mt-6">
                <button
                  onClick={() => navigate('/')}
                  className="flex-1 flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Về trang chủ
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
