import { QueryClient } from '@tanstack/react-query';

export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    profile: ['auth', 'profile'] as const,
    me: ['auth', 'me'] as const,
  },
  invitations: {
    all: ['invitations'] as const,
    list: ['invitations', 'list'] as const,
    detail: (id: string) => ['invitations', 'detail', id] as const,
    bySlug: (slug: string) => ['invitations', 'slug', slug] as const,
  },
  guests: {
    all: ['guests'] as const,
    list: (invitationId: string) => ['guests', 'list', invitationId] as const,
  },
  rsvps: {
    all: ['rsvps'] as const,
    list: (invitationId: string) => ['rsvps', 'list', invitationId] as const,
  },
  packages: {
    all: ['license', 'packages'] as const,
    list: ['license', 'packages'] as const,
  },
  orders: {
    all: ['orders'] as const,
    myOrders: ['orders', 'my-orders'] as const,
    channels: ['orders', 'channels'] as const,
    status: (invoiceNumber: string) => ['orders', 'status', invoiceNumber] as const,
  },
  themes: {
    all: ['themes'] as const,
    styleKits: ['themes', 'style-kits'] as const,
  },
  stitch: {
    manifests: ['stitch', 'manifests'] as const,
  }
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

/**
 * Invalidate all queries related to projects, active licenses, and user tokens
 */
export const invalidateLicenseFlow = async (client: QueryClient = queryClient) => {
  await Promise.all([
    client.invalidateQueries({ queryKey: queryKeys.invitations.all }),
    client.invalidateQueries({ queryKey: queryKeys.orders.myOrders }),
    client.invalidateQueries({ queryKey: queryKeys.auth.all }),
    // backward compatibility with raw strings during transition
    client.invalidateQueries({ queryKey: ['invitations-list'] }),
    client.invalidateQueries({ queryKey: ['my-orders-license'] }),
    client.invalidateQueries({ queryKey: ['auth-me-profile'] }),
  ]);
};
