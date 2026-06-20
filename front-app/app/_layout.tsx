import { Stack } from "expo-router";
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar 
        style="auto" 
        backgroundColor="#000000"
        hidden={false}
        translucent={false}
      />
      <Stack 
        screenOptions={{
          headerShown: false
        }}
      />
    </>
  )
}
