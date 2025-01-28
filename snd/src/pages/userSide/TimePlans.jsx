import React, { useState, useEffect } from 'react';
import { Clock, CreditCard, Shield, Medal, ArrowLeft, Sparkles, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createOrder, listPlans, verifyPayment } from '../../api2';
import { loadScript } from '../../util';
import SecondNavbar from "../../components/SecondNavbar";
import SideBar from '../../components/SideBar';

const TimePlans = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
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

  useEffect(() => {
    fetchPlans();
  }, []);

  const loadRazorpay = async () => {
    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
    if (!res) {
      alert('Razorpay SDK failed to load. Please check your internet connection.');
      return false;
    }
    return true;
  };

  const fetchPlans = async () => {
    try {
      const response = await listPlans();
      setPlans(response);
    } catch (error) {
      console.error('Failed to load plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (plan) => {
    try {
      const isLoaded = await loadRazorpay();
      if (!isLoaded) return;

      setSelectedPlan(plan);
      const orderData = await createOrder(plan.id);
      
      if (!orderData.key || !orderData.order_id) {
        throw new Error('Invalid order data received from server');
      }

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.order_id,
        name: "TimeShare Premium",
        description: `Purchase ${plan.minutes} premium minutes`,
        handler: async (response) => {
          try {
            await verifyPayment(plan.id, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            alert(`Successfully purchased ${plan.minutes} premium minutes!`);
            navigate('/account');
          } catch (error) {
            console.error('Payment verification failed:', error);
            alert('Payment verification failed');
          }
        },
        prefill: {
          name: "User Name",
          email: "user@example.com",
          contact: "9999999999"
        },
        theme: {
          color: "#6366F1"
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
      
      paymentObject.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        alert('Payment failed. Please try again.');
      });

    } catch (error) {
      console.error('Payment initiation failed:', error);
      alert('Failed to initiate payment. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0B1A] to-[#1a2735] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0B1A] to-[#1a2735] text-white flex flex-col">
      <SecondNavbar />
      
      <div className="flex-1 pt-12 transition-all duration-300">
        <SideBar
          isCollapsed={isSidebarCollapsed}
          onToggle={handleSidebarToggle}
        />
        
        <main className={`mx-auto flex-1 p-6 pt-12 transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          <button
            onClick={() => navigate('/account')}
            className="flex items-center space-x-2 text-gray-400 hover:text-white mb-8 transition-colors duration-300"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Account</span>
          </button>

          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 mb-4">
              <Sparkles className="h-6 w-6 text-indigo-400 animate-pulse" />
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Premium Time Credits
              </h1>
              <Sparkles className="h-6 w-6 text-indigo-400 animate-pulse" />
            </div>
            <p className="mt-3 max-w-xl mx-auto text-gray-300 text-lg">
              Unlock unlimited possibilities with our premium time packages
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-6xl mx-auto">
            <div className="flex flex-col items-center p-6 bg-gradient-to-b from-indigo-900/40 to-purple-900/40 rounded-xl backdrop-blur-sm shadow-lg">
              <Shield className="w-10 h-10 text-indigo-400 mb-3" />
              <h3 className="text-lg font-bold mb-2 text-white">Premium Security</h3>
              <p className="text-gray-300 text-center">Enterprise-grade protection</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-gradient-to-b from-indigo-900/40 to-purple-900/40 rounded-xl backdrop-blur-sm shadow-lg">
              <Zap className="w-10 h-10 text-indigo-400 mb-3" />
              <h3 className="text-lg font-bold mb-2 text-white">Instant Access</h3>
              <p className="text-gray-300 text-center">Immediate premium activation</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-gradient-to-b from-indigo-900/40 to-purple-900/40 rounded-xl backdrop-blur-sm shadow-lg">
              <Medal className="w-10 h-10 text-indigo-400 mb-3" />
              <h3 className="text-lg font-bold mb-2 text-white">Priority Support</h3>
              <p className="text-gray-300 text-center">24/7 premium assistance</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <div 
                key={plan.id}
                className="group relative bg-gradient-to-b from-indigo-900/40 to-purple-900/40 rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                {/* <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" /> */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
                <div className="absolute top-0 right-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1 rounded-bl-lg">
                  Premium
                </div>
                
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline mb-6">
                    <span className="text-4xl font-extrabold text-white">
                      ₹{plan.price}
                    </span>
                    <span className="ml-1 text-xl text-gray-400">/pack</span>
                  </div>
                  <p className="text-gray-300 mb-6">{plan.description}</p>
                  <div className="mb-8">
                    <div className="flex items-center mb-4">
                      <Clock className="w-5 h-5 mr-2 text-indigo-400" />
                      <span className="text-gray-300">{plan.minutes} premium minutes</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handlePurchase(plan)}
                    className="w-full rounded-lg px-4 py-3 font-semibold transition-all duration-300 flex items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white group-hover:shadow-lg"
                  >
                    <CreditCard className="w-5 h-5 mr-2" />
                    Purchase Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default TimePlans;