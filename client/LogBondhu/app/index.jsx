import { StyleSheet, Text, View, Button } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
const WelcomeScreen = () => {
  const router = useRouter();
  return (
    <View>
      <Button title="Sign In" onPress={() => router.navigate("/SignIn")} />
      <Button title="Log In" onPress={() => router.navigate("/LogIn")} />
    </View>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({});
