'use strict';

var loggie = require('loggie');

var logger = loggie({
    level: 'debug',
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

logger.verbose('abc {{abc}}', {
    abc: obj
})

// sdfsdf

// logger.warn('abcdefghijk sdfjsdlfkjs kjfksdfjds');

logger.end();