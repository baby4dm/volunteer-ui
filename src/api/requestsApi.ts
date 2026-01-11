import { api } from "./axiosConfig";

import type {
  HelpRequestDto,
  HelpRequestPreviewResponse,
  HelpRequestFilter,
  Page,
  FulfillmentResponse,
  HelpRequestResponse,
  FulfillmentRequestDto,
  FulfillmentFilter,
  VolunteerContributionResponse,
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

  getMyProposals: async (page = 0, size = 10) => {
    const response = await api.get<Page<FulfillmentResponse>>(
      "/fulfillments/incoming",
      {
        params: { page, size, sort: "createdAt,desc" },
      }
    );
    return response.data;
  },

  approveProposal: async (fulfillmentId: number) => {
    await api.patch(`/fulfillments/${fulfillmentId}/approve`);
  },

  rejectProposal: async (fulfillmentId: number) => {
    await api.patch(`/fulfillments/${fulfillmentId}/reject`);
  },
  getAllRequests: async (filter: HelpRequestFilter, page = 0, size = 10) => {
    const response = await api.get<Page<HelpRequestPreviewResponse>>(
      "/requests",
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
  createOffer: async (requestId: number, data: FulfillmentRequestDto) => {
    await api.post(`/fulfillments/requests/${requestId}`, data);
  },
  getMyContributions: async (filter: FulfillmentFilter, page = 0) => {
    const response = await api.get<Page<VolunteerContributionResponse>>(
      "/fulfillments/contributions",
      {
        params: {
          ...filter,
          page,
          size: 10,
          sort: "createdAt,desc",
        },
      }
    );
    return response.data;
  },
};
