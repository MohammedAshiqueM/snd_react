import React from "react";

const Paginator = ({ currentPage, totalPages, onPageChange }) => {
    return (
        <div className="mt-4 flex justify-center items-center">
            <button
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
                className={`py-1 px-3 rounded mr-2 ${
                    currentPage === 1 ? "bg-gray-400" : "bg-blue-600 text-white"
                }`}
            >
                Previous
            </button>
            <span className="text-gray-300">
                Page {currentPage} of {totalPages}
            </span>
            <button
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                className={`py-1 px-3 rounded ml-2 ${
                    currentPage === totalPages ? "bg-gray-400" : "bg-blue-600 text-white"
                }`}
            >
                Next
            </button>
        </div>
    );
};

export default Paginator;
