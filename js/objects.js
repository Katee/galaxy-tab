// One-liners for object use sanity.

function constructor_for(type, inst) { // TODO: change this to use .arguments or somesuch and apply 'new' for you
    if(!(inst instanceof type)){
        throw "Object constructor called without 'new' operator.";
    }
}

function instance_method_for(type, inst) {
    if(!(inst instanceof type)){
        throw "Instance method called incorrectly.";
    }
}

// eof
