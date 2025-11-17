import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { api } from '../utils/api';
import { Shield, Users, TrendingUp, Activity } from 'lucide-react';

export function AdminPanel() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const response = await api.getUsers();
    if (response.data) {
      setUsers(response.data);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="h-full flex items-center justify-center">Loading admin panel...</div>;
  }

  return (
    <div className="h-full p-6 overflow-auto">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="size-6" />
        <h2 className="text-2xl">Admin Panel</h2>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Total Users</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{users.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Active Today</CardTitle>
            <Activity className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">-</div>
            <p className="text-xs text-muted-foreground">Feature coming soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Total Trades</CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">-</div>
            <p className="text-xs text-muted-foreground">Feature coming soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">System Status</CardTitle>
            <div className="size-2 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">Online</div>
          </CardContent>
        </Card>
      </div>

      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>View and manage registered users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2">Username</th>
                  <th className="pb-2">Username ID</th>
                  <th className="pb-2">Email</th>
                  <th className="pb-2">Registered</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.userId} className="border-b">
                    <td className="py-3">{user.username}</td>
                    <td>@{user.usernameId}</td>
                    <td>{user.email}</td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Market Configuration */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Market Configuration</CardTitle>
          <CardDescription>Manage available trading pairs and market settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-secondary rounded">
              <h3 className="text-sm mb-2">Active Trading Pairs</h3>
              <div className="flex gap-2">
                {['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT'].map((pair) => (
                  <span key={pair} className="px-3 py-1 bg-primary/20 rounded text-sm">
                    {pair}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 bg-secondary rounded">
              <h3 className="text-sm mb-2">Trading Fee</h3>
              <p className="text-lg">0.1%</p>
            </div>

            <div className="p-4 bg-secondary rounded">
              <h3 className="text-sm mb-2">Demo Account Settings</h3>
              <p className="text-sm text-muted-foreground">
                Initial Balance: 10,000 USDT<br />
                Reset Limit: Once per day
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
