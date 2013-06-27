'use strict';

try {
    abc;
} catch(e) {
    for(var key in e){
        console.log(key, e[key]);
    }

    console.log(e.name);
    console.log(e.message);
    console.log(e instanceof Error)
    console.log(e instanceof ReferenceError)
}