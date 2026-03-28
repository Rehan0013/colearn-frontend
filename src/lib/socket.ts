import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

/**
 * Returns a singleton Socket.io connection.
 * Call once on room entry — reuse everywhere via useSocket hook.
 */
export const getSocket = (): Socket => {
    if (!socket) {
        socket = io(process.env.NEXT_PUBLIC_REALTIME_URL!, {
            withCredentials: true,  // sends JWT cookie
            autoConnect: false,     // connect manually on room join
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });
    }
    return socket;
};

export const connectSocket = (): Socket => {
    const s = getSocket();
    if (!s.connected) s.connect();
    return s;
};

export const disconnectSocket = () => {
    if (socket?.connected) {
        socket.disconnect();
        socket = null;
    }
};
