'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';

/**
 * Generic hook to drive an admin CRUD list page against a REST resource API
 * shaped like { adminGetAll, create, update, delete }.
 */
interface AdminResourceApi {
  adminGetAll?: (params: any) => Promise<any>;
  getAll?: (params: any) => Promise<any>;
  create: (payload: any) => Promise<any>;
  update: (id: string, payload: any) => Promise<any>;
  delete: (id: string) => Promise<any>;
}

export function useAdminResource({
  key,
  api,
  listFn = 'adminGetAll',
  extraParams = {},
}: {
  key: string;
  api: AdminResourceApi;
  listFn?: 'adminGetAll' | 'getAll';
  extraParams?: Record<string, any>;
}) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');

  const query = useQuery({
    queryKey: [key, 'list', page, limit, search, extraParams],
    queryFn: async () => {
      const fn = api[listFn] || api.adminGetAll || api.getAll;
      const res = await fn!({ page, limit, search: search || undefined, ...extraParams });
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: [key, 'list'] });

  const createMutation = useMutation({
    mutationFn: (payload: any) => api.create(payload),
    onSuccess: () => {
      enqueueSnackbar('Created successfully', { variant: 'success' });
      invalidate();
    },
    onError: (err: any) => {
      enqueueSnackbar(err.response?.data?.message || 'Create failed', { variant: 'error' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.update(id, payload),
    onSuccess: () => {
      enqueueSnackbar('Updated successfully', { variant: 'success' });
      invalidate();
    },
    onError: (err: any) => {
      enqueueSnackbar(err.response?.data?.message || 'Update failed', { variant: 'error' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(id),
    onSuccess: () => {
      enqueueSnackbar('Deleted successfully', { variant: 'success' });
      invalidate();
    },
    onError: (err: any) => {
      enqueueSnackbar(err.response?.data?.message || 'Delete failed', { variant: 'error' });
    },
  });

  return {
    items: query.data?.data ?? [],
    meta: query.data?.meta,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    page,
    setPage,
    limit,
    setLimit,
    search,
    setSearch,
    createMutation,
    updateMutation,
    deleteMutation,
    refetch: query.refetch,
  };
}

export default useAdminResource;
