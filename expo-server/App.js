import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import StaticServer from '@dr.pogodin/react-native-static-server';
import RNFS from 'react-native-fs';
import { WebView } from 'react-native-webview';

export default function App() {
  const [serverUrl, setServerUrl] = useState("");

  useEffect(() => {
    let server = null;

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
    console.log(serverUrl)
    return () => server?.stop();
  }, []);

  if (!serverUrl) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <StatusBar style="auto" />
      <WebView source={{ uri: serverUrl }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop:100,
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
