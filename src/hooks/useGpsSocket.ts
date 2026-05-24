import {
  useEffect,
  useState,
} from "react";

import { Gps }
from "../types/gps";

import { websocketService }
from "../services/websocketService";

export function useGpsSocket(
  tripId?: number
) {

  const [
    realtimeGps,
    setRealtimeGps,
  ] = useState<Gps | null>(
    null
  );

  useEffect(() => {

    if (!tripId)
      return;

    websocketService.connect(
      () => {

        websocketService.subscribeGps(
          tripId,
          (
            gps: Gps
          ) => {

            console.log(
              "REALTIME GPS:",
              gps
            );

            setRealtimeGps(
              gps
            );
          }
        );
      }
    );

    return () => {
      websocketService.disconnect();
    };

  }, [tripId]);

  return {
    realtimeGps,
  };
}