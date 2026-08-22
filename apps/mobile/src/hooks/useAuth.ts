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
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.login({ email, password }),
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
      password,
    }: {
      phoneNumber: string;
      email: string;
      firstName: string;
      lastName: string;
      password: string;
    }) =>
      authService.register({ phoneNumber, email, firstName, lastName, password }),
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
    login: (email: string, password: string) =>
      loginMutation.mutateAsync({ email, password }),
    register: (phoneNumber: string, email: string, firstName: string, lastName: string, password: string) =>
      registerMutation.mutateAsync({ phoneNumber, email, firstName, lastName, password }),
    logout: () => logout(),
    initialize: () => initialize(),
  };
};
