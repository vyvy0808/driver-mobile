import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { profileService } from "../../services/profileService";
import { DriverAssignment, DriverProfile } from "../../types/profile";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const [driver, setDriver] = useState<DriverProfile | null>(null);
  const [assignment, setAssignment] =
  useState<DriverAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProfile = async () => {
  if (!user) {
  setLoading(false);
  setRefreshing(false);
  return;
}

if (user.driverId === undefined || user.driverId === null) {
  setLoading(false);
  setRefreshing(false);
  return;

  }

  try {
    const driverData = await profileService.getDriverById(user.driverId);
const assignments =
  await profileService.getMyAssignment(user.driverId);

  setDriver(driverData);
setAssignment(
  assignments.length > 0
    ? assignments[0]
    : null
);


  } catch (error) {
    Alert.alert("Lỗi", "Không thể tải thông tin hồ sơ tài xế.");
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

  useEffect(() => {
    loadProfile();
  }, [user?.driverId]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadProfile();
  };

  const handleLogout = async () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/auth/login");
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#F97316" />
        <Text style={styles.loadingText}>Đang tải hồ sơ...</Text>
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
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {driver?.fullName?.charAt(0)?.toUpperCase() || "T"}
          </Text>
        </View>

        <Text style={styles.name}>{driver?.fullName || user?.fullName}</Text>

        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{driver?.status || "ACTIVE"}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Thông tin cá nhân</Text>
        <InfoRow label="Họ tên" value={driver?.fullName} />
        <InfoRow label="Số điện thoại" value={driver?.phone} />
        <InfoRow label="Email" value={driver?.email} />
        <InfoRow label="Địa chỉ" value={driver?.address} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Giấy phép lái xe</Text>
        <InfoRow label="Số GPLX" value={driver?.licenseNumber} />
        <InfoRow label="Ngày hết hạn" value={driver?.licenseExpiry} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Xe được phân công</Text>

        {assignment ? (
          <>
            <InfoRow label="Biển số xe" value={assignment.plateNumber} />
            <InfoRow label="Ngày phân công" value={assignment.assignedDate} />
            <InfoRow label="Trạng thái" value={assignment.status} />
          </>
        ) : (
          <Text style={styles.emptyText}>Chưa có xe được phân công.</Text>
        )}
      </View>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </Pressable>
    </ScrollView>
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
  content: { padding: 20, paddingBottom: 40 },
  center: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: { marginTop: 12, color: "#64748B", fontWeight: "600" },
  header: {
    backgroundColor: "#0F172A",
    borderRadius: 28,
    padding: 24,
    alignItems: "center",
    marginBottom: 18,
  },
  avatar: {
    width: 82,
    height: 82,
    borderRadius: 26,
    backgroundColor: "#F97316",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  avatarText: { color: "#FFFFFF", fontSize: 34, fontWeight: "900" },
  name: { color: "#FFFFFF", fontSize: 22, fontWeight: "800", marginBottom: 10 },
  statusBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusText: { color: "#166534", fontWeight: "800", fontSize: 12 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
  },
  cardTitle: {
    color: "#0F172A",
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 12,
  },
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
  emptyText: { color: "#64748B", fontSize: 14, fontWeight: "600" },
  logoutButton: {
    height: 54,
    borderRadius: 18,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  logoutText: { color: "#FFFFFF", fontWeight: "800", fontSize: 16 },
});