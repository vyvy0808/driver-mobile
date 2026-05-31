import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { incidentService } from "../../services/incidentService";
import { tripService } from "../../services/tripService";
import { Trip } from "../../types/trip";

const PAGE_SIZE = 10;

export default function HomeScreen() {
  const { user } = useAuth();

  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [incidentType, setIncidentType] = useState("");
  const [incidentDescription, setIncidentDescription] = useState("");
  const [showIncidentForm, setShowIncidentForm] = useState(false);

  const totalPages = Math.max(1, Math.ceil(trips.length / PAGE_SIZE));

  const pagedTrips = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return trips.slice(start, start + PAGE_SIZE);
  }, [trips, page]);

  const loadTrips = async () => {
    if (!user?.driverId) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      let current: Trip | null = null;

      try {
        current = await tripService.getCurrentTripByDriver(user.driverId);
      } catch {
        current = null;
      }

      const allTrips = await tripService.getTripsByDriver(user.driverId);

      setCurrentTrip(current);
      setTrips(allTrips);
    } catch {
      Alert.alert("Lỗi", "Không thể tải danh sách chuyến xe.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, [user?.driverId]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadTrips();
  };

  const handleCreateIncident = async () => {
    if (!currentTrip || !user?.driverId) {
      Alert.alert("Lỗi", "Không tìm thấy chuyến hiện tại.");
      return;
    }

    if (!incidentType.trim() || !incidentDescription.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập loại sự cố và mô tả.");
      return;
    }

    try {
      await incidentService.createIncident({
        tripId: currentTrip.id,
        vehicleId: currentTrip.vehicleId,
        driverId: user.driverId,
        incidentType: incidentType.trim(),
        description: incidentDescription.trim(),
        incidentTime: new Date().toISOString(),
        status: "PENDING",
      });

      Alert.alert("Thành công", "Đã ghi nhận sự cố.");

      setIncidentType("");
      setIncidentDescription("");
      setShowIncidentForm(false);
    } catch {
      Alert.alert("Lỗi", "Không thể ghi nhận sự cố.");
    }
  };

  const handleViewSalary = async () => {
  if (!currentTrip) {
    return;
  }

  try {
    const salary =
      await tripService.getTripSalary(
        currentTrip.id
      );

    Alert.alert(
      "Lương chuyến",
      `Mã chuyến: ${salary.tripCode}

Tổng giá trị đơn hàng:
${Number(
  salary.totalOrderAmount
).toLocaleString("vi-VN")}đ

Lương tài xế (10%):
${Number(
  salary.salaryAmount
).toLocaleString("vi-VN")}đ`
    );
  } catch (error) {
    Alert.alert(
      "Lỗi",
      "Không thể tải thông tin lương chuyến."
    );
  }
};

  const handleCompleteTrip = () => {
    if (!currentTrip) return;

    Alert.alert("Hoàn thành chuyến", "Bạn xác nhận đã hoàn thành chuyến này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xác nhận",
        onPress: async () => {
          try {
            setSubmitting(true);
            await tripService.completeTrip(currentTrip.id);
            Alert.alert("Thành công", "Đã cập nhật chuyến xe hoàn thành.");
            setCurrentTrip(null);
            setShowIncidentForm(false);
            loadTrips();
          } catch {
            Alert.alert("Lỗi", "Không thể cập nhật trạng thái chuyến xe.");
          } finally {
            setSubmitting(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#F97316" />
        <Text style={styles.loadingText}>Đang tải chuyến xe...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <Text style={styles.pageTitle}>Trang chủ tài xế</Text>

      <Text style={styles.sectionTitle}>Chuyến hiện tại</Text>

      {!currentTrip ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Không có trip nào được phân công</Text>
        </View>
      ) : (
        <>
          <TripCard trip={currentTrip} highlight />

          <View style={styles.actionRow}>
            <Pressable
              style={styles.secondaryButton}
              onPress={() => setShowIncidentForm(!showIncidentForm)}
            >
              <Text style={styles.secondaryButtonText}>Ghi nhận sự cố</Text>
            </Pressable>

            <Pressable style={styles.secondaryButton} onPress={handleViewSalary}>
              <Text style={styles.secondaryButtonText}>Xem lương chuyến</Text>
            </Pressable>
          </View>

          {showIncidentForm && (
            <View style={styles.incidentCard}>
              <Text style={styles.cardTitle}>Ghi nhận sự cố</Text>

              <TextInput
                style={styles.input}
                placeholder="Loại sự cố"
                value={incidentType}
                onChangeText={setIncidentType}
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Mô tả sự cố"
                value={incidentDescription}
                onChangeText={setIncidentDescription}
                multiline
              />

              <Pressable
                style={styles.saveIncidentButton}
                onPress={handleCreateIncident}
              >
                <Text style={styles.saveIncidentText}>Lưu sự cố</Text>
              </Pressable>
            </View>
          )}

          <Pressable
            style={[styles.completeButton, submitting && styles.disabledButton]}
            onPress={handleCompleteTrip}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.completeText}>Hoàn thành chuyến</Text>
            )}
          </Pressable>
        </>
      )}

      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
        Lịch sử chuyến đã chạy
      </Text>

      {pagedTrips.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Chưa có lịch sử chuyến xe.</Text>
        </View>
      ) : (
        pagedTrips.map((item) => <TripCard key={item.id} trip={item} />)
      )}

      <View style={styles.pagination}>
        <Pressable
          style={[styles.pageButton, page === 1 && styles.disabledButton]}
          disabled={page === 1}
          onPress={() => setPage(page - 1)}
        >
          <Text style={styles.pageButtonText}>Trước</Text>
        </Pressable>

        <Text style={styles.pageText}>
          Trang {page}/{totalPages}
        </Text>

        <Pressable
          style={[styles.pageButton, page === totalPages && styles.disabledButton]}
          disabled={page === totalPages}
          onPress={() => setPage(page + 1)}
        >
          <Text style={styles.pageButtonText}>Sau</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function TripCard({
  trip,
  highlight = false,
}: {
  trip: Trip;
  highlight?: boolean;
}) {
  return (
    <View style={[styles.card, highlight && styles.highlightCard]}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.tripCode}>{trip.tripCode}</Text>
          <Text style={styles.driverName}>{trip.driverName}</Text>
        </View>

        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{trip.status}</Text>
        </View>
      </View>

      <InfoRow label="Biển số xe" value={trip.plateNumber} />
      <InfoRow label="Tuyến đường" value={trip.routeName || "Chưa có"} />
      <InfoRow label="Thời gian xuất phát" value={trip.departureTime} />
      <InfoRow
        label="Thời gian đến"
        value={trip.arrivalTime || "Chưa hoàn thành"}
      />
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || "Chưa có thông tin"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F5F9" },
  content: { padding: 20, paddingBottom: 100 },
  center: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: { marginTop: 12, color: "#64748B", fontWeight: "600" },
  pageTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
  },
  highlightCard: {
    borderWidth: 2,
    borderColor: "#F97316",
  },
  cardHeader: {
    backgroundColor: "#0F172A",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tripCode: { color: "#FFFFFF", fontSize: 17, fontWeight: "900" },
  driverName: { color: "#CBD5E1", marginTop: 4, fontWeight: "600" },
  statusBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusText: { color: "#92400E", fontWeight: "900", fontSize: 12 },
  infoRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  infoLabel: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
  },
  infoValue: { color: "#0F172A", fontSize: 15, fontWeight: "700" },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  secondaryButton: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 13,
  },
  incidentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
  },
  cardTitle: {
    color: "#0F172A",
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 12,
  },
  input: {
    minHeight: 50,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 12,
    color: "#0F172A",
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  saveIncidentButton: {
    height: 48,
    borderRadius: 16,
    backgroundColor: "#F97316",
    justifyContent: "center",
    alignItems: "center",
  },
  saveIncidentText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
  completeButton: {
    height: 54,
    borderRadius: 18,
    backgroundColor: "#F97316",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6,
  },
  completeText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  disabledButton: { opacity: 0.5 },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
    marginBottom: 14,
    alignItems: "center",
  },
  emptyTitle: { color: "#0F172A", fontSize: 16, fontWeight: "900" },
  emptyText: { color: "#64748B", textAlign: "center", lineHeight: 22 },
  pagination: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pageButton: {
    backgroundColor: "#0F172A",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
  },
  pageButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  pageText: {
    color: "#0F172A",
    fontWeight: "800",
  },
});