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
  DeliveryCreationDto,
  DeliveryFilter,
  DeliveryPreviewResponse,
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
    const response = await api.post<FulfillmentResponse>(
      `/fulfillments/requests/${requestId}`,
      data
    );
    return response.data;
  },
  createDeliveryRequest: async (data: DeliveryCreationDto) => {
    await api.post("/deliveries", data);
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
  getAvailable: async (filter: DeliveryFilter, page = 0, size = 10) => {
    const response = await api.get<Page<DeliveryPreviewResponse>>(
      "/deliveries/available",
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

  getMyActive: async (filter: DeliveryFilter, page = 0, size = 10) => {
    const response = await api.get<Page<DeliveryPreviewResponse>>(
      "/deliveries/my",
      {
        params: {
          ...filter,
          status: "IN_PROGRESS",
          page,
          size,
          sort: "createdAt,desc",
        },
      }
    );
    return response.data;
  },

  getMyArchive: async (filter: DeliveryFilter, page = 0, size = 10) => {
    const response = await api.get<Page<DeliveryPreviewResponse>>(
      "/deliveries/my",
      {
        params: {
          ...filter,
          status: "COMPLETED",
          page,
          size,
          sort: "createdAt,desc",
        },
      }
    );
    return response.data;
  },

  takeDelivery: async (id: number) => {
    await api.post(`/deliveries/${id}/take`);
  },

  completeDelivery: async (id: number) => {
    await api.patch(`/deliveries/${id}/complete`);
  },
};
