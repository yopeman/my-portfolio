import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>
      <Stack 
        screenOptions={{
          headerShown: false
        }}
      />
    </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}