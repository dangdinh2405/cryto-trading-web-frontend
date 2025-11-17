import React from 'react';
import { Button } from './ui/button';
import { LayoutDashboard, Wallet, FileText, Star, User, Settings, Shield } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: any) => void;
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const menuItems = [
    { id: 'trading', label: 'Trading', icon: LayoutDashboard },
    { id: 'portfolio', label: 'Portfolio', icon: Wallet },
    { id: 'orders', label: 'Orders', icon: FileText },
    { id: 'watchlist', label: 'Watchlist', icon: Star },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'admin', label: 'Admin', icon: Shield },
  ];

  return (
    <aside className="w-64 border-r bg-card p-4">
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <Button
              key={item.id}
              variant={isActive ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => onViewChange(item.id)}
            >
              <Icon className="size-4 mr-2" />
              {item.label}
            </Button>
          );
        })}
      </nav>
    </aside>
  );
}
