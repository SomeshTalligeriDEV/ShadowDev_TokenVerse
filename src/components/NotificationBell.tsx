import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { ScrollArea } from '@/components/ui/scroll-area';

export const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    }
  };

  // Mark notifications as read
  const markAsRead = async () => {
    if (!user?.id || unreadCount === 0) return;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (!error) {
      setUnreadCount(0);
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    }
  };

  // Subscribe to new notifications
  useEffect(() => {
    if (!user?.id) return;

    fetchNotifications();

    const subscription = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        setNotifications(prev => [payload.new, ...prev]);
        setUnreadCount(prev => prev + 1);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user?.id]);

  return (
    <Popover onOpenChange={(open) => open && markAsRead()}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-gradient-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center neon-glow">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 glass-card neon-glow border-border/50" align="end">
        <div className="p-4 border-b border-border/50">
          <h4 className="font-semibold gradient-text">Notifications</h4>
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length > 0 ? (
            <div className="divide-y divide-border/50">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-4 hover:bg-muted/30 transition-colors"
                >
                  <p className="font-medium text-sm gradient-text">{notification.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No notifications yet
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
