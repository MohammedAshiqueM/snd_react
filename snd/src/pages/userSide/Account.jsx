import React, { useEffect, useState } from 'react';
import { 
  Clock, 
  Timer, 
  CreditCard, 
  RefreshCw,
  Wallet,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SecondNavbar from "../../components/SecondNavbar";
import SideBar from "../../components/SideBar";
import { timeTransaction } from '../../api';
import { useAuthStore } from '../../store/useAuthStore';

const TimeAccountPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [timeData, setTimeData] = useState({
    transactions: [],
    timeBalance: {
      total_time: 0,
      available_time: 0,
      held_time: 0
    }
  });
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [filterType, setFilterType] = useState('all');
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

  const filterTransactions = (type) => {
    setFilterType(type);
    
    if (type === 'all') {
      setFilteredTransactions(timeData.transactions);
    } else if (type === 'credit') {
      setFilteredTransactions(
        timeData.transactions.filter(t => 
          t.to_user.id === user.id && t.from_user.role === 'user'
        )
      );
    } else if (type === 'debit') {
      setFilteredTransactions(
        timeData.transactions.filter(t => 
          t.from_user.id === user.id
        )
      );
    } else if (type === 'purchase') {
      setFilteredTransactions(
        timeData.transactions.filter(t => 
          t.to_user.id === user.id && t.from_user.role === 'admin'
        )
      );
    }
  };

  useEffect(() => {
    const fetchTimeTransactions = async () => {
      try {
        const response = await timeTransaction();
        
        setTimeData({
          transactions: response.transactions,
          timeBalance: response.time_balance
        });
        setFilteredTransactions(response.transactions);
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchTimeTransactions();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0B1A] to-[#1a2735] text-white flex flex-col">
      <SecondNavbar />
      
      <div className={`flex-1 pt-12 transition-all duration-300`}>
        <SideBar
          isCollapsed={isSidebarCollapsed}
          onToggle={handleSidebarToggle}
        />
        
        <main className={`mx-auto flex-1 p-6 pt-12 transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#1e2a3a] rounded-xl p-6 col-span-1">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-700 rounded w-1/2"></div>
                <div className="space-y-3">
                  {[1,2,3].map((_, index) => (
                    <div 
                      key={index} 
                      className="h-16 bg-[#2c3e50] rounded-lg"
                    ></div>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-[#1e2a3a] rounded-xl p-6 col-span-2">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-700 rounded w-1/2"></div>
                <div className="space-y-3">
                  {[1,2,3,4].map((_, index) => (
                    <div 
                      key={index} 
                      className="h-16 bg-[#2c3e50] rounded-lg"
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Time Balance Card */}
            <div className="bg-[#1e2a3a] rounded-xl p-6 shadow-lg col-span-1 hover:shadow-2xl transition-all duration-300">
                <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-200">Time Balance</h2>
                <RefreshCw className="text-gray-400 hover:text-white cursor-pointer transition-colors duration-300" />
                </div>
                
                <div className="space-y-6">
                <div className="flex justify-between items-center p-3 bg-[#2c3e50] rounded-lg hover:bg-[#354b5f] transition-colors">
                    <div className="flex items-center space-x-3">
                    <Clock className="h-6 w-6 text-blue-400" />
                    <span className="text-gray-300">Total Time</span>
                    </div>
                    <span className="font-bold text-white">{timeData.timeBalance.total_time} min</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-[#2c3e50] rounded-lg hover:bg-[#354b5f] transition-colors">
                    <div className="flex items-center space-x-3">
                    <Timer className="h-6 w-6 text-green-400" />
                    <span className="text-gray-300">Available</span>
                    </div>
                    <span className="font-bold text-green-400">{timeData.timeBalance.available_time} min</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-[#2c3e50] rounded-lg hover:bg-[#354b5f] transition-colors">
                    <div className="flex items-center space-x-3">
                    <CreditCard className="h-6 w-6 text-yellow-400" />
                    <span className="text-gray-300">On Hold</span>
                    </div>
                    <span className="font-bold text-yellow-400">{timeData.timeBalance.held_time} min</span>
                </div>

                <button 
                    onClick={() => navigate('/time-plans')}
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-3 flex items-center justify-center space-x-2 transition-colors duration-300"
                >
                    <Wallet className="h-5 w-5" />
                    <span>Purchase Time</span>
                    <ArrowRight className="h-5 w-5" />
                </button>
                </div>
            </div>
            
            {/* Transactions List */}
            <div className="bg-[#1e2a3a] rounded-xl p-6 shadow-lg col-span-2 hover:shadow-2xl transition-all duration-300">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
                <h2 className="text-2xl font-semibold text-gray-200">Transaction History</h2>
                <div className="flex flex-wrap gap-2">
                    <button 
                    className={`px-4 py-2 rounded-lg ${filterType === 'all' ? 'bg-blue-600' : 'bg-[#2c3e50]'} hover:bg-blue-500 transition-colors duration-300`}
                    onClick={() => filterTransactions('all')}
                    >
                    All
                    </button>
                    <button 
                    className={`px-4 py-2 rounded-lg ${filterType === 'credit' ? 'bg-green-600' : 'bg-[#2c3e50]'} hover:bg-green-500 transition-colors duration-300`}
                    onClick={() => filterTransactions('credit')}
                    >
                    Credit
                    </button>
                    <button 
                    className={`px-4 py-2 rounded-lg ${filterType === 'debit' ? 'bg-red-600' : 'bg-[#2c3e50]'} hover:bg-red-500 transition-colors duration-300`}
                    onClick={() => filterTransactions('debit')}
                    >
                    Debit
                    </button>
                    <button 
                    className={`px-4 py-2 rounded-lg ${filterType === 'purchase' ? 'bg-purple-600' : 'bg-[#2c3e50]'} hover:bg-purple-500 transition-colors duration-300`}
                    onClick={() => filterTransactions('purchase')}
                    >
                    Purchases
                    </button>
                </div>
                </div>
                
                <div className="space-y-4 max-h-[400px] overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                {filteredTransactions.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                    <div className="mb-4">
                        <Clock className="h-12 w-12 mx-auto text-gray-500" />
                    </div>
                    <p className="text-lg">No transactions found</p>
                    </div>
                ) : (
                    filteredTransactions.map((transaction) => {
                    const isCredit = transaction.to_user.id === user.id;
                    const isPurchase = isCredit && transaction.from_user.role === 'admin';
                    
                    return (
                        <div 
                        key={transaction.id} 
                        className="flex justify-between items-center bg-[#2c3e50] p-4 rounded-lg hover:bg-[#354b5f] transition-all duration-300 transform hover:scale-[1.02]"
                        >
                        <div className="flex items-center space-x-4">
                            <div className={`p-2 rounded-full ${
                            isPurchase ? 'bg-purple-500/20' : 
                            isCredit ? 'bg-green-500/20' : 
                            'bg-red-500/20'
                            }`}>
                            {isPurchase ? (
                                <Wallet className="h-6 w-6 text-purple-400" />
                            ) : isCredit ? (
                                <ArrowRight className="h-6 w-6 text-green-400" />
                            ) : (
                                <ArrowRight className="h-6 w-6 text-red-400" />
                            )}
                            </div>
                            <div>
                            <p className="font-medium text-white">
                                {isPurchase 
                                ? 'Time Purchase' 
                                : isCredit 
                                    ? `Transfer from ${transaction.from_user.username}` 
                                    : `Transfer to ${transaction.to_user.username}`}
                            </p>
                            <p className="text-sm text-gray-400">
                                {new Date(transaction.created_at).toLocaleString()}
                            </p>
                            </div>
                        </div>
                        <span className={`font-bold ${
                            isPurchase ? 'text-purple-400' :
                            isCredit ? 'text-green-400' : 
                            'text-red-400'
                        }`}>
                            {isCredit ? '+' : '-'}{transaction.amount} min
                        </span>
                        </div>
                    );
                    })
                )}
                </div>
            </div>
            </div>
          )}
        </main>
      </div>
      <button 
        onClick={() => navigate('/purchase-history')}
        className="w-full mt-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg p-3 flex items-center justify-center space-x-2 transition-colors duration-300"
      >
        <CreditCard className="h-5 w-5" />
        <span>View Purchase History</span>
        <ArrowRight className="h-5 w-5" />
      </button>
    </div>
  );
};

export default TimeAccountPage;