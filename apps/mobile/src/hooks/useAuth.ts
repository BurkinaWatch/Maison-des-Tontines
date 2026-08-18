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
    mutationFn: ({ phoneNumber, otp }: { phoneNumber: string; otp: string }) =>
      authService.login({ phoneNumber, otp }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: ({
      phoneNumber,
      firstName,
      lastName,
      otp,
    }: {
      phoneNumber: string;
      firstName: string;
      lastName: string;
      otp: string;
    }) =>
      authService.register({ phoneNumber, firstName, lastName, otp }),
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
    login: (phoneNumber: string, otp: string) =>
      loginMutation.mutateAsync({ phoneNumber, otp }),
    register: (phoneNumber: string, firstName: string, lastName: string, otp: string) =>
      registerMutation.mutateAsync({ phoneNumber, firstName, lastName, otp }),
    logout: () => logout(),
    initialize: () => initialize(),
  };
};
