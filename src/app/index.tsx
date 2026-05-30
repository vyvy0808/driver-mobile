import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function Index() {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!token) {
    return <Redirect href="/auth/login" />;
  }

  return <Redirect href="/home" />;
}