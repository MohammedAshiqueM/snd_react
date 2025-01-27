import React, { useEffect, useState } from 'react';
import { 
  Clock, 
  Timer, 
  CreditCard, 
  RefreshCw
} from 'lucide-react';
import SecondNavbar from "../../components/SecondNavbar";
import SideBar from "../../components/SideBar";
import { timeTransaction } from '../../api';
import { useAuthStore } from '../../store/useAuthStore';

const TimeAccountPage = () => {
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
          t.to_user.id === user.id
        )
      );
    } else if (type === 'debit') {
      setFilteredTransactions(
        timeData.transactions.filter(t => 
          t.from_user.id === user.id
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

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0B1A] to-[#1a2735] text-white flex flex-col">
      <SecondNavbar />
      
      <div className={`flex-1 pt-12 transition-all duration-300`}>
        <SideBar
          isCollapsed={isSidebarCollapsed}
          onToggle={handleSidebarToggle}
        />
        
        <main className={`mx-auto flex-1 p-6 pt-12 transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Time Balance Card */}
            <div className="bg-[#1e2a3a] rounded-xl p-6 shadow-lg col-span-1">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-200">Time Balance</h2>
                <RefreshCw className="text-gray-400 hover:text-white cursor-pointer" />
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-6 w-6 text-blue-400" />
                    <span className="text-gray-300">Total Time</span>
                  </div>
                  <span className="font-bold text-white">{timeData.timeBalance.total_time} min</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <Timer className="h-6 w-6 text-green-400" />
                    <span className="text-gray-300">Available</span>
                  </div>
                  <span className="font-bold text-green-400">{timeData.timeBalance.available_time} min</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-6 w-6 text-yellow-400" />
                    <span className="text-gray-300">On Hold</span>
                  </div>
                  <span className="font-bold text-yellow-400">{timeData.timeBalance.held_time} min</span>
                </div>
              </div>
            </div>
            
            {/* Transactions List */}
            <div className="bg-[#1e2a3a] rounded-xl p-6 shadow-lg col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-200">Transaction History</h2>
                <div className="flex space-x-2">
                  <button 
                    className={`px-3 py-1 rounded ${filterType === 'all' ? 'bg-blue-600' : 'bg-gray-700'} hover:bg-blue-500`}
                    onClick={() => filterTransactions('all')}
                  >
                    All
                  </button>
                  <button 
                    className={`px-3 py-1 rounded ${filterType === 'credit' ? 'bg-green-600' : 'bg-gray-700'} hover:bg-green-500`}
                    onClick={() => filterTransactions('credit')}
                  >
                    Credit
                  </button>
                  <button 
                    className={`px-3 py-1 rounded ${filterType === 'debit' ? 'bg-red-600' : 'bg-gray-700'} hover:bg-red-500`}
                    onClick={() => filterTransactions('debit')}
                  >
                    Debit
                  </button>
                </div>
              </div>
              
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {filteredTransactions.length === 0 ? (
                  <div className="text-center text-gray-400 py-4">
                    No transactions found
                  </div>
                ) : (
                  filteredTransactions.map((transaction) => {
                    const isCredit = transaction.to_user.id === user.id;
                    return (
                      <div 
                        key={transaction.id} 
                        className="flex justify-between items-center bg-[#2c3e50] p-4 rounded-lg hover:bg-[#354b5f] transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-medium text-white">
                              {isCredit 
                                ? `Transfer from ${transaction.from_user.username}` 
                                : `Transfer to ${transaction.to_user.username}`}
                            </p>
                            <p className="text-sm text-gray-400">
                              {new Date(transaction.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <span className={`font-bold ${
                          isCredit 
                            ? 'text-green-400' 
                            : 'text-red-400'
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
        </main>
      </div>
    </div>
  );
};

export default TimeAccountPage;