import { useEffect, useState } from "react";
import SidebarAdmin from "../../components/SidebarAdmin";
import NavbarAdmin from "../../components/NavbarAdmin";
import { Edit2, Clock, DollarSign, Plus, Loader2 } from 'lucide-react';
import AddTimePlanModal from "../../components/AddTimePlanModal";
import { paymentPlans } from "../../adminApi";

export default function TimePlansAdmin() {
  const [plans, setPlans] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const savedState = localStorage.getItem("isSidebarCollapsed");
    return savedState ? JSON.parse(savedState) : false;
  });

  const fetchPlans = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await paymentPlans();
      setPlans(response.results);
    } catch (err) {
      setError("Failed to fetch time plans. Please try again.");
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

  const handleEditClick = (plan) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  useEffect(() => {
    fetchPlans();
  }, []);

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
                <h1 className="text-2xl font-bold text-white mb-2">Time Plans</h1>
                <p className="text-sm text-gray-400">
                  {plans.length} plan{plans.length !== 1 ? 's' : ''} available
                </p>
              </div>
              <button 
                className="flex items-center gap-2 bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-indigo-500/20"
                onClick={() => {
                  setEditingPlan(null);
                  setIsModalOpen(true);
                }}
              >
                <Plus className="w-4 h-4" />
                Add Plan
              </button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              </div>
            ) : error ? (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-center">
                {error}
              </div>
            ) : plans.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className="relative bg-slate-800 rounded-lg overflow-hidden group transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 hover:translate-y-[-2px]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <button
                      className="absolute right-3 top-3 p-2 bg-slate-700 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-slate-600"
                      onClick={() => handleEditClick(plan)}
                    >
                      <Edit2 className="w-4 h-4 text-white" />
                    </button>
                    
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-4 text-white">{plan.name}</h3>
                      <div className="space-y-4">
                        <div className="flex items-center text-gray-300">
                          <Clock className="w-4 h-4 mr-2 text-indigo-400" />
                          <span>{plan.minutes} minutes</span>
                        </div>
                        <div className="flex items-center text-gray-300">
                            <span className="w-4 h-6 mr-2 text-indigo-400" >₹</span>
                          {/* <DollarSign /> */}
                          <span>{plan.price}</span>
                        </div>
                        <p className="text-sm text-gray-400 mt-4">
                          {plan.description || "No description available."}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                No time plans found. Create your first plan to get started.
              </div>
            )}
          </div>
        </main>
      </div>
      <AddTimePlanModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPlan(null);
        }}
        plan={editingPlan}
        onSuccess={fetchPlans}
      />
    </div>
  );
}