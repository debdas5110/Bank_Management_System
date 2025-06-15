
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

type NotificationEventType = 'transaction' | 'transfer_in' | 'transfer_out' | 'login' | 'security';
type NotificationType = 'push' | 'email' | 'in_app';

interface NotificationPreference {
  id: string;
  event_type: NotificationEventType;
  notification_type: NotificationType;
  enabled: boolean;
}

interface NotificationLog {
  id: string;
  event_type: NotificationEventType;
  notification_type: NotificationType;
  title: string;
  message: string;
  sent_at: string;
  read_at: string | null;
  metadata: any;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      console.log('Fetched preferences:', data);
      setPreferences(data || []);
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
    }
  };

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notification_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('sent_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
      
      // Count unread notifications
      const unread = data?.filter(n => !n.read_at).length || 0;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (eventType: NotificationEventType, notificationType: NotificationType, enabled: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notification_preferences')
        .update({ enabled, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('event_type', eventType)
        .eq('notification_type', notificationType);

      if (error) throw error;
      
      // Update local state immediately for better UX
      setPreferences(prev => 
        prev.map(p => 
          p.event_type === eventType && p.notification_type === notificationType
            ? { ...p, enabled }
            : p
        )
      );

      toast({
        title: "Preferences Updated",
        description: `${eventType.replace('_', ' ')} ${notificationType} notifications ${enabled ? 'enabled' : 'disabled'}.`,
      });
    } catch (error) {
      console.error('Error updating preference:', error);
      toast({
        title: "Error",
        description: "Failed to update notification preferences.",
        variant: "destructive",
      });
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notification_logs')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;

      // Update local state
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId
            ? { ...n, read_at: new Date().toISOString() }
            : n
        )
      );

      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notification_logs')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .is('read_at', null);

      if (error) throw error;

      // Update local state
      setNotifications(prev =>
        prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const sendNotification = async (
    eventType: NotificationEventType,
    title: string,
    message: string,
    metadata: any = {}
  ) => {
    if (!user) {
      console.log('No user found for notification');
      return;
    }

    console.log('Sending notification:', { eventType, title, message, preferences });

    try {
      // Check user preferences for this event type
      const userPrefs = preferences.filter(p => p.event_type === eventType && p.enabled);
      console.log('Enabled preferences for event:', userPrefs);
      
      if (userPrefs.length === 0) {
        console.log('No enabled preferences found for event type:', eventType);
        return;
      }

      for (const pref of userPrefs) {
        console.log('Processing preference:', pref);
        
        const { data, error } = await supabase.rpc('log_notification', {
          p_user_id: user.id,
          p_event_type: eventType,
          p_notification_type: pref.notification_type,
          p_title: title,
          p_message: message,
          p_metadata: metadata
        });

        if (error) {
          console.error('Error logging notification:', error);
          continue;
        }

        console.log('Notification logged:', data);

        // Show in-app notification immediately
        if (pref.notification_type === 'in_app') {
          console.log('Showing in-app toast:', title, message);
          toast({
            title,
            description: message,
          });
        }
      }

      // Refresh notifications to show in notification center
      await fetchNotifications();
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPreferences();
      fetchNotifications();
    }
  }, [user]);

  // Set up real-time subscription for new notifications - only once
  useEffect(() => {
    if (!user) return;

    let channel: any = null;

    const setupSubscription = async () => {
      channel = supabase
        .channel(`notification-changes-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notification_logs',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Real-time notification received:', payload);
            const newNotification = payload.new as NotificationLog;
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);

            // Show toast for in-app notifications
            if (newNotification.notification_type === 'in_app') {
              toast({
                title: newNotification.title,
                description: newNotification.message,
              });
            }
          }
        )
        .subscribe();

      console.log('Real-time subscription set up for user:', user.id);
    };

    setupSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [user?.id]); // Only depend on user.id to avoid recreating subscription

  return {
    preferences,
    notifications,
    unreadCount,
    loading,
    updatePreference,
    markAsRead,
    markAllAsRead,
    sendNotification,
    refreshNotifications: fetchNotifications,
  };
};
