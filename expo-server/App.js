import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { StyleSheet, Text, View, Button } from "react-native";
import BPMDetector from "./components/BPMDetector";

export default function App() {
  // State to hold the BPM value received from BPMDetector
  const [bpmValue, setBpmValue] = useState(0);

  // Callback function to receive the updated BPM value from BPMDetector
  const handleBPMChange = (bpm) => {
    setBpmValue(bpm);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.innerContainer}>
        <Text style={{ color: "black", fontSize: 18 }}>
          Calculate BPM: {bpmValue}
        </Text>
        <BPMDetector onBPMChange={handleBPMChange} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 120,
  },
});
