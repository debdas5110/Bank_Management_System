
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell, Mail, Smartphone, Shield, ArrowRightLeft, DollarSign, LogIn } from 'lucide-react';

type NotificationEventType = 'transaction' | 'transfer_in' | 'transfer_out' | 'login' | 'security';
type NotificationType = 'push' | 'email' | 'in_app';

const NotificationSettings = () => {
  const { preferences, updatePreference, loading } = useNotifications();

  const eventTypes = [
    {
      key: 'transaction' as NotificationEventType,
      label: 'Transactions',
      description: 'Deposits and withdrawals',
      icon: DollarSign,
      color: 'bg-green-100 text-green-800'
    },
    {
      key: 'transfer_in' as NotificationEventType,
      label: 'Incoming Transfers',
      description: 'Money received from others',
      icon: ArrowRightLeft,
      color: 'bg-blue-100 text-blue-800'
    },
    {
      key: 'transfer_out' as NotificationEventType,
      label: 'Outgoing Transfers',
      description: 'Money sent to others',
      icon: ArrowRightLeft,
      color: 'bg-purple-100 text-purple-800'
    },
    {
      key: 'login' as NotificationEventType,
      label: 'Login Activity',
      description: 'Account login notifications',
      icon: LogIn,
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      key: 'security' as NotificationEventType,
      label: 'Security Alerts',
      description: 'Security-related notifications',
      icon: Shield,
      color: 'bg-red-100 text-red-800'
    }
  ];

  const notificationTypes = [
    {
      key: 'in_app' as NotificationType,
      label: 'In-App',
      description: 'Show notifications within the app',
      icon: Bell
    },
    {
      key: 'email' as NotificationType,
      label: 'Email',
      description: 'Send notifications to your email',
      icon: Mail
    },
    {
      key: 'push' as NotificationType,
      label: 'Push',
      description: 'Send push notifications to your device',
      icon: Smartphone
    }
  ];

  const getPreference = (eventType: NotificationEventType, notificationType: NotificationType) => {
    return preferences.find(p => p.event_type === eventType && p.notification_type === notificationType);
  };

  if (loading) {
    return <div>Loading notification settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Notification Settings</h2>
        <p className="text-gray-600">Customize how and when you receive notifications</p>
      </div>

      <div className="grid gap-6">
        {eventTypes.map((eventType) => {
          const IconComponent = eventType.icon;
          
          return (
            <Card key={eventType.key}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-100">
                    <IconComponent className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {eventType.label}
                      <Badge className={eventType.color}>
                        {eventType.key.replace('_', ' ')}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{eventType.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {notificationTypes.map((notifType) => {
                    const preference = getPreference(eventType.key, notifType.key);
                    const NotifIcon = notifType.icon;
                    const isEnabled = preference?.enabled || false;
                    
                    return (
                      <div key={notifType.key} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <NotifIcon className="h-4 w-4 text-gray-500" />
                          <div>
                            <Label htmlFor={`${eventType.key}-${notifType.key}`} className="font-medium">
                              {notifType.label}
                            </Label>
                            <p className="text-sm text-gray-500">{notifType.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className={`w-2 h-2 rounded-full ${isEnabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                              <p className={`text-xs font-medium ${isEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                                {isEnabled ? 'ON' : 'OFF'}
                              </p>
                            </div>
                          </div>
                        </div>
                        <Switch
                          id={`${eventType.key}-${notifType.key}`}
                          checked={isEnabled}
                          onCheckedChange={(enabled) => 
                            updatePreference(eventType.key, notifType.key, enabled)
                          }
                          style={{
                            backgroundColor: isEnabled ? '#16a34a' : '#d1d5db'
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Important Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>• In-app notifications appear as toast messages while you're using the application</p>
          <p>• Email notifications are sent to your registered email address</p>
          <p>• Push notifications require browser permission and work when the app is not open</p>
          <p>• Security alerts are recommended to be enabled for account safety</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSettings;
