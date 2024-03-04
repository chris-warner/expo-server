import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import StaticServer from '@dr.pogodin/react-native-static-server';
import RNFS from 'react-native-fs';
import { WebView } from 'react-native-webview';
import { Audio } from 'expo-av';

export default function BPMDetector({ onBPMChange }) {
  const [serverUrl, setServerUrl] = useState("");
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [bpm, setBPM] = useState(0);
  const webViewRef = useRef(null);

  async function getPermissions() {
    try {
      if (permissionResponse.status !== "granted") {
        console.log("Requesting permission..");
        await requestPermission();
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
    } catch {
      console.log("Failed to get microphone permissions");
    }
  }

  useEffect(() => {
    let server = null;
    getPermissions();

    const startServer = async () => {
      const path = `${RNFS.MainBundlePath}/dist`;
      server = new StaticServer(9090, path, { localOnly: true });
      try {
        const url = await server.start();
        setServerUrl(url);
      } catch (error) {
        console.error("Failed to start server:", error);
      }
    };

    startServer();
    return () => server?.stop();
  }, []);

  if (!serverUrl) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const onMessage = (event) => {
    const message = event.nativeEvent.data;
    const bpmValue = parseInt(message);
    setBPM(bpmValue);
    // Invoke the callback function with the updated BPM value
    onBPMChange(bpmValue);
  };
  
  return (
    <View style={styles.container}>
        <WebView
          className=""
          source={{ uri: serverUrl }}
          ref={webViewRef}
          javaScriptEnabled={true}
          onMessage={onMessage}
        />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  WebView: {
    marginTop: 200,
  },
});
