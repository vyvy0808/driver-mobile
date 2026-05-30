import api from "../api/axios";
import { DriverAssignment, DriverProfile } from "../types/profile";

export const profileService = {
  getDriverById: async (driverId: number): Promise<DriverProfile> => {
    const response = await api.get<DriverProfile>(`/drivers/${driverId}`);
    return response.data;
  },

  getMyAssignment: async (
  driverId: number
): Promise<DriverAssignment[]> => {
  const response = await api.get<DriverAssignment[]>(
    `/driver-assignments/my/${driverId}`
  );

  return response.data;
},
};