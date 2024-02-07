import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import StaticServer from '@dr.pogodin/react-native-static-server';
import RNFS from 'react-native-fs';
import { WebView } from 'react-native-webview';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';


export default function App() {
  const [serverUrl, setServerUrl] = useState("");
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  // const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBPM] = useState(0);
  const [lastRecordingURI, setLastRecordingURI] = useState(null);
  const [currentRecording, setCurrentRecording] = useState(null);
  const [dataURI, setDataURI] = useState(null); // New state for the data URI

  const webViewRef = useRef(null);

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

  async function startRecording() {
    try {
      // Delete previous recording file
      if (lastRecordingURI) {
        await FileSystem.deleteAsync(lastRecordingURI);
        console.log('Previous recording file deleted successfully');
      }

      console.log('Requesting permissions..');
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      console.log('Starting recording..');
      const newRecording = new Audio.Recording(); // Create a new recording object
      await newRecording.prepareToRecordAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      await newRecording.startAsync();
      console.log('Recording started');
      return newRecording; // Return the new recording object
    } catch (err) {
      console.error('Failed to start recording', err);
      return null;
    }
  }

  async function stopRecording(recording) {
    try {
      console.log('Stopping recording..');
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log('Recording stopped and stored at', uri);
      setLastRecordingURI(uri); // Store the URI of the last recorded sample
      injectAudioPath(uri); // Call injectAudioPath with the new URI
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  }

  useEffect(() => {
    const intervalId = setInterval(async () => {
      if (currentRecording) {
        await stopRecording(currentRecording);
      }
      const newRecording = await startRecording();
      setCurrentRecording(newRecording);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [currentRecording]);

  // Fetch the data URI when lastRecordingURI changes
  useEffect(() => {
    const fetchDataURI = async () => {
      if (lastRecordingURI) {
        const base64Data = await FileSystem.readAsStringAsync(lastRecordingURI, { encoding: FileSystem.EncodingType.Base64 });
        const dataURI = `data:audio/mpeg;base64,${base64Data}`;
        setDataURI(dataURI);
      }
    };
    fetchDataURI();
  }, [lastRecordingURI]);

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
    } else if (dataPayload === 'ContentUpdated') {
      // Reload the WebView after receiving 'ContentUpdated' message
      setTimeout(() => {
        webViewRef.current.reload(); // Reload the WebView after a short delay
      }, 500); // Adjust the delay as needed
    } else {
      console.log('Unhandled data payload:', dataPayload);
    }
  } catch (e) {
    console.error('Error parsing data:', e);
  }
};


const injectAudioPath = (uri) => {
  let elementText; // Declare elementText variable with let
  const injectScript = `
    console.log('injecting javascript into webview');
    elementText = document.getElementById('uriText'); // Assign value to elementText
    if (elementText) {
      elementText.innerHTML = '${uri}';
    } else {
      console.warn('Element with id "uri" not found.');
    }
  `;
  try {
    webViewRef.current.injectJavaScript(injectScript);
  } catch (error) {
    console.error('Error injecting JavaScript:', error);
  } finally {
    // Optionally, dispose of the variable after use
    elementText = null; // Set elementText to null to dispose of it
  }
};


  
  // Modify the WebView component
  <WebView
    className=""
    style={styles.webview}
    source={{ uri: serverUrl }}
    ref={webViewRef}
    javaScriptEnabled={true}
    onMessage={(event) => {
      if (event.nativeEvent.data === 'ContentUpdated') {
        setTimeout(() => {
          webViewRef.current.reload(); // Reload the WebView after a short delay
        }, 500); // Adjust the delay as needed
      }
    }}
    injectedJavaScriptBeforeContentLoaded={debugging + jsCode +  '; true'}
  />
  
  

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.innerContainer}>

        <Text style={{ color: 'black', fontSize: 18 }}>Calculate BPM: {bpm}</Text>
        {/* <Button title={isPlaying ? 'Pause' : 'Play'} onPress={() => playFunctionInWebView()} /> */}
        <Text className="text-center text-lg ">BPM is updated every 5 seconds, can be changed in index.html</Text>
        <Text>Last recorded sample URI: {lastRecordingURI}</Text>
      <Text>Recording every 5 seconds...</Text>
      <Button
        title="Stop Recording"
        onPress={() => stopRecording(currentRecording)}
        disabled={!currentRecording}
      />
      </View>
      <WebView
        className=""
        style={styles.webview}
        source={{ uri: serverUrl }}
        ref={webViewRef}
        javaScriptEnabled={true}
        onMessage={onMessage}
        injectedJavaScriptBeforeContentLoaded={debugging + jsCode +  '; true'}
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
