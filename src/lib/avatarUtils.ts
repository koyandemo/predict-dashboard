// Utility functions for avatar generation

/**
 * Generate initials from user's name or email
 * @param user - User object with name and email properties
 * @returns User initials as uppercase string
 */
export function getUserInitials(user: { name?: string; email?: string }): string {
  if (user.name) {
    const names = user.name.split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }
  
  if (user.email) {
    return user.email.charAt(0).toUpperCase();
  }
  
  return 'U'; // Default fallback
}

/**
 * Generate a consistent background color based on user ID or email
 * @param user - User object with avatar_bg_color, user_id, and email properties
 * @returns Hex color string
 */
export function getBackgroundColor(user: { 
  avatar_bg_color?: string; 
  user_id?: number; 
  email?: string 
}): string {
  // Return stored color if available
  if (user.avatar_bg_color) {
    return user.avatar_bg_color;
  }
  
  // Fallback color generation based on user ID or email
  if (user.user_id) {
    const colors = [
      '#3b82f6', // blue-500
      '#ef4444', // red-500
      '#10b981', // emerald-500
      '#f59e0b', // amber-500
      '#8b5cf6', // violet-500
      '#ec4899', // pink-500
      '#06b6d4', // cyan-500
      '#f97316', // orange-500
      '#84cc16', // lime-500
      '#6366f1'  // indigo-500
    ];
    
    // Use user ID to select a consistent color
    return colors[user.user_id % colors.length];
  }
  
  // If no user ID, generate based on email
  if (user.email) {
    let hash = 0;
    for (let i = 0; i < user.email.length; i++) {
      hash = user.email.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const colors = [
      '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
      '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'
    ];
    
    return colors[Math.abs(hash) % colors.length];
  }
  
  // Default color
  return '#3b82f6';
}