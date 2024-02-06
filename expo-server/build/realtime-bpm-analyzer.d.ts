import type { RealTimeBpmAnalyzerOptions, RealTimeBpmAnalyzerParameters, ValidPeaks, NextIndexPeaks, Threshold, PostMessageEventData } from './types';
/**
 * @class RealTimeBpmAnalyzer
 **/
export declare class RealTimeBpmAnalyzer {
    /**
     * Default configuration
     */
    options: RealTimeBpmAnalyzerOptions;
    /**
     * Minimum valid threshold, below this level result would be irrelevant.
     */
    minValidThreshold: Threshold;
    /**
     * Contain all valid peaks
     */
    validPeaks: ValidPeaks;
    /**
     * Next index (+10000 ...) to take care about peaks
     */
    nextIndexPeaks: NextIndexPeaks;
    /**
     * Number / Position of chunks
     */
    skipIndexes: number;
    effectiveBufferTime: number;
    /**
     * Computed values
     */
    computedStabilizationTimeInSeconds: number;
    /**
     * @constructor
     */
    constructor();
    /**
     * Method to apply a configuration on the fly
     * @param {RealTimeBpmAnalyzerParameters} parameters Object containing optional parameters
     * @returns {void}
     */
    setAsyncConfiguration(parameters: RealTimeBpmAnalyzerParameters): void;
    /**
     * Update the computed values
     * @returns {void}
     */
    updateComputedValues(): void;
    /**
     * Reset BPM computation properties to get a fresh start
     * @returns {void}
     */
    reset(): void;
    /**
     * Remve all validPeaks between the minThreshold pass in param to optimize the weight of datas
     * @param {Threshold} minThreshold Value between 0.9 and 0.2
     * @returns {void}
     */
    clearValidPeaks(minThreshold: Threshold): Promise<void>;
    /**
     * Attach this function to an audioprocess event on a audio/video node to compute BPM / Tempo in realtime
     * @param {Float32Array} channelData Channel data
     * @param {number} audioSampleRate Audio sample rate (44100)
     * @param {number} bufferSize Buffer size (4096)
     * @param {(data: PostMessageEventData) => void} postMessage Function to post a message to the processor node
     * @returns {Promise<void>}
     */
    analyzeChunck(channelData: Float32Array, audioSampleRate: number, bufferSize: number, postMessage: (data: PostMessageEventData) => void): Promise<void>;
    /**
     * Find the best threshold with enought peaks
     * @param {Float32Array} channelData Channel data
     * @param {number} bufferSize Buffer size
     * @param {number} currentMinIndex Current minimum index
     * @param {number} currentMaxIndex Current maximum index
     * @param {(data: PostMessageEventData) => void} postMessage Function to post a message to the processor node
     * @returns {void}
     */
    findPeaks(channelData: Float32Array, bufferSize: number, currentMinIndex: number, currentMaxIndex: number, postMessage: (data: PostMessageEventData) => void): Promise<void>;
}
