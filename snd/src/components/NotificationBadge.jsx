import React from 'react';

const NotificationBadge = ({ count }) => {
  if (!count || count <= 0) return null;

  return (
    <div className="absolute -top-1 -right-1 bg-blue-600 text-white 
                    rounded-full min-w-[20px] h-[20px] flex items-center 
                    justify-center text-xs font-medium px-1.5 
                    border-2 border-[#0F0A2A]">
      {count > 99 ? '99+' : count}
    </div>
  );
};

export default NotificationBadge;