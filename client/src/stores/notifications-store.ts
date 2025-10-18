import { create } from "zustand";
import { dataService } from "@/services/dataService";

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
}

interface NotificationsState {
  notifications: NotificationItem[];
  unreadCount: number;
  setNotifications: (notifications: NotificationItem[]) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  notifications: [],
  unreadCount: 0,
  setNotifications: (notifications: NotificationItem[]) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.readAt).length,
    }),
  markAsRead: async (id: string) => {
    const success = await dataService.markNotificationAsRead(id);
    if (success) {
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, readAt: new Date().toISOString() } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    }
  },
  markAllAsRead: async () => {
    const success = await dataService.markAllNotificationsAsRead();
    if (success) {
      set((state) => ({
        notifications: state.notifications.map((n) => ({
          ...n,
          readAt: n.readAt || new Date().toISOString(),
        })),
        unreadCount: 0,
      }));
    }
  },
}));
