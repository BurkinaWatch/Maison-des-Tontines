import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tontineService } from "../services/tontine.service";
import { useAuthStore } from "../store/authStore";
import { useTontineStore } from "../store/tontineStore";

export const useTontines = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading: authLoading, user } = useAuthStore();
  const {
    selectedTontine,
    isLoading: storeLoading,
    fetchTontine,
    selectTontine,
    createTontine,
    updateTontine: storeUpdateTontine,
    deleteTontine,
  } = useTontineStore();

  const { data = [], isLoading, error, refetch } = useQuery({
    queryKey: ["tontines", user?.id],
    queryFn: () => tontineService.getTontines(),
    staleTime: 60 * 1000,
    enabled: isAuthenticated,
  });

  const createMutation = useMutation({
    mutationFn: createTontine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tontines"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof tontineService.updateTontine>[1] }) =>
      tontineService.updateTontine(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tontines"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTontine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tontines"] });
    },
  });

  return {
    tontines: data,
    selectedTontine,
    isLoading: isLoading || storeLoading || authLoading,
    error,
    refetch,
    fetchTontine,
    selectTontine,
    createTontine: (data: Parameters<typeof tontineService.createTontine>[0]) =>
      createMutation.mutateAsync(data),
    updateTontine: (id: string, data: Parameters<typeof tontineService.updateTontine>[1]) =>
      updateMutation.mutateAsync({ id, data }),
    deleteTontine: (id: string) => deleteMutation.mutateAsync(id),
  };
};
