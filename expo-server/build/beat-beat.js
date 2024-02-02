var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var BeatBeat = /** @class */ (function () {
    function BeatBeat(context, name, filterFrequency, peakGain, threshold, sampleSkip, minAnimationTime) {
        if (filterFrequency === void 0) { filterFrequency = 100; }
        if (peakGain === void 0) { peakGain = 15; }
        if (threshold === void 0) { threshold = 0.8; }
        if (sampleSkip === void 0) { sampleSkip = 350; }
        if (minAnimationTime === void 0) { minAnimationTime = 0.4; }
        this.context = context;
        this.name = name;
        this.filterFrequency = filterFrequency;
        this.peakGain = peakGain;
        this.threshold = threshold;
        this.sampleSkip = sampleSkip;
        this.minAnimationTime = minAnimationTime;
        this.isPlaying = false;
        this.songData = [];
    }
    BeatBeat.prototype.load = function () {
        var _this = this;
        return new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
            var resp, file;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch(this.name)];
                    case 1:
                        resp = _a.sent();
                        return [4 /*yield*/, resp.arrayBuffer()];
                    case 2:
                        file = _a.sent();
                        this.context.decodeAudioData(file, function (buffer) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        this.buffer = buffer;
                                        return [4 /*yield*/, this.analyze()];
                                    case 1:
                                        _a.sent();
                                        resolve();
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        return [2 /*return*/];
                }
            });
        }); });
    };
    BeatBeat.prototype.play = function (cb) {
        this.isPlaying = true;
        var source = this.context.createBufferSource();
        source.buffer = this.buffer;
        source.connect(this.context.destination);
        source.start();
        this.animate(cb);
    };
    BeatBeat.prototype.analyze = function () {
        return __awaiter(this, void 0, void 0, function () {
            var source, filter, filter2, buffer, data, i, time, previousTime;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.offlineContext = new OfflineAudioContext(1, this.buffer.length, this.buffer.sampleRate);
                        source = this.offlineContext.createBufferSource();
                        source.buffer = this.buffer;
                        filter = this.offlineContext.createBiquadFilter();
                        filter.type = "bandpass";
                        filter.frequency.value = this.filterFrequency;
                        filter.Q.value = 1;
                        filter2 = this.offlineContext.createBiquadFilter();
                        filter2.type = "peaking";
                        filter2.frequency.value = this.filterFrequency;
                        filter2.Q.value = 1;
                        filter2.gain.value = this.peakGain;
                        source.connect(filter2);
                        filter2.connect(filter);
                        filter.connect(this.offlineContext.destination);
                        source.start();
                        return [4 /*yield*/, this.offlineContext.startRendering()];
                    case 1:
                        buffer = _a.sent();
                        data = buffer.getChannelData(0);
                        this.songData = [];
                        for (i = 0; i < data.length; ++i) {
                            if (data[i] > this.threshold) {
                                time = i / buffer.sampleRate;
                                previousTime = this.songData.length
                                    ? this.songData[this.songData.length - 1].time
                                    : 0;
                                if (time - previousTime > this.minAnimationTime) {
                                    this.songData.push({
                                        data: data[i],
                                        time: time
                                    });
                                }
                            }
                            i += this.sampleSkip;
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    BeatBeat.prototype.animate = function (cb) {
        var _this = this;
        this.songData.forEach(function (d, i) {
            var time = i === _this.songData.length - 1
                ? d.time
                : _this.songData[i + 1].time - d.time;
            setTimeout(function () { return cb(time); }, d.time * 1000);
        });
    };
    return BeatBeat;
}());
export default BeatBeat;
