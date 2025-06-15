
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type EventType = 'transaction' | 'transfer_in' | 'transfer_out' | 'login' | 'security';
type NotificationType = 'in_app' | 'email' | 'push';

export const useInitializeNotifications = () => {
  const { user } = useAuth();

  useEffect(() => {
    const initializePreferences = async () => {
      if (!user) return;

      try {
        // Check if user already has preferences
        const { data: existingPrefs, error: checkError } = await supabase
          .from('notification_preferences')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);

        if (checkError) {
          console.error('Error checking preferences:', checkError);
          return;
        }

        // If no preferences exist, create default ones
        if (!existingPrefs || existingPrefs.length === 0) {
          console.log('Creating default notification preferences for user:', user.id);
          
          const defaultPreferences = [
            // Transaction notifications
            { user_id: user.id, event_type: 'transaction' as EventType, notification_type: 'in_app' as NotificationType, enabled: true },
            { user_id: user.id, event_type: 'transaction' as EventType, notification_type: 'email' as NotificationType, enabled: true },
            { user_id: user.id, event_type: 'transaction' as EventType, notification_type: 'push' as NotificationType, enabled: false },
            
            // Transfer in notifications
            { user_id: user.id, event_type: 'transfer_in' as EventType, notification_type: 'in_app' as NotificationType, enabled: true },
            { user_id: user.id, event_type: 'transfer_in' as EventType, notification_type: 'email' as NotificationType, enabled: true },
            { user_id: user.id, event_type: 'transfer_in' as EventType, notification_type: 'push' as NotificationType, enabled: false },
            
            // Transfer out notifications
            { user_id: user.id, event_type: 'transfer_out' as EventType, notification_type: 'in_app' as NotificationType, enabled: true },
            { user_id: user.id, event_type: 'transfer_out' as EventType, notification_type: 'email' as NotificationType, enabled: true },
            { user_id: user.id, event_type: 'transfer_out' as EventType, notification_type: 'push' as NotificationType, enabled: false },
            
            // Login notifications
            { user_id: user.id, event_type: 'login' as EventType, notification_type: 'in_app' as NotificationType, enabled: false },
            { user_id: user.id, event_type: 'login' as EventType, notification_type: 'email' as NotificationType, enabled: false },
            { user_id: user.id, event_type: 'login' as EventType, notification_type: 'push' as NotificationType, enabled: false },
            
            // Security notifications
            { user_id: user.id, event_type: 'security' as EventType, notification_type: 'in_app' as NotificationType, enabled: true },
            { user_id: user.id, event_type: 'security' as EventType, notification_type: 'email' as NotificationType, enabled: true },
            { user_id: user.id, event_type: 'security' as EventType, notification_type: 'push' as NotificationType, enabled: false },
          ];

          const { error: insertError } = await supabase
            .from('notification_preferences')
            .insert(defaultPreferences);

          if (insertError) {
            console.error('Error creating default preferences:', insertError);
          } else {
            console.log('Default notification preferences created successfully');
          }
        }
      } catch (error) {
        console.error('Error initializing notification preferences:', error);
      }
    };

    initializePreferences();
  }, [user]);
};
