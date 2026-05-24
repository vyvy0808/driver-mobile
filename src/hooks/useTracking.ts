import {
  useEffect,
  useRef,
  useState,
} from "react";

import * as Location
from "expo-location";

import { gpsService }
from "../services/gpsService";

export function useTracking(
  tripId?: number
) {
  const [
    tracking,
    setTracking,
  ] = useState(false);

  const [
    currentLocation,
    setCurrentLocation,
  ] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const intervalRef =
    useRef<
      ReturnType<
        typeof setInterval
      > | null
    >(null);

  const getCurrentGps =
    async () => {

      const location =
        await Location.getCurrentPositionAsync(
          {
            accuracy:
              Location.Accuracy.High,
          }
        );

      const latitude =
        location.coords.latitude;

      const longitude =
        location.coords.longitude;

      setCurrentLocation({
        latitude,
        longitude,
      });

      return {
        latitude,
        longitude,
      };
    };

  const startTracking =
    async () => {

      try {

        if (!tripId) {
          alert(
            "Không có trip"
          );
          return;
        }

        const {
          status,
        } =
          await Location.requestForegroundPermissionsAsync();

        if (
          status !==
          "granted"
        ) {
          alert(
            "Cần quyền GPS"
          );
          return;
        }

        setTracking(
          true
        );

        const firstGps =
          await getCurrentGps();

        await gpsService.push(
          tripId,
          firstGps.latitude,
          firstGps.longitude
        );

        intervalRef.current =
          setInterval(
            async () => {

              try {

                const gps =
                  await getCurrentGps();

                await gpsService.push(
                  tripId,
                  gps.latitude,
                  gps.longitude
                );

                console.log(
                  "GPS PUSHED"
                );

              } catch (
                error
              ) {
                console.log(
                  error
                );
              }
            },
            10000
          );

      } catch (
        error
      ) {

        console.log(
          error
        );
      }
    };

  const stopTracking =
    () => {

      setTracking(
        false
      );

      if (
        intervalRef.current
      ) {

        clearInterval(
          intervalRef.current
        );

        intervalRef.current =
          null;
      }
    };

  useEffect(() => {

    return () => {
      stopTracking();
    };

  }, []);

  return {
    tracking,
    currentLocation,
    startTracking,
    stopTracking,
  };
}