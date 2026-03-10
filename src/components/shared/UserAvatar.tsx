import React from 'react';
import { User } from '@/interfaces';
import { getUserInitials, getBackgroundColor } from '@/lib/avatarUtils';
import { UserT } from '@/types/user.type';

interface UserAvatarProps {
  user: UserT;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ 
  user, 
  size = 'md',
  className = ''
}) => {
  // Size configuration
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  };



  const initials = getUserInitials(user);
  const backgroundColor = getBackgroundColor(user);

  // Check user type: if not seed, show avatar_url; otherwise show colored initials
  if (user.role !== 'SEED') {
    // For non-seed users, show avatar_url if available
    if (user.avatar_url) {
      return (
        <div 
          className={`
            flex items-center justify-center rounded-full text-white font-medium overflow-hidden
            ${sizeClasses[size]}
            ${className}
          `}
        >
          <img 
            src={user.avatar_url} 
            alt={user.name || 'User'} 
            className="w-full h-full object-cover"
          />
        </div>
      );
    }
    // If no avatar_url, don't show anything
    return null;
  }

  // For seed users, show the colored initials avatar
  return (
    <div 
      className={`
        flex items-center justify-center rounded-full text-white font-medium
        ${sizeClasses[size]}
        ${className}
      `}
      style={{ backgroundColor }}
    >
      {initials}
    </div>
  );
};

export default UserAvatar;