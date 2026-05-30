import React, { useEffect, useState } from "react";
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
import { fuelService } from "../../services/fuelService";
import { profileService } from "../../services/profileService";
import { tripService } from "../../services/tripService";
import { FuelTransaction } from "../../types/fuel";

export default function FuelScreen() {
  const { user } = useAuth();

  const [vehicleId, setVehicleId] = useState<number | null>(null);
  const [tripId, setTripId] = useState<number | null>(null);
  const [plateNumber, setPlateNumber] = useState("");

  const [quantityLiters, setQuantityLiters] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");

  const [fuelHistory, setFuelHistory] = useState<FuelTransaction[]>([]);
  const [consumption, setConsumption] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const startDate = `${new Date().getFullYear()}-${String(
    new Date().getMonth() + 1
  ).padStart(2, "0")}-01`;

  const loadData = async () => {
    if (!user?.driverId) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const assignments = await profileService.getMyAssignment(user.driverId);
      const assignment = Array.isArray(assignments) ? assignments[0] : assignments;

      if (assignment) {
        setVehicleId(assignment.vehicleId);
        setPlateNumber(assignment.plateNumber);

        const history = await fuelService.getFuelHistoryByVehicle(
          assignment.vehicleId
        );
        setFuelHistory(history);

        const consume = await fuelService.getFuelConsumptionByVehicle(
          assignment.vehicleId,
          startDate,
          today
        );
        setConsumption(consume);
      }

      try {
        const currentTrip = await tripService.getCurrentTripByDriver(user.driverId);
        setTripId(currentTrip?.id ?? null);
      } catch {
        setTripId(null);
      }
    } catch {
      Alert.alert("Lỗi", "Không thể tải dữ liệu nhiên liệu.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.driverId]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleCreateFuel = async () => {
    if (!user?.driverId || !vehicleId) {
      Alert.alert("Lỗi", "Không tìm thấy thông tin tài xế hoặc xe.");
      return;
    }

    if (!tripId) {
      Alert.alert("Lỗi", "Hiện tại chưa có chuyến xe để ghi nhận nhiên liệu.");
      return;
    }

    if (!quantityLiters || !unitPrice) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập số lít và đơn giá.");
      return;
    }

    try {
      setSubmitting(true);

      await fuelService.createFuelTransaction({
        vehicleId,
        tripId,
        driverId: user.driverId,
        fuelDate: new Date().toISOString(),
        quantityLiters: Number(quantityLiters),
        unitPrice: Number(unitPrice),
        invoiceNumber,
      });

      Alert.alert("Thành công", "Đã ghi nhận đổ nhiên liệu.");

      setQuantityLiters("");
      setUnitPrice("");
      setInvoiceNumber("");

      loadData();
    } catch {
      Alert.alert("Lỗi", "Không thể ghi nhận nhiên liệu.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#F97316" />
        <Text style={styles.loadingText}>Đang tải nhiên liệu...</Text>
      </View>
    );
  }

  const totalAmount =
    Number(quantityLiters || 0) * Number(unitPrice || 0);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <Text style={styles.pageTitle}>Ghi nhận nhiên liệu</Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Xe đang sử dụng</Text>
        <Text style={styles.summaryValue}>{plateNumber || "Chưa có xe"}</Text>

        <Text style={styles.summaryLabel}>Mức tiêu hao tháng này</Text>
        <Text style={styles.summaryValue}>
          {consumption !== null ? `${consumption} L` : "Chưa có dữ liệu"}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Thêm phiếu nhiên liệu</Text>

        <Text style={styles.label}>Số lít</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={quantityLiters}
          onChangeText={setQuantityLiters}
          placeholder="VD: 50"
        />

        <Text style={styles.label}>Đơn giá</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={unitPrice}
          onChangeText={setUnitPrice}
          placeholder="VD: 24000"
        />

        <Text style={styles.label}>Số hóa đơn</Text>
        <TextInput
          style={styles.input}
          value={invoiceNumber}
          onChangeText={setInvoiceNumber}
          placeholder="VD: HD001"
        />

        <Text style={styles.totalText}>
          Tổng tiền: {totalAmount.toLocaleString("vi-VN")}đ
        </Text>

        <Pressable
          style={[styles.saveButton, submitting && styles.disabledButton]}
          onPress={handleCreateFuel}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveText}>Lưu ghi nhận</Text>
          )}
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Lịch sử đổ nhiên liệu</Text>

      {fuelHistory.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Chưa có lịch sử nhiên liệu.</Text>
        </View>
      ) : (
        fuelHistory.map((item) => (
          <View key={item.id} style={styles.historyCard}>
            <View>
              <Text style={styles.historyTitle}>
                {item.quantityLiters} lít
              </Text>
              <Text style={styles.historySub}>
                {item.fuelDate?.replace("T", " ").slice(0, 16)}
              </Text>
              <Text style={styles.historySub}>
                HĐ: {item.invoiceNumber || "Không có"}
              </Text>
            </View>

            <Text style={styles.moneyText}>
              {item.totalAmount?.toLocaleString("vi-VN")}đ
            </Text>
          </View>
        ))
      )}
    </ScrollView>
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
  summaryCard: {
    backgroundColor: "#0F172A",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  summaryLabel: {
    color: "#CBD5E1",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 8,
  },
  summaryValue: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    marginBottom: 22,
  },
  cardTitle: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 16,
  },
  label: {
    color: "#334155",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },
  input: {
    height: 50,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    paddingHorizontal: 14,
    marginBottom: 14,
    color: "#0F172A",
  },
  totalText: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 16,
  },
  saveButton: {
    height: 52,
    borderRadius: 18,
    backgroundColor: "#F97316",
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  disabledButton: { opacity: 0.6 },
  sectionTitle: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    color: "#64748B",
    fontWeight: "600",
  },
  historyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  historyTitle: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "900",
  },
  historySub: {
    color: "#64748B",
    marginTop: 4,
    fontSize: 13,
    fontWeight: "600",
  },
  moneyText: {
    color: "#F97316",
    fontSize: 15,
    fontWeight: "900",
  },
});