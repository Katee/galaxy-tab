// Really really simple gui widgets.
// uses: js/object.js

// str, num, num, num, num -> RangeWidget
function RangeWidget(id, value, min, max, step){
    constructor_for(RangeWidget, this);
    this.jel = $('<input>');
    this.jel.prop('type',  'range');
    this.jel.prop('min',   min);
    this.jel.prop('max',   max);
    this.jel.prop('step',  step);
    this.jel.prop('value', value);
    this.jel.prop('id',    id);
    this.jel.prop('name',  id);
}
// void -> num
RangeWidget.prototype.read = function(){
    instance_method_for(RangeWidget, this);
    return JSON.parse(this.jel.val());
}
// num -> void
RangeWidget.prototype.write = function(value){
    instance_method_for(RangeWidget, this);
    return this.jel.val(value);
}

// str, bool -> BoolWidget
function BoolWidget(id, value){
    constructor_for(BoolWidget, this);
    this.jel = $('<input>');
    this.jel.prop('type', 'checkbox');
    this.jel.prop('checked', value);
    this.jel.prop('id', id);
    this.jel.prop('name', id);
}
// void -> bool
BoolWidget.prototype.read = function(){
    instance_method_for(BoolWidget, this);
    return this.jel.prop('checked');
}
// bool -> void
BoolWidget.prototype.write = function(value){
    instance_method_for(BoolWidget, this);
    return this.jel.prop('checked', value);
}

// Add an element after a widget to display its current value.
// Widget -> JQuery Element Set
function monitor(widget){
    var monjel = $('<output>'),
        update = function(){ monjel.text(widget.read()); };
    update();
    widget.jel.after(monjel);
    widget.jel.on('change', update);
    return monjel;
}

// eof
