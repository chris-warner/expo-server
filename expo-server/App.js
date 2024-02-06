import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button } from 'react-native';
import { Audio } from "expo-av";
import * as FileSystem from 'expo-file-system';
import StaticServer from '@dr.pogodin/react-native-static-server';
import RNFS from 'react-native-fs';
import { WebView } from 'react-native-webview';

export default function App() {
  const [serverUrl, setServerUrl] = useState("");
  const [lastRecordingURI, setLastRecordingURI] = useState(null);
  const [currentRecording, setCurrentRecording] = useState(null);
  const [dataURI, setDataURI] = useState(null); // New state for the data URI
  let server = null;
  let path;

  useEffect(() => {
    const startServer = async () => {
      // Define the path to the build folder we are bundling in the app
      path = `${RNFS.MainBundlePath}/build`;
      server = new StaticServer(9090, path, { localOnly: true });
      // Start the server
      try {
        const url = await server.start();
        setServerUrl(url);
      } catch (error) {
        console.log('Failed to start server:', error);
      }
    };
    startServer();
    return () => server?.stop();
  }, []);

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

  return (
    <View style={styles.container}>
      <Text>Last recorded sample URI: {lastRecordingURI}</Text>
      <Text>Recording every 5 seconds...</Text>
      <Button
        title="Stop Recording"
        onPress={() => stopRecording(currentRecording)}
        disabled={!currentRecording}
      />
      <View style={styles.webViewContainer}>
        {dataURI && (
          <WebView
            source={{
              html: `
                <!DOCTYPE html>
                <html>
                  <head>
                    <title>Audio Player</title>
                  </head>
                  <body><p>${lastRecordingURI}</p>
                    <audio controls>
                      <source src="${dataURI}" type="audio/mpeg">
                      Your browser does not support the audio element.
                    </audio>
                  </body>
                </html>
              `,
            }}
            style={styles.webView}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ecf0f1',
    padding: 10,
  },
  webViewContainer: {
    position: 'absolute',
    top: 100, // Adjust this value as needed
    left: 0,
    right: 0,
    bottom: 0,
    height: 100
  },
  webView: {
    flex: 1,
  },
});
