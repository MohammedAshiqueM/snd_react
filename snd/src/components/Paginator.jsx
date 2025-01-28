import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Paginator = ({ currentPage, totalPages, onPageChange }) => {
    return (
        <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-2 bg-[#0D0E21] p-2 rounded-lg border border-gray-800">
                <button
                    onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg transition-all duration-300 ${
                        currentPage === 1 
                            ? 'text-gray-600 cursor-not-allowed' 
                            : 'text-gray-400 hover:text-white hover:bg-indigo-500/20'
                    }`}
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1;
                    const isCurrentPage = page === currentPage;
                    const isNearCurrent = Math.abs(page - currentPage) <= 1 || page === 1 || page === totalPages;

                    if (!isNearCurrent) {
                        if (page === 2 || page === totalPages - 1) {
                            return <span key={page} className="text-gray-600">...</span>;
                        }
                        return null;
                    }

                    return (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={`min-w-[40px] h-10 rounded-lg transition-all duration-300 font-medium ${
                                isCurrentPage
                                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/20'
                                    : 'text-gray-400 hover:text-white hover:bg-indigo-500/20'
                            }`}
                        >
                            {page}
                        </button>
                    );
                })}

                <button
                    onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg transition-all duration-300 ${
                        currentPage === totalPages 
                            ? 'text-gray-600 cursor-not-allowed' 
                            : 'text-gray-400 hover:text-white hover:bg-indigo-500/20'
                    }`}
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default Paginator;
