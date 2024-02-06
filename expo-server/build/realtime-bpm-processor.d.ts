declare module "src/consts" {
    export const realtimeBpmProcessorName = "realtime-bpm-processor";
    export const startThreshold = 0.95;
    export const minValidThreshold = 0.2;
    export const minPeaks = 15;
    export const thresholdStep = 0.05;
    export const skipForwardIndexes = 10000;
    export const offlineLowPassFrequencyValue = 150;
    export const offlineLowPassQualityValue = 1;
    export const offlineHighPassFrequencyValue = 100;
    export const offlineHighPassQualityValue = 1;
}
declare module "src/types" {
    export type Threshold = number;
    export type Peaks = number[];
    export type PeaksAndThreshold = {
        peaks: Peaks;
        threshold: Threshold;
    };
    export type BpmCandidates = {
        bpm: Tempo[];
        threshold: Threshold;
    };
    /**
     * Events
     */
    export type AnalyzeChunkEventData = {
        message: 'ANALYZE_CHUNK';
        data: Float32Array;
    };
    export type AnalyzeChunkEvent = {
        data: AnalyzeChunkEventData;
    };
    export type ValidPeakEventData = {
        message: 'VALID_PEAK';
        data: {
            threshold: number;
            index: number;
        };
    };
    export type ValidPeakEvent = {
        data: ValidPeakEventData;
    };
    export type BpmEventData = {
        message: 'BPM' | 'BPM_STABLE';
        result: BpmCandidates;
    };
    export type BpmEvent = {
        data: BpmEventData;
    };
    export type AsyncConfigurationEventData = {
        message: 'ASYNC_CONFIGURATION';
        parameters: RealTimeBpmAnalyzerParameters;
    };
    export type AnalyzerResetedEvent = {
        data: AnalyzerResetedEventData;
    };
    export type AnalyzerResetedEventData = {
        message: 'ANALYZER_RESETED';
    };
    export type ResetEventData = {
        message: 'RESET';
    };
    export type StopEventData = {
        message: 'STOP';
    };
    export type AsyncConfigurationEvent = {
        data: AsyncConfigurationEventData | ResetEventData | StopEventData;
    };
    export type PostMessageEventData = BpmEventData | AnalyzerResetedEventData | AnalyzeChunkEventData | ValidPeakEventData;
    /**
     * Analyzer Types
     */
    export type Interval = {
        interval: number;
        count: number;
    };
    export type Group = {
        tempo: number;
        count: number;
    };
    export type Tempo = {
        tempo: number;
        count: number;
        confidence: number;
    };
    export type RealTimeBpmAnalyzerParameters = {
        continuousAnalysis?: boolean;
        stabilizationTime?: number;
        muteTimeInIndexes?: number;
        debug?: boolean;
    };
    export type RealTimeBpmAnalyzerOptions = {
        continuousAnalysis: boolean;
        stabilizationTime: number;
        muteTimeInIndexes: number;
        debug: boolean;
    };
    export type ValidPeaks = Record<string, Peaks>;
    export type NextIndexPeaks = Record<string, number>;
    export type OnThresholdFunction = (threshold: Threshold) => Promise<boolean>;
    export type AggregateData = {
        isBufferFull: boolean;
        buffer: Float32Array;
        bufferSize: number;
    };
    export type NormalizedFilters = {
        lowpass: BiquadFilterNode;
        highpass: BiquadFilterNode;
    };
}
declare module "src/utils" {
    import type { ValidPeaks, NextIndexPeaks, OnThresholdFunction, AggregateData } from "src/types";
    /**
     * Loop between .9 and minValidThreshold at .2 by default, passing the threshold to the function
     * @param {OnThresholdFunction} onThreshold Function for each iteration, you must return a boolean, true will exit the loop process
     * @param {number} minValidThreshold minValidThreshold usualy 0.2
     * @param {number} startThreshold startThreshold usualy 0.9
     * @param {number} thresholdStep thresholdStep usuably 0.05
     * @return {Promise<void>}
     */
    export function descendingOverThresholds(onThreshold: OnThresholdFunction, minValidThreshold?: number, startThreshold?: number, thresholdStep?: number): Promise<void>;
    /**
     * Generate an object with keys as thresholds and will containes validPeaks
     * @param {number} minValidThreshold minValidThreshold usualy 0.2
     * @param {number} startThreshold startThreshold usualy 0.9
     * @param {number} thresholdStep thresholdStep usuably 0.05
     * @return {ValidPeaks} Collection of validPeaks by thresholds
     */
    export function generateValidPeaksModel(minValidThreshold?: number, startThreshold?: number, thresholdStep?: number): ValidPeaks;
    /**
     * Generate an object with keys as thresholds and will containes NextIndexPeaks
     * @return {NextIndexPeaks} Collection of NextIndexPeaks by thresholds
     */
    export function generateNextIndexPeaksModel(minValidThreshold?: number, startThreshold?: number, thresholdStep?: number): NextIndexPeaks;
    export function chunckAggregator(): (pcmData: Float32Array) => AggregateData;
}
declare module "src/analyzer" {
    import type { Peaks, ValidPeaks, PeaksAndThreshold, BpmCandidates, Interval, Tempo, Threshold, NormalizedFilters } from "src/types";
    /**
     * Find peaks when the signal if greater than the threshold, then move 10_000 indexes (represents ~0.23s) to ignore the descending phase of the parabol
     * @param {Float32Array} data Buffer channel data
     * @param {number} threshold Threshold for qualifying as a peak
     * @param {number} offset Position where we start to loop
     * @param {number} skipForwardIndexes Numbers of index to skip when a peak is detected
     * @return {PeaksAndThreshold} Peaks found that are greater than the threshold
     */
    export function findPeaksAtThreshold(data: Float32Array, threshold: Threshold, offset?: number, skipForwardIndexes?: number): PeaksAndThreshold;
    /**
     * Find the minimum amount of peaks from top to bottom threshold, it's necessary to analyze at least 10seconds at 90bpm
     * @param {Float32Array} channelData Channel data
     * @returns {Promise<PeaksAndThreshold>} Suffisent amount of peaks in order to continue further the process
     */
    export function findPeaks(channelData: Float32Array): Promise<PeaksAndThreshold>;
    /**
     * Helpfull function to create standard and shared lowpass and highpass filters
     * Important Note: The original library wasn't using properly the lowpass filter and it was not applied at all. This method should not be used unitl more research and documented tests will be acheived.
     * @param {AudioContext | OfflineAudioContext} context AudioContext instance
     * @returns {NormalizedFilters} Normalized biquad filters
     */
    export function getBiquadFilters(context: AudioContext | OfflineAudioContext): NormalizedFilters;
    /**
     * Apply to the source a biquad lowpass filter
     * @param {AudioBuffer} buffer Audio buffer
     * @returns {AudioBufferSourceNode}
     */
    /**
     * Return the computed bpm from data
     * @param {Record<string, number[]>} data Contain valid peaks
     * @param {number} audioSampleRate Audio sample rate
     */
    export function computeBpm(data: ValidPeaks, audioSampleRate: number): Promise<BpmCandidates>;
    /**
     * Sort results by count and return top candidate
     * @param {Tempo[]} candidates (BPMs) with count
     * @param {number} length Amount of returned candidates (default: 5)
     * @return {Tempo[]} Returns the 5 top candidates with highest counts
     */
    export function getTopCandidates(candidates: Tempo[], length?: number): Tempo[];
    /**
     * Gets the top candidate from the array
     * @param {Tempo[]} candidates - (BPMs) with counts.
     * @returns {number} - Returns the top candidate with the highest count.
     */
    export function getTopCandidate(candidates: Tempo[]): number;
    /**
     * Identify intervals between bass peaks
     * @param {array} peaks Array of qualified bass peaks
     * @return {array} Return a collection of intervals between peaks
     */
    export function identifyIntervals(peaks: Peaks): Interval[];
    /**
     * Figure out best possible tempo candidates
     * @param  {number} audioSampleRate Audio sample rate
     * @param  {Interval[]} intervalCounts List of identified intervals
     * @return {Tempo[]} Intervals grouped with similar values
     */
    export function groupByTempo(audioSampleRate: number, intervalCounts: Interval[]): Tempo[];
    /**
     * Function to detect the BPM from an AudioBuffer (which can be a whole file)
     * It is the fastest way to detect the BPM
     * @param {AudioBuffer} buffer AudioBuffer
     * @returns {Promise<Tempo[]>} Returns the 5 bests candidates
     */
    export function analyzeFullBuffer(buffer: AudioBuffer): Promise<Tempo[]>;
}
declare module "src/realtime-bpm-analyzer" {
    import type { RealTimeBpmAnalyzerOptions, RealTimeBpmAnalyzerParameters, ValidPeaks, NextIndexPeaks, Threshold, PostMessageEventData } from "src/types";
    /**
     * @class RealTimeBpmAnalyzer
     **/
    export class RealTimeBpmAnalyzer {
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
}
declare module "processor/realtime-bpm-processor" {
    import { RealTimeBpmAnalyzer } from "src/realtime-bpm-analyzer";
    import type { AsyncConfigurationEvent, AggregateData } from "src/types";
    interface AudioWorkletProcessor {
        readonly port: MessagePort;
    }
    var AudioWorkletProcessor: {
        prototype: AudioWorkletProcessor;
        new (): AudioWorkletProcessor;
    };
    /**
     * @class RealTimeBpmProcessor
     * @extends AudioWorkletProcessor
     **/
    export class RealTimeBpmProcessor extends AudioWorkletProcessor {
        aggregate: (pcmData: Float32Array) => AggregateData;
        realTimeBpmAnalyzer: RealTimeBpmAnalyzer;
        stopped: boolean;
        constructor();
        /**
         * Handle message event
         * @param {object} event Contain event data from main process
         * @returns {void}
         */
        onMessage(event: AsyncConfigurationEvent): void;
        /**
         * Process function to handle chunks of data
         * @param {Float32Array[][]} inputs Inputs (the data we need to process)
         * @param {Float32Array[][]} _outputs Outputs (not useful for now)
         * @param {Record<string, Float32Array>} _parameters Parameters
         * @returns {boolean} Process ended successfully
         */
        process(inputs: Float32Array[][], _outputs: Float32Array[][], _parameters: Record<string, Float32Array>): boolean;
    }
    const _default: {};
    export default _default;
}
