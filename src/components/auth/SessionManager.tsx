
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSecurity } from '@/hooks/useSecurity';
import { Monitor, Smartphone, Tablet, Shield, Clock, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SessionManager = () => {
  const { sessions, loading, fetchUserSessions, terminateSession, terminateAllSessions } = useSecurity();
  const { toast } = useToast();

  useEffect(() => {
    fetchUserSessions();
  }, []);

  const getDeviceIcon = (userAgent: string) => {
    if (userAgent.includes('Mobile')) return <Smartphone className="h-4 w-4" />;
    if (userAgent.includes('Tablet')) return <Tablet className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  const getDeviceInfo = (userAgent: string) => {
    if (userAgent.includes('Chrome')) return 'Chrome Browser';
    if (userAgent.includes('Firefox')) return 'Firefox Browser';
    if (userAgent.includes('Safari')) return 'Safari Browser';
    return 'Unknown Browser';
  };

  const handleTerminateSession = async (sessionId: string) => {
    try {
      await terminateSession(sessionId);
      toast({
        title: "Session Terminated",
        description: "The session has been successfully terminated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to terminate session.",
        variant: "destructive",
      });
    }
  };

  const handleTerminateAllSessions = async () => {
    try {
      await terminateAllSessions();
      toast({
        title: "All Sessions Terminated",
        description: "All other sessions have been terminated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to terminate sessions.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading sessions...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Active Sessions
        </CardTitle>
        <CardDescription>
          Manage your active login sessions across different devices
        </CardDescription>
        {sessions.length > 1 && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleTerminateAllSessions}
            className="w-fit"
          >
            Terminate All Other Sessions
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {sessions.length > 0 ? (
          <div className="space-y-4">
            {sessions.map((session, index) => (
              <div key={session.id} className="flex justify-between items-start p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getDeviceIcon(session.user_agent)}
                    <span className="font-medium">{getDeviceInfo(session.user_agent)}</span>
                    {index === 0 && (
                      <Badge variant="default" className="text-xs">Current</Badge>
                    )}
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>IP: {session.ip_address || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        Last active: {new Date(session.last_activity).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Started: {new Date(session.created_at).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
                {index !== 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleTerminateSession(session.id)}
                  >
                    Terminate
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No active sessions found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SessionManager;
