// BoltPatch: Enhanced socket hook with token auth and better error handling
import { useEffect } from "react";
import { io } from "socket.io-client";
import useStore from "../store/useStore";
import routeMap from "../services/routeMap";

let socket;

export default function useSocket() {
  const addNotification = useStore((s) => s.addNotification);

  useEffect(() => {
    // Get JWT token from localStorage (or any auth storage)
    const token = localStorage.getItem("token");
    const apiBase = routeMap.socket || "http://localhost:4000";

    // Initialize socket connection
    socket = io(apiBase, {
      transports: ["websocket", "polling"],
      auth: { token }, // Pass JWT token for authentication
      reconnection: true, // Auto-reconnect
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    // Connection established
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      if (token) {
        console.log("User authenticated with token");
      } else {
        console.log("Anonymous socket connection");
      }
    });

    // Handle notifications
    socket.on("newItemPosted", (payload) => {
      addNotification({
        id: Date.now(),
        type: "new_item",
        title: "New Item Posted",
        message: `A new ${payload.type?.toLowerCase()} item has been reported: ${payload.itemName}`,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on("itemDeleted", (itemId) => {
      addNotification({
        id: Date.now(),
        type: "item_deleted",
        title: "Item Removed",
        message: "An item has been removed from the system",
        timestamp: new Date().toISOString(),
      });
    });

    socket.on("itemUpdated", (payload) => {
      addNotification({
        id: Date.now(),
        type: "item_updated",
        title: "Item Updated",
        message: `An item has been updated: ${payload.itemName || "Unknown item"}`,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on("notification", (payload) => {
      addNotification({
        id: Date.now(),
        ...payload,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle connection errors
    socket.on("connect_error", (err) => {
      console.warn("Socket connection error:", err.message);
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    // Cleanup on unmount
    return () => {
      if (socket) socket.disconnect();
    };
  }, [addNotification]);

  return socket;
}
