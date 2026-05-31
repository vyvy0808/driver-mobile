import api from "../api/axios";

export const gpsService = {
  push: async (
    tripId: number,
    lat: number,
    lng: number
  ) => {

    const res =
      await api.post(
        "/gps/push",
        {
          tripId,
          lat,
          lng,
        }
      );

    return res.data;
  },
};