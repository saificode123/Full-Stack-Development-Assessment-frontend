/**
 * useNotifications — reads notification preferences from localStorage.
 * 
 * Usage in any component:
 *   const { canNotify } = useNotifications();
 *   if (canNotify('task_assignments')) { ... show notification ... }
 * 
 * Keys:
 *   task_assignments    — notify when a task is assigned to the user
 *   team_invites        — notify when invited to a team
 *   task_status_updates — notify when a task status changes
 *   weekly_digest       — weekly summary notifications
 */

const DEFAULT_PREFS = {
  task_assignments: true,
  team_invites: true,
  task_status_updates: false,
  weekly_digest: false,
};

export function getNotificationPrefs() {
  try {
    const saved = localStorage.getItem('notificationPrefs');
    if (saved) {
      return { ...DEFAULT_PREFS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.warn('Failed to read notification prefs', e);
  }
  return DEFAULT_PREFS;
}

export default function useNotifications() {
  const prefs = getNotificationPrefs();

  /**
   * Returns true if the user has enabled notifications for the given key.
   * @param {string} key - one of: task_assignments, team_invites, task_status_updates, weekly_digest
   */
  const canNotify = (key) => {
    return prefs[key] === true;
  };

  /**
   * Shows a browser notification if the user has enabled it and the browser supports it.
   * @param {string} key - notification preference key
   * @param {string} title - notification title
   * @param {string} body - notification body text
   */
  const notify = (key, title, body) => {
    if (!canNotify(key)) return;

    // Use browser Notification API if available and permitted
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, { body });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            new Notification(title, { body });
          }
        });
      }
    }
  };

  return { prefs, canNotify, notify };
}
