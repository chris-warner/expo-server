import type { Peaks, ValidPeaks, PeaksAndThreshold, BpmCandidates, Interval, Tempo, Threshold, NormalizedFilters } from './types';
/**
 * Find peaks when the signal if greater than the threshold, then move 10_000 indexes (represents ~0.23s) to ignore the descending phase of the parabol
 * @param {Float32Array} data Buffer channel data
 * @param {number} threshold Threshold for qualifying as a peak
 * @param {number} offset Position where we start to loop
 * @param {number} skipForwardIndexes Numbers of index to skip when a peak is detected
 * @return {PeaksAndThreshold} Peaks found that are greater than the threshold
 */
export declare function findPeaksAtThreshold(data: Float32Array, threshold: Threshold, offset?: number, skipForwardIndexes?: number): PeaksAndThreshold;
/**
 * Find the minimum amount of peaks from top to bottom threshold, it's necessary to analyze at least 10seconds at 90bpm
 * @param {Float32Array} channelData Channel data
 * @returns {Promise<PeaksAndThreshold>} Suffisent amount of peaks in order to continue further the process
 */
export declare function findPeaks(channelData: Float32Array): Promise<PeaksAndThreshold>;
/**
 * Helpfull function to create standard and shared lowpass and highpass filters
 * Important Note: The original library wasn't using properly the lowpass filter and it was not applied at all. This method should not be used unitl more research and documented tests will be acheived.
 * @param {AudioContext | OfflineAudioContext} context AudioContext instance
 * @returns {NormalizedFilters} Normalized biquad filters
 */
export declare function getBiquadFilters(context: AudioContext | OfflineAudioContext): NormalizedFilters;
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
export declare function computeBpm(data: ValidPeaks, audioSampleRate: number): Promise<BpmCandidates>;
/**
 * Sort results by count and return top candidate
 * @param {Tempo[]} candidates (BPMs) with count
 * @param {number} length Amount of returned candidates (default: 5)
 * @return {Tempo[]} Returns the 5 top candidates with highest counts
 */
export declare function getTopCandidates(candidates: Tempo[], length?: number): Tempo[];
/**
 * Gets the top candidate from the array
 * @param {Tempo[]} candidates - (BPMs) with counts.
 * @returns {number} - Returns the top candidate with the highest count.
 */
export declare function getTopCandidate(candidates: Tempo[]): number;
/**
 * Identify intervals between bass peaks
 * @param {array} peaks Array of qualified bass peaks
 * @return {array} Return a collection of intervals between peaks
 */
export declare function identifyIntervals(peaks: Peaks): Interval[];
/**
 * Figure out best possible tempo candidates
 * @param  {number} audioSampleRate Audio sample rate
 * @param  {Interval[]} intervalCounts List of identified intervals
 * @return {Tempo[]} Intervals grouped with similar values
 */
export declare function groupByTempo(audioSampleRate: number, intervalCounts: Interval[]): Tempo[];
/**
 * Function to detect the BPM from an AudioBuffer (which can be a whole file)
 * It is the fastest way to detect the BPM
 * @param {AudioBuffer} buffer AudioBuffer
 * @returns {Promise<Tempo[]>} Returns the 5 bests candidates
 */
export declare function analyzeFullBuffer(buffer: AudioBuffer): Promise<Tempo[]>;
