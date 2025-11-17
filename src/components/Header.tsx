import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { LogOut, User, Settings, Activity } from 'lucide-react';
import { api } from '../utils/api';

export function Header() {
  const { user, logout } = useAuth();
  const [balance, setBalance] = useState<any>(null);

  useEffect(() => {
    loadBalance();
    // Refresh balance every 10 seconds
    const interval = setInterval(loadBalance, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadBalance = async () => {
    const response = await api.getBalance();
    if (response.data) {
      setBalance(response.data);
    }
  };

  const getInitials = () => {
    if (!user?.username) return 'U';
    const names = user.username.split(' ');
    return names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header className="border-b bg-card px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-2xl">CryptoTrade</h1>
          
          {balance && (
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Available:</span>
                <span>{balance.USDT?.available.toFixed(2)} USDT</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>In Orders:</span>
                <span>{balance.USDT?.inOrders.toFixed(2)} USDT</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm">{user?.username}</p>
            <p className="text-xs text-muted-foreground">@{user?.usernameId}</p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative size-10 rounded-full">
                <Avatar>
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="size-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="size-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Activity className="size-4 mr-2" />
                Login Activity
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="size-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
