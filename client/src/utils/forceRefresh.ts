// Utility to force refresh of church data
import { queryClient } from "../lib/queryClient";

export function forceRefreshChurchData() {
  // Invalidate all user church related queries
  queryClient.invalidateQueries({ queryKey: ['user-churches'] });
  queryClient.invalidateQueries({ queryKey: ['church-features'] });
  
  // Remove from cache and refetch
  queryClient.removeQueries({ queryKey: ['user-churches'] });
  queryClient.removeQueries({ queryKey: ['church-features'] });
  

}

// Auto-refresh on window focus to pick up church changes
if (typeof window !== 'undefined') {
  let refreshTimer: NodeJS.Timeout;
  
  window.addEventListener('focus', () => {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => {
      forceRefreshChurchData();
    }, 500);
  });
}