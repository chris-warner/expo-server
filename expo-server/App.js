import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import StaticServer from '@dr.pogodin/react-native-static-server';
import RNFS from 'react-native-fs';
import { WebView } from 'react-native-webview';
import { Audio } from 'expo-av';

export default function App() {
  const [serverUrl, setServerUrl] = useState("");
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBPM] = useState(0);

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
      if (permissionResponse.status !== 'granted') {
        console.log('Requesting permission..');
        await requestPermission();
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
    } catch {
      console.log('Failed to get microphone permissions');
    }
  }

  const debugging = `
    const consoleLog = (type, log) => window.ReactNativeWebView.postMessage(JSON.stringify({'type': 'Console', 'data': {'type': type, 'log': log}}));
    console = {
        log: (log) => consoleLog('log', log),
        debug: (log) => consoleLog('debug', log),
        info: (log) => consoleLog('info', log),
        warn: (log) => consoleLog('warn', log),
        error: (log) => consoleLog('error', log),
    };
  `;

  const jsCode = `
  window.postMessage = function(data) {
    if (typeof data === 'number') {
      console.log('Received BPM:', data);
      // Handle the BPM data as needed, for example, update your React Native state
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'BPM', data: { bpm: data } }));
    } else {
      console.warn('Received unexpected data type:', typeof data);
    }
  };

  document.addEventListener("message", function(event) {
    var dataPayload;
    try {
      dataPayload = JSON.parse(event.nativeEvent.data);
    } catch (e) { }
    if (dataPayload && dataPayload.type === 'BPM') {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'BPM', data: { bpm: dataPayload.data.bpm } }));
    }
  });
`;



  const onMessage = (event) => {
    console.log('Received message:', event.nativeEvent.data); // Log the raw data

    try {
      const dataPayload = JSON.parse(event.nativeEvent.data);
      console.log('Parsed data:', dataPayload); // Log the parsed data

      if (dataPayload.type === 'Console') {
        console.info(`[Console] ${JSON.stringify(dataPayload.data)}`);
      } else if (dataPayload.type === 'BPM') {
        setBPM(dataPayload.data.bpm);
      } else {
        console.log('Unhandled data payload:', dataPayload);
      }
    } catch (e) {
      console.error('Error parsing data:', e);
    }
  };

  const playFunctionInWebView = () => {
    const injectScript = `
      (function() {
        window.analyzeAudio();
      })();
      true;
    `;
    webViewRef.current.injectJavaScript(injectScript);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.innerContainer}>
        <Text style={{ color: 'black', fontSize: 18 }}>Calculate BPM: {bpm}</Text>
        <Button title={isPlaying ? 'Pause' : 'Play'} onPress={() => playFunctionInWebView()} />
      </View>
      <WebView
        className="hidden"
        style={styles.webview}
        source={{ uri: serverUrl }}
        ref={webViewRef}
        javaScriptEnabled={true}
        onMessage={onMessage}
        injectedJavaScriptBeforeContentLoaded={debugging + jsCode + '; true'}
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
