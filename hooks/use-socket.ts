import { useEffect, useState, useCallback, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import { getCookie } from 'cookies-next';

interface UseSocketOptions {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onMessage?: (message: any) => void;
  onUserStatusUpdate?: (data: { userId: string; status: string }) => void;
  onError?: (error: string) => void;
}

export const useSocket = (options?: UseSocketOptions) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use refs to store callbacks and avoid socket recreation
  const callbackRefs = useRef(options);
  callbackRefs.current = options;

  useEffect(() => {
    const token = getCookie('auth_token');
    if (!token) {
      setError("Authentication token not found.");
      return;
    }

    // Connect to the custom server's Socket.IO endpoint
    const newSocket = io(`http://${window.location.hostname}:3000`, {
      path: '/api/socket.io',
      auth: {
        token,
      },
      transports: ['websocket'], // Prefer WebSocket
    });

    newSocket.on('connect', () => {
      console.log('Socket connected!');
      setIsConnected(true);
      setError(null);
      callbackRefs.current?.onConnect?.();
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected.');
      setIsConnected(false);
      callbackRefs.current?.onDisconnect?.();
    });

    newSocket.on('message', (message: any) => {
      console.log('Received message:', message);
      callbackRefs.current?.onMessage?.(message);
    });

    newSocket.on('userStatusUpdate', (data: { userId: string; status: string }) => {
      console.log('Received user status update:', data);
      callbackRefs.current?.onUserStatusUpdate?.(data);
    });

    newSocket.on('errorMessage', (errorMessage: string) => {
      console.error('Socket error:', errorMessage);
      setError(errorMessage);
      callbackRefs.current?.onError?.(errorMessage);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      newSocket.off();
    };
  }, []); // Remove callback dependencies to prevent socket recreation

  const joinChannel = useCallback((serverId: string, channelId: string) => {
    if (socket && isConnected) {
      socket.emit('joinChannel', { serverId, channelId });
    }
  }, [socket, isConnected]);

  const sendMessage = useCallback((serverId: string, channelId: string, content: string) => {
    if (socket && isConnected) {
      socket.emit('sendMessage', { serverId, channelId, content });
    }
  }, [socket, isConnected]);

  return {
    socket,
    isConnected,
    error,
    joinChannel,
    sendMessage,
  };
};
