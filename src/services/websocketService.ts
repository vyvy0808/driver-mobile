import SockJS from "sockjs-client";

import { Client }
from "@stomp/stompjs";

import { CONFIG }
from "../constants/config";

class WebSocketService {
  private client:
    Client | null =
    null;

  connect(
    onConnected?: () => void
  ) {

    const socket =
      new SockJS(
        CONFIG.WS_URL
      );

    this.client =
      new Client({
        webSocketFactory:
          () => socket,

        reconnectDelay:
          5000,

        debug: (str) => {
          console.log(
            "WS:",
            str
          );
        },

        onConnect: () => {
          console.log(
            "WS Connected"
          );

          onConnected?.();
        },

        onDisconnect:
          () => {
            console.log(
              "WS Disconnected"
            );
          },

        onStompError:
          (frame) => {
            console.log(
              "WS ERROR:",
              frame
            );
          },
      });

    this.client.activate();
  }

  subscribeGps(
    tripId: number,
    callback: (
      data: any
    ) => void
  ) {
    if (!this.client)
      return;

    this.client.subscribe(
      `/topic/gps/${tripId}`,
      (message) => {

        const body =
          JSON.parse(
            message.body
          );

        callback(body);
      }
    );
  }

  disconnect() {
    this.client?.deactivate();
  }
}

export const websocketService =
  new WebSocketService();