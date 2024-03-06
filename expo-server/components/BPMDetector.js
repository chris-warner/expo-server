import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import StaticServer from '@dr.pogodin/react-native-static-server';
import RNFS from 'react-native-fs';
import { WebView } from 'react-native-webview';
import { Audio } from 'expo-av';

const ASSETS_FOLDER_NAME = 'dist';
let DOCUMENT_FOLDER_PATH;

if (Platform.OS === 'android') {
  DOCUMENT_FOLDER_PATH = `${RNFS.DocumentDirectoryPath}/${ASSETS_FOLDER_NAME}`;
} else {
  DOCUMENT_FOLDER_PATH = `${RNFS.MainBundlePath}/dist`;
  console.log('ios')
}

const useStaticServer = (folderWasCreated) => {
  const [url, setUrl] = useState('');
  useEffect(() => {
    let server = null;

    const startServer = async () => {
      // Use the globally accessible DOCUMENT_FOLDER_PATH
      server = new StaticServer(9090, DOCUMENT_FOLDER_PATH, { localOnly: true });
      try {
        const url = await server.start();
        setUrl(url);
        console.log(url);
      } catch (error) {
        console.error("Failed to start server:", error);
      }
    };

   
      startServer();
    
    return () => server?.stop();
  }, [folderWasCreated]);

  return url;
};
const logFilesInDirectory = async (directoryPath) => {
  try {
    const files = await RNFS.readdir(directoryPath); // Lists all files and directories at the given path
    console.log('Files in directory:', directoryPath);
    files.forEach((file) => {
      console.log(file);
    });
  } catch (error) {
    console.error('Error listing files in directory:', directoryPath, error);
  }
};

export default function BPMDetector({ onBPMChange }) {
  const ASSETS_FOLDER_NAME = 'dist';
  const DOCUMENT_FOLDER_PATH = `${RNFS.DocumentDirectoryPath}/${ASSETS_FOLDER_NAME}`;
  const [folderWasCreated, setFolderWasCreated] = useState(false);
  const url = useStaticServer(folderWasCreated);
  const [serverUrl, setServerUrl] = useState("");
  const [bpm, setBPM] = useState(0);
  const webViewRef = useRef(null);

  // Request audio recording permissions
  const [permissionResponse, requestPermission] = Audio.usePermissions();

  // Function to get audio recording permissions
  const getPermissions = async () => {
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
  };

  useEffect(() => {
    // Call getPermissions when the component mounts
    getPermissions();

// Inside your useEffect hook or any function
if (Platform.OS === 'android') {
  // This code will only run on Android devices
  copyAssetsFolderContents(ASSETS_FOLDER_NAME, DOCUMENT_FOLDER_PATH)
    .then(() => {
      console.log('Build folder contents copied successfully.');
      setFolderWasCreated(true);
      logFilesInDirectory(DOCUMENT_FOLDER_PATH); // Log files after copying
    })
    .catch(error => {
      console.error('Error copying build folder contents:', error);
    });
}
  }, []);

  // Update serverUrl when URL from useStaticServer hook changes
  useEffect(() => {
    if (url) {
      setServerUrl(url);
    }
  }, [url]);

  // Function to copy assets folder contents
  const copyAssetsFolderContents = async (sourcePath, targetPath) => {
    try {
      const items = await RNFS.readDirAssets(sourcePath);
      const targetExists = await RNFS.exists(targetPath);
      if (!targetExists) {
        await RNFS.mkdir(targetPath);
      }

      for (const item of items) {
        const sourceItemPath = `${sourcePath}/${item.name}`;
        const targetItemPath = `${targetPath}/${item.name}`;

        if (item.isDirectory()) {
          await copyAssetsFolderContents(sourceItemPath, targetItemPath);
        } else {
          await RNFS.copyFileAssets(sourceItemPath, targetItemPath);
        }
      }
    } catch (error) {
      console.error('Failed to copy assets folder contents:', error);
      throw error;
    }
  };

  // Function to handle WebView message event
  const onMessage = (event) => {
    const message = event.nativeEvent.data;
    const bpmValue = parseInt(message);
    setBPM(bpmValue);
    // Invoke the callback function with the updated BPM value
    onBPMChange(bpmValue);
  };

  // If serverUrl is not yet available, render loading message
  if (!serverUrl) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Render WebView with specified source and event handler
  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: serverUrl }}
        ref={webViewRef}
        javaScriptEnabled={true}
        onMessage={onMessage}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView error: ', nativeEvent);
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('HTTP error: ', nativeEvent.statusCode);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});