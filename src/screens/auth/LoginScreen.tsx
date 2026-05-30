import { router } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function LoginScreen() {
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập tài khoản và mật khẩu.");
      return;
    }

    try {
      setSubmitting(true);

      await login({
        username: username.trim(),
        password: password.trim(),
      });

      router.replace("/home");
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản.";

      Alert.alert("Lỗi đăng nhập", message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerCard}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>DV</Text>
            </View>

            <Text style={styles.title}>DVTransport Mobile</Text>
            <Text style={styles.subtitle}>
              Đăng nhập để nhận chuyến, theo dõi lộ trình và cập nhật trạng thái
              vận chuyển.
            </Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Đăng nhập</Text>

            <Text style={styles.label}>Tên đăng nhập</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập username"
              placeholderTextColor="#94A3B8"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />

            <Text style={styles.label}>Mật khẩu</Text>
            <View style={styles.passwordBox}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Nhập mật khẩu"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />

              <Pressable onPress={() => setShowPassword(!showPassword)}>
                <Text style={styles.showText}>
                  {showPassword ? "Ẩn" : "Hiện"}
                </Text>
              </Pressable>
            </View>

            <Pressable
              style={[styles.loginButton, submitting && styles.disabledButton]}
              onPress={handleLogin}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.loginButtonText}>Đăng nhập</Text>
              )}
            </Pressable>

            <Pressable onPress={() => router.push("/auth/apply-job")}>
              <Text style={styles.applyText}>
                Chưa có tài khoản tài xế? Ứng tuyển ngay
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  headerCard: {
    marginBottom: 28,
  },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: "#F97316",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  logoText: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "800",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 10,
  },
  subtitle: {
    color: "#CBD5E1",
    fontSize: 15,
    lineHeight: 22,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 22,
  },
  formTitle: {
    color: "#0F172A",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 22,
  },
  label: {
    color: "#334155",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    paddingHorizontal: 16,
    color: "#0F172A",
    fontSize: 15,
    marginBottom: 16,
    backgroundColor: "#F8FAFC",
  },
  passwordBox: {
    height: 52,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 22,
    backgroundColor: "#F8FAFC",
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
    color: "#0F172A",
    fontSize: 15,
  },
  showText: {
    color: "#F97316",
    fontWeight: "700",
  },
  loginButton: {
    height: 54,
    borderRadius: 18,
    backgroundColor: "#F97316",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  disabledButton: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  applyText: {
    textAlign: "center",
    color: "#475569",
    fontWeight: "600",
  },
});