import api from "../api/axios";
import { Trip }
  from "../types/trip";

export const tripService = {
  getCurrentTrip:
    async (
      driverId: number
    ): Promise<Trip> => {

      const res =
        await api.get(
          `/api/trips/driver/${driverId}/current`
        );

      return res.data;
    },
};