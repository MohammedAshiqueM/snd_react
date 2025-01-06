const NotificationToast = ({ notification, onClose }) => {
    return (
      <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg 
                      shadow-lg flex items-center space-x-4 animate-slide-up">
        <div>
          <h4 className="font-semibold">{notification.sender}</h4>
          <p className="text-sm text-gray-300">{notification.message}</p>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          ×
        </button>
      </div>
    );
  };

  export default NotificationToast;