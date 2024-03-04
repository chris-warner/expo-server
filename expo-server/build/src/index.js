import { analyze, guess } from 'web-audio-beat-detector';

// Alert to test the script loading
alert('test');

let audioContext;
let mediaRecorder;
let audioChunks = [];

function setupRecording(stream) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = event => {
        audioChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks);
        audioChunks = []; // Reset chunks for the next recording
        processAudioBlob(audioBlob);
    };

    startPeriodicRecording();
}

function processAudioBlob(audioBlob) {
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    // Optional: play the audio for verification
    audio.play();

    const reader = new FileReader();
    reader.readAsArrayBuffer(audioBlob);
    reader.onloadend = () => {
        const arrayBuffer = reader.result;
        audioContext.decodeAudioData(arrayBuffer).then(audioBuffer => {
            analyze(audioBuffer).then(tempo => {
                console.log('Detected BPM:', tempo);
                // Send the BPM back to the React Native component
                window.ReactNativeWebView.postMessage(tempo);
            }).catch(err => {
                console.error('Error analyzing the beat:', err);
            });
        });
    };
}

function startPeriodicRecording() {
    // Start the initial recording immediately without waiting for the first interval
    mediaRecorder.start();
    setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
        }
    }, 3000); // Record for 3 seconds

    // Subsequent recordings
    setInterval(() => {
        if (mediaRecorder.state !== 'recording') {
            audioChunks = []; // Clear previous audio chunks
            mediaRecorder.start();
            setTimeout(() => {
                if (mediaRecorder.state === 'recording') {
                    mediaRecorder.stop();
                }
            }, 5000); // Record for 3 seconds
        }
    }, 10000); // Run this every 10 seconds, providing enough gap for processing
}

function activateMicrophoneAndSetupRecording() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('getUserMedia not supported on your browser!');
    } else {
        navigator.mediaDevices.getUserMedia({ audio: true, video: false })
            .then(setupRecording)
            .catch(err => {
                console.error('The following error occurred: ' + err);
            });
    }
}

// Start the process
activateMicrophoneAndSetupRecording();
