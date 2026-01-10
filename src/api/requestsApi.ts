import { api } from "./axiosConfig";

import type {
  HelpRequestDto,
  HelpRequestPreviewResponse,
  HelpRequestFilter,
  Page,
  FulfillmentProposal,
  HelpRequestResponse,
} from "../types";

export const requestsApi = {
  create: async (data: HelpRequestDto) => {
    return await api.post<void>("/requests", data);
  },

  getMyRequests: async (filter: HelpRequestFilter, page = 0, size = 10) => {
    const response = await api.get<Page<HelpRequestPreviewResponse>>(
      "/requests/me",
      {
        params: {
          ...filter,
          page,
          size,
          sort: "createdAt,desc",
        },
      }
    );
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<HelpRequestResponse>(`/requests/${id}`);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/requests/${id}`);
  },

  getMyProposals: async () => {
    const response = await api.get<FulfillmentProposal[]>(
      "/fulfillments/incoming"
    );
    return response.data;
  },

  approveProposal: async (fulfillmentId: number) => {
    await api.post(`/fulfillments/${fulfillmentId}/approve`);
  },

  rejectProposal: async (fulfillmentId: number) => {
    await api.post(`/fulfillments/${fulfillmentId}/reject`);
  },
};
