import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { useRouter } from "expo-router";
const _layout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: true }} />
      <Stack.Screen name="SignIn" options={{ headerShown: true }} />
      <Stack.Screen name="LogIn" options={{ headerShown: true }} />
    </Stack>
  );
};

export default _layout;

const styles = StyleSheet.create({});
