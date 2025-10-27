import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import React from "react";
import { useRouter } from "expo-router";
import { AuthProvider, useAuth } from "../utils/authContext";
import { ActivityIndicator } from "react-native";
const RootNavLayout = () => {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isLoggedIn}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>

      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen name="index" />
        <Stack.Screen name="LogIn" />
        <Stack.Screen name="SignUp" />
      </Stack.Protected>
    </Stack>
  );
};

const _layout = () => {
  return (
    <AuthProvider>
      <RootNavLayout />
    </AuthProvider>
  );
};

export default _layout;

const styles = StyleSheet.create({});
