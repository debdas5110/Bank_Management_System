
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

interface NotificationBellProps {
  onClick: () => void;
}

const NotificationBell = ({ onClick }: NotificationBellProps) => {
  const { unreadCount } = useNotifications();

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={onClick} 
      className="relative text-inherit hover:bg-royal-blue/20 hover:text-gold-accent transition-all duration-300"
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-sunset-orange text-pure-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium shadow-lg animate-pulse">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Button>
  );
};

export default NotificationBell;
