'use strict';

var loggie = require('loggie');

var logger = loggie({
    level: '*',
    use_exit: false
});


var obj = {
    a: 1, 
    b: function(){},

    c: obj
}


// try{
//     b;
// }catch(e){
//     logger.error(e);
// }

// logger.log('abc: {{abc}}', {
//     abc: obj
// })

logger.debug('abc {{abc}}', {
    abc: obj
})

// sdfsdf

// logger.warn('abcdefghijk sdfjsdlfkjs kjfksdfjds');

logger.end();


var typo = require('typo');

process.stdout.write( typo.template('{{abc dfsdf}}') )