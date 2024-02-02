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

  const jsCode = "setTimeout(function() {document.getElementById('js-pjax-loader-bar');}, 2000)";


  const onMessage = (event) => {
    let dataPayload;
    try {
      dataPayload = JSON.parse(event.nativeEvent.data);
    } catch (e) {}
    if (dataPayload) {
      if (dataPayload.type === 'Console') {
        console.info(`[Console] ${JSON.stringify(dataPayload.data)}`);
      } else {
        console.log(dataPayload);
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <WebView source={{ uri: serverUrl }}
              setAllowFileAccessFromFileURLs={true}
              setAllowUniversalAccessFromFileURLs={true}
              scalesPageToFit={true}
              javaScriptEnabled={true}  
              originWhitelist={['*']}
              onMessage={onMessage}
              injectedJavaScriptBeforeContentLoaded={debugging + jsCode} // Inject JavaScript content
               />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 0,
    margin: 0,
    flex: 1,
  },
});
