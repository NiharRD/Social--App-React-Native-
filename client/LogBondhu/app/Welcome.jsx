import { StyleSheet, Text, View, Button } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
const Welcome = () => {
  const router = useRouter();
  return (
    <View>
      <Button title="LogIn" onPress={() => router.navigate("/LogIn")} />
      <Button title="SignIn" onPress={() => router.navigate("/SignIn")} />
    </View>
  );
};

export default Welcome;

const styles = StyleSheet.create({});
