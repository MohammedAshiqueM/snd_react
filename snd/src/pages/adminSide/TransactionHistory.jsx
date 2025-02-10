import { useEffect, useState } from "react";
import SidebarAdmin from "../../components/SidebarAdmin";
import NavbarAdmin from "../../components/NavbarAdmin";
import { Clock, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { getTransactionHistory } from "../../adminApi";

export default function TransactionHistory() {
  const [transactionData, setTransactionData] = useState({
    count: 0,
    next: null,
    previous: null,
    results: {
      transactions: [],
      time_balance: {
        total_time: 0,
        total_amount: 0,
        held_time: 0
      }
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const savedState = localStorage.getItem("isSidebarCollapsed");
    return savedState ? JSON.parse(savedState) : false;
  });

  const fetchTransactions = async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getTransactionHistory(page, pageSize);
      setTransactionData(response);
      setCurrentPage(page);
    } catch (err) {
      setError("Failed to fetch transaction history. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed((prevState) => {
      const newState = !prevState;
      localStorage.setItem("isSidebarCollapsed", JSON.stringify(newState));
      return newState;
    });
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const { transactions, time_balance } = transactionData.results;
  const { count, next, previous } = transactionData;

  return (
    <div className="min-h-screen bg-slate-700 text-gray-100 flex flex-col">
      <NavbarAdmin />
      <div className="flex flex-1">
        <SidebarAdmin
          isCollapsed={isSidebarCollapsed}
          onToggle={handleSidebarToggle}
        />
        <main
          className={`flex-1 p-6 transition-all duration-300 ${
            isSidebarCollapsed ? "ml-20" : "ml-64"
          } pt-32`}
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">Transaction History</h1>
                <p className="text-sm text-gray-400">
                  {count} transactions total
                </p>
              </div>
            </div>

            {/* Time Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-slate-800 rounded-lg p-6">
                <h3 className="text-gray-400 text-sm mb-2">Total Time</h3>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-indigo-400 mr-2" />
                  <span className="text-xl font-semibold">{formatTime(time_balance.total_time)}</span>
                </div>
              </div>
              <div className="bg-slate-800 rounded-lg p-6">
                <h3 className="text-gray-400 text-sm mb-2">Credited</h3>
                <div className="flex items-center">
                  {/* <Clock className="w-5 h-5 text-green-400 mr-2" /> */}
                  <span className="w-5 h-5 text-green-400 font-bold" >₹</span>

                  <span className="text-xl font-semibold">{time_balance.total_amount}</span>
                </div>
              </div>
              {/* <div className="bg-slate-800 rounded-lg p-6">
                <h3 className="text-gray-400 text-sm mb-2">Held Time</h3>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-yellow-400 mr-2" />
                  <span className="text-xl font-semibold">{formatTime(time_balance.held_time)}</span>
                </div>
              </div> */}
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              </div>
            ) : error ? (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-center">
                {error}
              </div>
            ) : transactions.length ? (
              <>
                <div className="bg-slate-800 rounded-lg overflow-hidden mb-4">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left p-4 text-gray-400 font-medium">Date</th>
                          <th className="text-left p-4 text-gray-400 font-medium">Plan</th>
                          <th className="text-left p-4 text-gray-400 font-medium">Amount</th>
                          <th className="text-left p-4 text-gray-400 font-medium">Order ID</th>
                          <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((transaction) => (
                          <tr 
                            key={transaction.id} 
                            className="border-b border-gray-700/50 hover:bg-slate-700/30 transition-colors"
                          >
                            <td className="p-4 text-sm">
                              {formatDate(transaction.created_at)}
                            </td>
                            <td className="p-4 text-sm">
                              {transaction.plan.name}
                            </td>
                            <td className="p-4 text-sm">
                              ₹{transaction.amount}
                            </td>
                            <td className="p-4 text-sm">
                              {transaction.order_id}
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                transaction.status === 'SU' 
                                  ? 'bg-green-400/10 text-green-400' 
                                  : transaction.status === 'PE'
                                  ? 'bg-yellow-400/10 text-yellow-400'
                                  : 'bg-red-400/10 text-red-400'
                              }`}>
                                {transaction.status_display}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pagination Controls */}
                <div className="flex justify-between items-center">
                  <button 
                    onClick={() => fetchTransactions(currentPage - 1)}
                    disabled={!previous}
                    className={`flex items-center gap-2 ${
                      previous 
                        ? 'bg-slate-800 hover:bg-slate-700' 
                        : 'bg-slate-900 cursor-not-allowed opacity-50'
                    } px-4 py-2 rounded-lg transition-colors`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <span className="text-sm text-gray-400">
                    Page {currentPage}
                  </span>
                  <button 
                    onClick={() => fetchTransactions(currentPage + 1)}
                    disabled={!next}
                    className={`flex items-center gap-2 ${
                      next 
                        ? 'bg-slate-800 hover:bg-slate-700' 
                        : 'bg-slate-900 cursor-not-allowed opacity-50'
                    } px-4 py-2 rounded-lg transition-colors`}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-400">
                No transactions found.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}