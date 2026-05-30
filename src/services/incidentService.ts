import api from "../api/axios";
import { IncidentRequest, IncidentResponse } from "../types/incident";

export const incidentService = {
  createIncident: async (
    data: IncidentRequest
  ): Promise<IncidentResponse> => {
    const response = await api.post<IncidentResponse>("/incidents", data);
    return response.data;
  },
};