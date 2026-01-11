import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck, Phone, Users, Calendar, Info, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'call':
      return Phone;
    case 'lead':
      return Users;
    case 'meeting':
      return Calendar;
    default:
      return Info;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'call':
      return 'text-blue-500 bg-blue-500/10';
    case 'lead':
      return 'text-green-500 bg-green-500/10';
    case 'meeting':
      return 'text-purple-500 bg-purple-500/10';
    case 'success':
      return 'text-emerald-500 bg-emerald-500/10';
    case 'warning':
      return 'text-amber-500 bg-amber-500/10';
    default:
      return 'text-primary bg-primary/10';
  }
};

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClick: () => void;
}

const NotificationItem = ({ notification, onMarkAsRead, onDelete, onClick }: NotificationItemProps) => {
  const Icon = getNotificationIcon(notification.type);
  const colorClass = getNotificationColor(notification.type);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className={`p-3 hover:bg-muted/50 cursor-pointer transition-colors relative group ${
        !notification.is_read ? 'bg-primary/5' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm font-medium truncate ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
              {notification.title}
            </p>
            {!notification.is_read && (
              <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: de })}
          </p>
        </div>
      </div>
      
      {/* Action buttons on hover */}
      <div className="absolute right-2 top-2 hidden group-hover:flex items-center gap-1">
        {!notification.is_read && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead(notification.id);
            }}
          >
            <Check className="w-3 h-3" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-destructive hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.id);
          }}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </motion.div>
  );
};

export const NotificationCenter = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications();

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    
    // Navigate to resource if available
    if (notification.resource_type && notification.resource_id) {
      switch (notification.resource_type) {
        case 'call':
          navigate(`/app/calls/${notification.resource_id}`);
          break;
        case 'lead':
          navigate(`/app/leads/${notification.resource_id}`);
          break;
        case 'campaign':
          navigate(`/app/campaigns`);
          break;
      }
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 sm:w-96 p-0" align="end">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="font-semibold">Benachrichtigungen</h3>
            {unreadCount > 0 && (
              <p className="text-xs text-muted-foreground">
                {unreadCount} ungelesene
              </p>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 text-xs"
                onClick={markAllAsRead}
              >
                <CheckCheck className="w-3 h-3 mr-1" />
                Alle gelesen
              </Button>
            )}
            {notifications.length > 0 && (
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={clearAll}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Notifications List */}
        <ScrollArea className="max-h-[400px]">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              <div className="animate-pulse">Laden...</div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Keine Benachrichtigungen</p>
              <p className="text-xs mt-1">
                Neue Benachrichtigungen erscheinen hier.
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {notifications.map((notification, index) => (
                <div key={notification.id}>
                  <NotificationItem
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onDelete={deleteNotification}
                    onClick={() => handleNotificationClick(notification)}
                  />
                  {index < notifications.length - 1 && <Separator />}
                </div>
              ))}
            </AnimatePresence>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
