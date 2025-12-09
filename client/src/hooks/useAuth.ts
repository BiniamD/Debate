import { useUser } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  
  // Fetch app user data from our backend (includes isPremium, debatesThisMonth, etc.)
  const { data: appUser, isLoading: isAppUserLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: isSignedIn, // Only fetch if signed in with Clerk
  });

  // Combine Clerk user data with app user data
  const user = isSignedIn && appUser ? {
    ...appUser,
    email: clerkUser?.primaryEmailAddress?.emailAddress || appUser.email,
    firstName: clerkUser?.firstName || appUser.firstName,
    lastName: clerkUser?.lastName || appUser.lastName,
    profileImageUrl: clerkUser?.imageUrl || appUser.profileImageUrl,
  } : undefined;

  return {
    user,
    isLoading: !isLoaded || (isSignedIn && isAppUserLoading),
    isFetching: isAppUserLoading,
    isAuthenticated: isSignedIn && !!appUser,
    clerkUser,
  };
}
