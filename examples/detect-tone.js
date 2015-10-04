var whistleDetection = require('../');

whistleDetection.addTrigger('Low', 20, 24, 5);
whistleDetection.addTrigger('Med', 26, 35, 5);
whistleDetection.addTrigger('High', 40, 50, 5);
whistleDetection.startMonitoring();

whistleDetection.on('tone', function(name) {
    console.log('A tone was triggered: ' + name);
});

