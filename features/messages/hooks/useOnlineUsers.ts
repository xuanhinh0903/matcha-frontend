import { useMessageSocket } from '@/api/messages';
import { getAuthToken } from '@/store/global/auth/auth.slice';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

export function useOnlineUsers() {
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());
  const token = useSelector(getAuthToken);
  const { socket, isConnected } = useMessageSocket(token || '');

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Handle user status changes
    const handleUserStatusChanged = (data: {
      user_id: number;
      is_online: boolean;
    }) => {
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        if (data.is_online) {
          newSet.add(data.user_id);
        } else {
          newSet.delete(data.user_id);
        }
        return newSet;
      });
    };

    // Get initial online users
    socket.emit(
      'get_online_users',
      {},
      (response: { onlineUserIds: number[] }) => {
        setOnlineUsers(new Set(response.onlineUserIds));
      }
    );

    socket.on('user_status_changed', handleUserStatusChanged);

    return () => {
      socket.off('user_status_changed', handleUserStatusChanged);
    };
  }, [socket, isConnected]);

  const isUserOnline = (userId: number) => onlineUsers.has(userId);

  return { onlineUsers, isUserOnline };
}
