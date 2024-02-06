console.log('hi');
import { createRealTimeBpmProcessor } from 'realtime-bpm-analyzer';
console.log('hi');

// Function to display logs as list items
// Function to display logs as list items
// Function to display logs as list items
function displayLog(message) {
    const logList = document.getElementById('logList');
    const listItem = document.createElement('li');
    const pre = document.createElement('pre'); // Use <pre> tag to preserve whitespace
    pre.textContent = message;
    listItem.appendChild(pre);
    logList.appendChild(listItem);

    // Scroll to bottom
    logList.scrollTop = logList.scrollHeight;
}

// Redirect console.log to displayLog
const originalLog = console.log;
console.log = function(message) {
    originalLog.apply(console, arguments);
    displayLog(message);
};

// Redirect console.error to displayLog
const originalError = console.error;
console.error = function(message) {
    originalError.apply(console, arguments);
    displayLog('[ERROR] ' + message);
};

// Your existing code for setting up audio, etc.
console.log('hi');

// Function to set up audio input
async function setupAudio() {
    try {
        // Create an AudioContext instance
        const audioContext = new AudioContext();

        // Access the microphone
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // Create a MediaStreamAudioSourceNode from the microphone input stream
        const micNode = audioContext.createMediaStreamSource(stream);

        // Create a Real-Time BPM Analyzer
        const realtimeAnalyzerNode = await createRealTimeBpmProcessor(audioContext);

        // Connect the microphone node directly to the Real-Time BPM Analyzer
        micNode.connect(realtimeAnalyzerNode);
        micNode.connect(audioContext.destination); // Optionally connect to speakers

        // Event listener for receiving BPM messages
        realtimeAnalyzerNode.port.onmessage = (event) => {
            if (event.data.message === 'BPM' || event.data.message === 'BPM_STABLE') {
                const message = event.data.message + ': ' + JSON.stringify(event.data.result);
                console.log(message);
            }
        };
    } catch (error) {
        console.error('Error accessing microphone:', error);
    }
}

// Event listener to start audio setup on user gesture
document.addEventListener('click', function() {
    // Start setting up audio
    setupAudio();
}, { once: true }); // { once: true } ensures that the event listener is removed after it's been triggered once
