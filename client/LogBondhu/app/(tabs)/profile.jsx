import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../utils/authContext";
import axios from "axios";
const profile = () => {
  const { token, userData } = useAuth();

  return (
    <View>
      <Text>profile</Text>
      <Text>{userData.userName}</Text>
      <Text>{userData.emailId}</Text>
      <Text>{userData.phoneNo}</Text>
      <Text>{userData.gender}</Text>
      <Text>{userData.dob}</Text>
      <Text>{userData.profilePic}</Text>
      <Text>{userData.followers.length}</Text>
      <Text>{userData.following.length}</Text>
    </View>
  );
};

export default profile;

const styles = StyleSheet.create({});
