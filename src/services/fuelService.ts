import api from "../api/axios";
import { FuelTransaction, FuelTransactionRequest } from "../types/fuel";

export const fuelService = {
  getFuelHistoryByVehicle: async (
    vehicleId: number
  ): Promise<FuelTransaction[]> => {
    const response = await api.get<FuelTransaction[]>(
      `/fuel-transactions/vehicle/${vehicleId}`
    );

    return response.data;
  },

  createFuelTransaction: async (
    data: FuelTransactionRequest
  ): Promise<FuelTransaction> => {
    const response = await api.post<FuelTransaction>(
      "/fuel-transactions",
      data
    );

    return response.data;
  },

  updateFuelTransaction: async (
    id: number,
    data: FuelTransactionRequest
  ): Promise<FuelTransaction> => {
    const response = await api.put<FuelTransaction>(
      `/fuel-transactions/${id}`,
      data
    );

    return response.data;
  },

  getFuelConsumptionByVehicle: async (
    vehicleId: number,
    startDate: string,
    endDate: string
  ): Promise<number> => {
    const response = await api.get<number>(
      `/fuel-transactions/consumption/vehicle/${vehicleId}`,
      {
        params: {
          startDate,
          endDate,
        },
      }
    );

    return response.data;
  },
};