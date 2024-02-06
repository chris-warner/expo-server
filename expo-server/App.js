import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import StaticServer from '@dr.pogodin/react-native-static-server';
import RNFS from 'react-native-fs';
import { WebView } from 'react-native-webview';
import { Audio } from 'expo-av';

export default function App() {
  const [serverUrl, setServerUrl] = useState("");
  const [bpm, setBPM] = useState(0);
  const [stableBPM, setStableBPM] = useState(0);
  const webViewRef = useRef(null);

  useEffect(() => {
    let server = null;
    getPermissions();

    const startServer = async () => {
      const path = `${RNFS.MainBundlePath}/build`;
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

  async function getPermissions() {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to record audio was denied');
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
    } catch (error) {
      console.log('Failed to get microphone permissions:', error);
    }
  }

  var data;
  var bpmData;
  const onMessage = (event) => {
    try {
      data = JSON.parse(event.nativeEvent.data);
      console.log(JSON.parse(event.nativeEvent.data));
  
      // Accessing BPM data
      bpmData = data.data.bpm;
      console.log('BPM data:', bpmData);
      
      // // Accessing threshold value
      // const threshold = data.data.threshold;
      // console.log('Threshold value:', threshold);
  
      // Post back the raw data
      // window.ReactNativeWebView.postMessage(JSON.stringify(data));
      data = null;
      bpmData = null;
    } catch (error) {
      console.error('Error parsing data:', error);
    }
  };
  
  

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.innerContainer}>
        <Text style={{ color: 'black', fontSize: 18 }}>Stable BPM: {stableBPM}</Text>
        <Text style={{ color: 'black', fontSize: 18 }}>Calculated BPM: {bpm}</Text>
      </View>
      <WebView
        style={styles.webview}
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
  innerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
  },
  webview: {
    flex: 1,
  },
});
