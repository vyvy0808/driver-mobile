import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import MapView, {
  Marker,
} from "react-native-maps";

import { Trip } from "../../types/trip";

import { tripService } from "../../services/tripService";

import { useTracking } from "../../hooks/useTracking";

import { useGpsSocket } from "../../hooks/useGpsSocket";

export default function TrackingScreen() {

  // TODO:
  // login chưa làm
  const driverId = 2;

  const [
    trip,
    setTrip,
  ] = useState<Trip | null>(
    null
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const mapRef =
    useRef<MapView | null>(
      null
    );

  // ====================
  // LOAD CURRENT TRIP
  // ====================

  useEffect(() => {

    loadCurrentTrip();

  }, []);

  const loadCurrentTrip =
    async () => {

      try {

        setLoading(
          true
        );

        const data =
          await tripService.getCurrentTripByDriver(
            driverId
          );

        setTrip(data);

      } catch (
        error
      ) {

        console.log(
          error
        );

      } finally {

        setLoading(
          false
        );
      }
    };

  // ====================
  // TRACKING
  // ====================

  const {
    tracking,
    currentLocation,
    startTracking,
    stopTracking,
  } = useTracking(
    trip?.id
  );

  // ====================
  // REALTIME SOCKET
  // ====================

  const {
    realtimeGps,
  } = useGpsSocket(
    trip?.id
  );

  // ====================
  // MARKER POSITION
  // ====================

  const markerLocation =
    useMemo(() => {

      if (
        realtimeGps
      ) {
        return {
          latitude:
            realtimeGps.lat,

          longitude:
            realtimeGps.lng,
        };
      }

      return (
        currentLocation
      );

    }, [
      realtimeGps,
      currentLocation,
    ]);

  // ====================
  // FOLLOW CAMERA
  // ====================

  useEffect(() => {

    if (
      markerLocation &&
      mapRef.current
    ) {

      mapRef.current.animateToRegion(
        {
          latitude:
            markerLocation.latitude,

          longitude:
            markerLocation.longitude,

          latitudeDelta:
            0.01,

          longitudeDelta:
            0.01,
        },
        1000
      );
    }

  }, [markerLocation]);

  // ====================
  // LOADING
  // ====================

  if (loading) {

    return (
      <View
        style={
          styles.loadingContainer
        }
      >
        <ActivityIndicator
          size="large"
          color="#ea580c"
        />
      </View>
    );
  }

  // ====================
  // NO TRIP
  // ====================

  if (!trip) {

    return (
      <SafeAreaView
        style={
          styles.container
        }
      >
        <View
          style={
            styles.emptyCard
          }
        >
          <Text
            style={
              styles.emptyTitle
            }
          >
            Không có chuyến xe
          </Text>

          <Text
            style={
              styles.emptyText
            }
          >
            Bạn chưa được
            phân công trip
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={
        styles.container
      }
    >

      {/* MAP */}

      <MapView
        ref={mapRef}
        style={styles.map}
        showsUserLocation
      >

        {markerLocation && (
          <Marker
            coordinate={
              markerLocation
            }
            title={
              trip.plateNumber
            }
            description={
              trip.routeName
            }
          />
        )}
      </MapView>

      {/* CARD */}

      <View
        style={
          styles.tripCard
        }
      >

        <Text
          style={
            styles.tripCode
          }
        >
          {
            trip.tripCode
          }
        </Text>

        <Text
          style={
            styles.route
          }
        >
          {
            trip.routeName
          }
        </Text>

        <View
          style={
            styles.row
          }
        >
          <Text
            style={
              styles.label
            }
          >
            Xe:
          </Text>

          <Text
            style={
              styles.value
            }
          >
            {
              trip.plateNumber
            }
          </Text>
        </View>

        <View
          style={
            styles.row
          }
        >
          <Text
            style={
              styles.label
            }
          >
            Trạng thái:
          </Text>

          <Text
            style={[
              styles.status,
              {
                color:
                  tracking
                    ? "#16a34a"
                    : "#dc2626",
              },
            ]}
          >
            {tracking
              ? "Đang tracking"
              : "Chưa tracking"}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor:
                tracking
                  ? "#dc2626"
                  : "#ea580c",
            },
          ]}
          onPress={() => {

            if (
              tracking
            ) {
              stopTracking();
            } else {
              startTracking();
            }
          }}
        >
          <Text
            style={
              styles.buttonText
            }
          >
            {tracking
              ? "Dừng tracking"
              : "Bắt đầu tracking"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        "#f8fafc",
    },

    map: {
      flex: 1,
    },

    tripCard: {
      position:
        "absolute",

      bottom: 30,
      left: 20,
      right: 20,

      backgroundColor:
        "#fff",

      borderRadius: 24,

      padding: 20,

      shadowColor:
        "#000",

      shadowOpacity:
        0.08,

      shadowRadius:
        12,

      elevation: 5,
    },

    tripCode: {
      fontSize: 22,
      fontWeight:
        "700",

      color:
        "#0f172a",
    },

    route: {
      marginTop: 6,
      fontSize: 15,
      color:
        "#64748b",

      marginBottom:
        18,
    },

    row: {
      flexDirection:
        "row",

      marginBottom: 8,
    },

    label: {
      color:
        "#64748b",

      width: 100,
    },

    value: {
      fontWeight:
        "600",
    },

    status: {
      fontWeight:
        "700",
    },

    button: {
      marginTop: 20,

      paddingVertical:
        16,

      borderRadius:
        18,

      alignItems:
        "center",
    },

    buttonText: {
      color:
        "#fff",

      fontWeight:
        "700",

      fontSize: 16,
    },

    loadingContainer: {
      flex: 1,

      justifyContent:
        "center",

      alignItems:
        "center",
    },

    emptyCard: {
      margin: 20,

      backgroundColor:
        "#fff",

      padding: 30,

      borderRadius:
        24,
    },

    emptyTitle: {
      fontSize: 22,

      fontWeight:
        "700",

      color:
        "#0f172a",
    },

    emptyText: {
      marginTop: 8,

      color:
        "#64748b",
    },
  });