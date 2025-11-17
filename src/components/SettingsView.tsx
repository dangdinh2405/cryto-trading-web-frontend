import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useAuth } from './AuthContext';
import { api } from '../utils/api';
import { toast } from 'sonner@2.0.3';
import { Settings as SettingsIcon, Globe, DollarSign, Palette } from 'lucide-react';

export function SettingsView() {
  const { user, refreshUser } = useAuth();
  const [timezone, setTimezone] = useState('UTC');
  const [currency, setCurrency] = useState('USDT');
  const [theme, setTheme] = useState('dark');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.settings) {
      setTimezone(user.settings.timezone || 'UTC');
      setCurrency(user.settings.currency || 'USDT');
      setTheme(user.settings.theme || 'dark');
    }
  }, [user]);

  const handleSaveSettings = async () => {
    setIsLoading(true);

    const response = await api.updateSettings({
      timezone,
      currency,
      theme,
    });

    if (response.error) {
      toast.error(response.error);
    } else {
      toast.success('Settings saved successfully');
      refreshUser();
      
      // Apply theme
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

    setIsLoading(false);
  };

  const timezones = [
    'UTC',
    'America/New_York',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Dubai',
    'Australia/Sydney',
  ];

  const currencies = ['USDT', 'USD', 'EUR', 'GBP', 'JPY', 'VND'];

  return (
    <div className="h-full p-6 overflow-auto">
      <h2 className="text-2xl mb-6">Settings</h2>

      <div className="max-w-2xl space-y-6">
        {/* Display Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="size-5" />
              Display Settings
            </CardTitle>
            <CardDescription>Customize the appearance of your trading interface</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger id="theme">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Choose your preferred color scheme
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Regional Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="size-5" />
              Regional Settings
            </CardTitle>
            <CardDescription>Configure timezone and regional preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                All timestamps will be displayed in this timezone
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Currency Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="size-5" />
              Currency Settings
            </CardTitle>
            <CardDescription>Choose your preferred display currency</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Display Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((curr) => (
                    <SelectItem key={curr} value={curr}>
                      {curr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Portfolio value and prices will be shown in this currency
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Manage your account security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                2FA is currently disabled. Enable it to add an extra layer of security to your account.
              </p>
              <Button variant="outline" disabled>
                Enable 2FA (Coming Soon)
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Change Password</Label>
              <p className="text-sm text-muted-foreground">
                Update your password to keep your account secure.
              </p>
              <Button variant="outline" disabled>
                Change Password (Coming Soon)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <Button onClick={handleSaveSettings} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
}
