var sndpeek = require('sndpeek');
var events = require('events');
var _ = require('underscore');

var appOptions = {
    verbose: false,
    rolloffDiff: 2 //The difference between rolloff to be counted as a whistle
    //The higher, the fast, but less accurate.
};

var toneTriggers = [];

module.exports = new events.EventEmitter();

/**
 * Add a trigger for a specific tone.
 * @param name string
 * @param minTone int
 * @param maxTone int
 * @param minLength int
 * @param triggerOnce bool [optional]
 */
module.exports.addTrigger = function(name, minTone, maxTone, minLength, triggerOnce) {
    if (triggerOnce == undefined) {
        triggerOnce = true;
    }
    toneTriggers.push({
        name: name,
        minTone: minTone,
        maxTone: maxTone,
        minLength: minLength,
        triggerOnce: triggerOnce,
        count: 0
    });
};

/**
 * Start monitoring for whistles
 */
module.exports.startMonitoring = function() {
    sndpeek.startListening();
    sndpeek.on('data', handleSndpeekData);
};

module.exports.stopMonitoring = function() {
    sndpeek.removeListener('data', handleSndpeekData);
    sndpeek.stopListening();
}

function handleSndpeekData(data) {
    var high = data.rolloffHigh;
    var low = data.rolloffLow;
    var diff = high - low;
    if (diff <= appOptions.rolloffDiff && diff >= -appOptions.rolloffDiff) {
        var avgTone = (data.rolloffHigh + data.rolloffLow) / 2;
        if (appOptions.verbose) {
            console.log('Tone detected: ' + avgTone);
        }
        _.each(toneTriggers, function(toneTrigger) {
            if (avgTone >= toneTrigger.minTone && avgTone <= toneTrigger.maxTone) {
                //This whistle was detected, increase the count var
                toneTrigger.count++;
            } else {
                //Another whistle was detected. Remove this count.
                toneTrigger.count = 0;
            }
            if (toneTrigger.triggerOnce) {
                if (toneTrigger.count == toneTrigger.minLength) {
                    module.exports.emit('tone', toneTrigger.name);
                }
            } else {
                if (toneTrigger.count >= toneTrigger.minLength) {
                    module.exports.emit('tone', toneTrigger.name);
                    toneTrigger.count = 0;
                }
            }
        });
    }
}

function exitHandler() {
    module.exports.stopMonitoring();
}

process.on('exit', exitHandler);
process.on('SIGINT', exitHandler);
process.on('uncaughtException', exitHandler);