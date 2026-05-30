import { Tabs } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabsLayout() {
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#F1F5F9", paddingTop: 8 }}
      edges={["top"]}
    >
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#F97316",
          tabBarInactiveTintColor: "#64748B",
          tabBarStyle: {
            height: 76,
            paddingBottom: 12,
            paddingTop: 8,
            backgroundColor: "#FFFFFF",
            borderTopColor: "#E2E8F0",
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "700",
          },
          tabBarItemStyle: {
            flex: 1,
          },
        }}
      >
        <Tabs.Screen name="home" options={{ title: "Home" }} />
        <Tabs.Screen name="tracking" options={{ title: "GPS" }} />
        <Tabs.Screen name="fuel" options={{ title: "Fuel" }} />
        <Tabs.Screen name="notification" options={{ title: "TB" }} />
        <Tabs.Screen name="profile" options={{ title: "Profile" }} />
      </Tabs>
    </SafeAreaView>
  );
}