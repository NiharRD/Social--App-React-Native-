import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import React from "react";
import { useRouter } from "expo-router";
const _layout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="LogIn" />
      <Stack.Screen name="SignUp" />
    </Stack>
  );
};

export default _layout;

const styles = StyleSheet.create({});
