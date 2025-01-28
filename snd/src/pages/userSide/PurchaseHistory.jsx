import React, { useEffect, useState } from 'react';
import { 
  CreditCard, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SecondNavbar from "../../components/SecondNavbar";
import SideBar from "../../components/SideBar";
import { fetchPurchaseHistory } from '../../api2';
// import { fetchPurchaseHistory } from '../../api';

const PurchaseHistoryPage = () => {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const savedState = localStorage.getItem('isSidebarCollapsed');
    return savedState ? JSON.parse(savedState) : false;
  });

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed((prevState) => {
      const newState = !prevState;
      localStorage.setItem('isSidebarCollapsed', JSON.stringify(newState));
      return newState;
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SU':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'FA':
        return <XCircle className="h-5 w-5 text-red-400" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SU':
        return 'text-green-400';
      case 'FA':
        return 'text-red-400';
      default:
        return 'text-yellow-400';
    }
  };

  useEffect(() => {
    const loadPurchases = async () => {
      try {
        const response = await fetchPurchaseHistory();
        setPurchases(response.data);
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    loadPurchases();
  }, []);

  if (isLoading) return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0B1A] to-[#1a2735] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0B1A] to-[#1a2735] text-white flex flex-col">
      <SecondNavbar />
      
      <div className={`flex-1 pt-12 transition-all duration-300`}>
        <SideBar
          isCollapsed={isSidebarCollapsed}
          onToggle={handleSidebarToggle}
        />
        
        <main className={`mx-auto flex-1 p-6 pt-12 transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/account')}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-300"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Account</span>
              </button>
              <h1 className="text-3xl font-bold text-white">Purchase History</h1>
            </div>
            <Calendar className="text-gray-400 h-6 w-6" />
          </div>

          <div className="bg-[#1e2a3a] rounded-xl shadow-lg">
            <div className="p-6">
              <div className="space-y-4">
                {purchases.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    <CreditCard className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                    <p className="text-lg">No purchases found</p>
                  </div>
                ) : (
                  purchases.map((purchase) => (
                    <div
                      key={purchase.order_id}
                      className="bg-[#2c3e50] p-6 rounded-lg hover:bg-[#354b5f] transition-all duration-300"
                    >
                      <div className="flex flex-col md:flex-row justify-between md:items-center space-y-4 md:space-y-0">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 rounded-full bg-blue-500/20">
                            <CreditCard className="h-6 w-6 text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium text-white text-lg">
                              {purchase.plan.name}
                            </p>
                            <p className="text-blue-400 font-medium">
                              {purchase.plan.duration} minutes
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                              Order ID: {purchase.order_id}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end space-y-2">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(purchase.status)}
                            <span className={`${getStatusColor(purchase.status)} font-medium`}>
                              {purchase.status_display}
                            </span>
                          </div>
                          <p className="font-bold text-white text-xl">
                            ₹{purchase.amount}
                          </p>
                          <p className="text-sm text-gray-400">
                            {new Date(purchase.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      {purchase.razorpay_payment_id && (
                        <div className="mt-4 pt-4 border-t border-gray-700">
                          <p className="text-sm text-gray-400">
                            Payment ID: {purchase.razorpay_payment_id}
                          </p>
                          <p className="text-sm text-gray-400">
                            Razorpay Order ID: {purchase.razorpay_order_id}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PurchaseHistoryPage;