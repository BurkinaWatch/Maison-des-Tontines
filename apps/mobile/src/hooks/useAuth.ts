import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services/auth.service";
import { useAuthStore } from "../store/authStore";

export const useAuth = () => {
  const queryClient = useQueryClient();
  const { user, isAuthenticated, login, register, logout, initialize, isLoading } =
    useAuthStore();

  const currentUserQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const user = await authService.getCurrentUser();
      return user;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  const loginMutation = useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) =>
      authService.login({ email, otp }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: ({
      phoneNumber,
      email,
      firstName,
      lastName,
      otp,
    }: {
      phoneNumber: string;
      email: string;
      firstName: string;
      lastName: string;
      otp: string;
    }) =>
      authService.register({ phoneNumber, email, firstName, lastName, otp }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });

  return {
    user,
    isAuthenticated,
    isLoading,
    currentUserQuery,
    loginMutation,
    registerMutation,
    login: (email: string, otp: string) =>
      loginMutation.mutateAsync({ email, otp }),
    register: (phoneNumber: string, email: string, firstName: string, lastName: string, otp: string) =>
      registerMutation.mutateAsync({ phoneNumber, email, firstName, lastName, otp }),
    logout: () => logout(),
    initialize: () => initialize(),
  };
};
