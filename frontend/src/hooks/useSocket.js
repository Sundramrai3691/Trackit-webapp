// BoltPatch: Enhanced socket hook with token auth handshake
import { useEffect } from "react";
import { io } from "socket.io-client";
import useStore from "../store/useStore";
import routeMap from "../services/routeMap";

let socket;

export default function useSocket() {
  const addNotification = useStore((s) => s.addNotification);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const apiBase = routeMap.socket || window.location.origin;
    
    socket = io(apiBase, { 
      transports: ["websocket","polling"], 
      auth: { token } 
    });
    
    socket.on("connect", () => console.log("socket connected", socket.id));
    
    socket.on("notification", (payload) => addNotification({
      id: Date.now(),
      ...payload,
      timestamp: new Date().toISOString(),
    }));
    
    // BoltPatch: Handle specific item events
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
    
    socket.on("connect_error", (err) => console.warn("socket connect_error", err.message));
    
    return () => socket && socket.disconnect();
  }, [addNotification]);
  
  return socket;
}
