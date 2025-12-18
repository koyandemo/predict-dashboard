import React from 'react';
import UserAvatar from '@/components/shared/UserAvatar';
import { User } from '@/interfaces';

const UserAvatarDemo = () => {
  // Sample seed users for demonstration
  const sampleUsers: User[] = [
    {
      user_id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      provider: 'google',
      type: 'seed',
      avatar_bg_color: '#3b82f6'
    },
    {
      user_id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      provider: 'email',
      type: 'seed',
      avatar_bg_color: '#ef4444'
    },
    {
      user_id: 3,
      name: 'Bob Johnson',
      email: 'bob@example.com',
      provider: 'google',
      type: 'seed',
    },
    {
      user_id: 4,
      name: 'Alice Williams',
      email: 'alice@example.com',
      provider: 'facebook',
      type: 'seed',
    }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">User Avatar Demo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {sampleUsers.map((user) => (
          <div key={user.user_id} className="border rounded-lg p-4 flex flex-col items-center">
            <UserAvatar user={user} size="lg" className="mb-3" seedUsersOnly />
            <h3 className="font-medium">{user.name}</h3>
            <p className="text-sm text-gray-500">{user.email}</p>
            <p className="text-xs text-gray-400 mt-1">ID: {user.user_id}</p>
            <p className="text-xs text-gray-400">Type: {user.type}</p>
          </div>
        ))}
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Different Sizes</h2>
        <div className="flex items-end gap-4">
          <div className="flex flex-col items-center">
            <UserAvatar user={sampleUsers[0]} size="sm" />
            <span className="text-xs mt-1">Small</span>
          </div>
          <div className="flex flex-col items-center">
            <UserAvatar user={sampleUsers[0]} size="md" />
            <span className="text-xs mt-1">Medium</span>
          </div>
          <div className="flex flex-col items-center">
            <UserAvatar user={sampleUsers[0]} size="lg" />
            <span className="text-xs mt-1">Large</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAvatarDemo;