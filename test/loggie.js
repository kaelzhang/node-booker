'use strict';

var loggie = require('loggie');

var logger = loggie({
    level: 'warn, error',
    use_exit: false,
    output: process.stdout,
    colors: ! ~ process.argv.indexOf('--clean')
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

logger.verbose(obj, 'abc')

logger.debug(obj, 'abc');

logger.warn(obj, 'abc');

logger.error(obj, '{{cyan abc}}');

logger.error( logger.template('{{cyan abc}}'), '{{magenta abc}}' );

// sdfsdf

// logger.warn('abcdefghijk sdfjsdlfkjs kjfksdfjds');

// logger.end();