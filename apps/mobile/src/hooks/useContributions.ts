import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { contributionService } from "../services/contribution.service";
import { Contribution } from "../types/contribution";

export const useContributions = (tontineId?: string) => {
  const queryClient = useQueryClient();

  const { data: upcoming = [], isLoading: upcomingLoading, refetch: refetchUpcoming } = useQuery({
    queryKey: ["contributions", "upcoming", tontineId],
    queryFn: () => contributionService.getUpcoming(),
    staleTime: 30 * 1000,
  });

  const { data: history = [], isLoading: historyLoading, refetch: refetchHistory } = useQuery({
    queryKey: ["contributions", "history", tontineId],
    queryFn: () => contributionService.getHistory(tontineId),
    staleTime: 60 * 1000,
  });

  const payMutation = useMutation({
    mutationFn: (contributionId: string) =>
      contributionService.markAsPaid(contributionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contributions"] });
    },
  });

  return {
    upcoming,
    history,
    isLoading: upcomingLoading || historyLoading,
    refetch: () => Promise.all([refetchUpcoming(), refetchHistory()]),
    payContribution: (contributionId: string) =>
      payMutation.mutateAsync(contributionId),
    isPaying: payMutation.isPending,
  };
};

export const usePayouts = (tontineId?: string) => {
  const queryClient = useQueryClient();

  const { data: payouts = [], isLoading } = useQuery({
    queryKey: ["payouts", tontineId],
    queryFn: () => contributionService.getPayouts(tontineId),
    staleTime: 60 * 1000,
  });

  const requestEarlyPayoutMutation = useMutation({
    mutationFn: (payoutId: string) =>
      contributionService.requestEarlyPayout(payoutId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payouts"] });
    },
  });

  return {
    payouts,
    isLoading,
    requestEarlyPayout: (payoutId: string) =>
      requestEarlyPayoutMutation.mutateAsync(payoutId),
    isRequesting: requestEarlyPayoutMutation.isPending,
  };
};
