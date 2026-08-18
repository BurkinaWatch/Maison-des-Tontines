import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tontineService } from "../services/tontine.service";
import { useTontineStore } from "../store/tontineStore";

export const useTontines = () => {
  const queryClient = useQueryClient();
  const {
    tontines,
    selectedTontine,
    isLoading: storeLoading,
    fetchTontines,
    fetchTontine,
    selectTontine,
    createTontine,
    updateTontine,
    deleteTontine,
  } = useTontineStore();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["tontines"],
    queryFn: () => tontineService.getTontines(),
    staleTime: 60 * 1000,
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
    tontines: data || tontines,
    selectedTontine,
    isLoading: isLoading || storeLoading,
    error,
    refetch,
    fetchTontines,
    fetchTontine,
    selectTontine,
    createTontine: (data: Parameters<typeof tontineService.createTontine>[0]) =>
      createMutation.mutateAsync(data),
    updateTontine: (id: string, data: Parameters<typeof tontineService.updateTontine>[1]) =>
      updateMutation.mutateAsync({ id, data }),
    deleteTontine: (id: string) => deleteMutation.mutateAsync(id),
  };
};
