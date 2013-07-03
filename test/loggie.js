'use strict';

var loggie = require('loggie');

var logger = loggie({
    level: '*'
});

logger.register({
    info: {
        template: 'Cortex {{cyan label}} {{items}}'
    },

    error: {
        template: 'Cortex {{bold|bg.red ERR}} {{arguments}}'
    }
});


var obj = {
    a: 1, 
    b: function(){},

    c: obj
}

logger.info('my label', obj);


try{
    b;
}catch(e){
    logger.error(e);
}

logger.warn('abcdefghijk sdfjsdlfkjs kjfksdfjds');

logger.debug('instance', 1, {a: 1}, obj)

logger.end();