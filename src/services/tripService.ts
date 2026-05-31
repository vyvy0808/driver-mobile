import api from "../api/axios";
import { Trip } from "../types/trip";

export interface TripSalary {
  tripId: number;
  tripCode: string;
  totalOrderAmount: number;
  salaryAmount: number;
  note: string;
}

export const tripService = {
  getCurrentTripByDriver: async (
    driverId: number
  ): Promise<Trip | null> => {
    const response = await api.get<Trip | null>(
      `/trips/driver/${driverId}/current`
    );

    return response.data;
  },

  getTripsByDriver: async (
    driverId: number
  ): Promise<Trip[]> => {
    const response = await api.get<Trip[]>(
      `/trips/driver/${driverId}`
    );

    return response.data;
  },

  getTripSalary: async (
    tripId: number
  ): Promise<TripSalary> => {
    const response = await api.get<TripSalary>(
      `/trips/${tripId}/salary`
    );

    return response.data;
  },

  completeTrip: async (
    tripId: number
  ): Promise<void> => {
    await api.patch(
      `/trips/${tripId}/complete`
    );
  },
};