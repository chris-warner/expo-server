import type { ValidPeaks, NextIndexPeaks, OnThresholdFunction, AggregateData } from './types';
/**
 * Loop between .9 and minValidThreshold at .2 by default, passing the threshold to the function
 * @param {OnThresholdFunction} onThreshold Function for each iteration, you must return a boolean, true will exit the loop process
 * @param {number} minValidThreshold minValidThreshold usualy 0.2
 * @param {number} startThreshold startThreshold usualy 0.9
 * @param {number} thresholdStep thresholdStep usuably 0.05
 * @return {Promise<void>}
 */
export declare function descendingOverThresholds(onThreshold: OnThresholdFunction, minValidThreshold?: number, startThreshold?: number, thresholdStep?: number): Promise<void>;
/**
 * Generate an object with keys as thresholds and will containes validPeaks
 * @param {number} minValidThreshold minValidThreshold usualy 0.2
 * @param {number} startThreshold startThreshold usualy 0.9
 * @param {number} thresholdStep thresholdStep usuably 0.05
 * @return {ValidPeaks} Collection of validPeaks by thresholds
 */
export declare function generateValidPeaksModel(minValidThreshold?: number, startThreshold?: number, thresholdStep?: number): ValidPeaks;
/**
 * Generate an object with keys as thresholds and will containes NextIndexPeaks
 * @return {NextIndexPeaks} Collection of NextIndexPeaks by thresholds
 */
export declare function generateNextIndexPeaksModel(minValidThreshold?: number, startThreshold?: number, thresholdStep?: number): NextIndexPeaks;
export declare function chunckAggregator(): (pcmData: Float32Array) => AggregateData;
