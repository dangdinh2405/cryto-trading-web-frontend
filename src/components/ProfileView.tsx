import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useAuth } from './AuthContext';
import { api } from '../utils/api';
import { toast } from 'sonner@2.0.3';
import { User, Mail, Phone, Calendar, RefreshCw, Activity } from 'lucide-react';

export function ProfileView() {
  const { user, refreshUser } = useAuth();
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('');
  const [loginActivity, setLoginActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [canReset, setCanReset] = useState(true);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setAvatar(user.avatar || '');
    }
    loadLoginActivity();
  }, [user]);

  const loadLoginActivity = async () => {
    const response = await api.getLoginActivity();
    if (response.data) {
      setLoginActivity(response.data);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const response = await api.updateProfile({ username, avatar });

    if (response.error) {
      toast.error(response.error);
    } else {
      toast.success('Profile updated successfully');
      refreshUser();
    }

    setIsLoading(false);
  };

  const handleResetBalance = async () => {
    setIsLoading(true);

    const response = await api.resetBalance();

    if (response.error) {
      toast.error(response.error);
      if (response.error.includes('once per day')) {
        setCanReset(false);
      }
    } else {
      toast.success('Balance reset successfully to 10,000 USDT');
    }

    setIsLoading(false);
  };

  const getInitials = () => {
    if (!username) return 'U';
    const names = username.split(' ');
    return names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="h-full p-6 overflow-auto">
      <h2 className="text-2xl mb-6">Profile</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-6 mb-6">
                <Avatar className="size-24">
                  <AvatarImage src={avatar} />
                  <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-muted-foreground">Username ID</p>
                  <p className="text-xl">@{user?.usernameId}</p>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Display Name</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Your name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avatar">Avatar URL</Label>
                  <Input
                    id="avatar"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Updating...' : 'Update Profile'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Account Details */}
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="size-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p>{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="size-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p>{user?.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="size-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Birthday</p>
                  <p>{user?.birthday}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="size-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p>{formatDate(user?.createdAt || '')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Demo Account Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Demo Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-secondary rounded">
                <p className="text-sm text-muted-foreground mb-2">Virtual Balance</p>
                <p className="text-xs text-muted-foreground">
                  Reset your demo account balance to 10,000 USDT. Can be done once per day.
                </p>
              </div>

              <Button
                onClick={handleResetBalance}
                disabled={isLoading || !canReset}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="size-4 mr-2" />
                Reset Balance
              </Button>
            </CardContent>
          </Card>

          {/* Login Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="size-5" />
                Recent Login Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {loginActivity.length > 0 ? (
                  loginActivity.slice(0, 5).map((activity, index) => (
                    <div key={index} className="border-b pb-3 last:border-0">
                      <p className="text-sm">{formatDate(activity.timestamp)}</p>
                      <p className="text-xs text-muted-foreground">
                        IP: {activity.ip.substring(0, 20)}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {activity.device.substring(0, 50)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
