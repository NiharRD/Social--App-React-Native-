import { StyleSheet, Text, View } from "react-native";

import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
const PostDetails = () => {
  const { id } = useLocalSearchParams();
  const [post, setPost] = useState(null);
  return (
    <View>
      <Text>{id}</Text>
    </View>
  );
};

export default PostDetails;

const styles = StyleSheet.create({});
