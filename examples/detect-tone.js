var whistleDetection = require('../');

whistleDetection.addTrigger('Low', 20, 24, 5, false); //Trigger this one in a loop (repeating if its long)
whistleDetection.addTrigger('Med', 26, 35, 5); //Trigger these two once, if they are long
whistleDetection.addTrigger('High', 40, 50, 5);
whistleDetection.startMonitoring();

whistleDetection.on('tone', function(name) {
    console.log('A tone was triggered: ' + name);
});

