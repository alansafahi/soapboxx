import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

interface TourStatus {
  shouldShowTour: boolean;
  userRole: string;
  isNewUser: boolean;
  hasNewRoleAssignment: boolean;
}

export function useRoleBasedTour() {
  const [tourCompleted, setTourCompleted] = useState(false);

  // Check user's tour status based on their role and onboarding state
  const { data: tourStatus, isLoading } = useQuery<TourStatus>({
    queryKey: ["/api/tour/status"],
    retry: false,
  });

  // Check if tour should be shown
  const shouldShowTour = tourStatus?.shouldShowTour && !tourCompleted && !isLoading;

  const completeTour = async () => {
    try {
      // Mark tour as completed for this role
      await fetch("/api/tour/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: tourStatus?.userRole,
        }),
      });
      setTourCompleted(true);
    } catch (error) {
    }
  };

  return {
    shouldShowTour,
    userRole: tourStatus?.userRole || "",
    isNewUser: tourStatus?.isNewUser || false,
    hasNewRoleAssignment: tourStatus?.hasNewRoleAssignment || false,
    completeTour,
    isLoading,
  };
}