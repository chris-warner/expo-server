export * from './realtime-bpm-analyzer';
export { analyzeFullBuffer, getBiquadFilters } from './analyzer';
export * from './types';
/**
 * Create the RealTimeBpmProcessor needed to run the realtime strategy
 * @param {AudioContext} audioContext AudioContext instance
 * @returns {Promise<AudioWorkletNode>}
 * @public
 */
export declare function createRealTimeBpmProcessor(audioContext: AudioContext): Promise<AudioWorkletNode>;
