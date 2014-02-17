// (main) An options page for galaxy tab.
// uses: js/defaults.js

state = {};

// Update options page to display the configuration object
function restore_options() {
    var table = $('table#options'),
        options = read_options(),
        widgets = {};
    // build widgets and set their values
    for(var name in options_config){
        if(options_config.hasOwnProperty(name)){
            widgets[name] = add_widget_to_table(table, name, options_config[name]);
            widgets[name].write(options[name]);
        }
    }
    // save the widgets for later (in save_options)
    state.widgets = widgets;
}

// Add the widget specified to the table and return it.
// JQuery Element Set, String, Object -> Widget
function add_widget_to_table(table, name, conf){
    var label = $('<label>'),
        td1 = $('<td>'),
        td2 = $('<td>'),
        widget = make_widget(name, conf),
        tr = $('<tr>');
    // label
    label.prop('for', name);
    label.text(conf.label);
    td1.append(label);
    tr.append(td1);
    // widget
    td2.append(widget.jel);
    tr.append(td2);
    // table
    table.prepend(tr);
    return widget;
}

// Literally just return the widget specified by the conf.
// String, Object -> Widget
function make_widget(name, conf){
    var w = undefined;
    switch(conf.widget){
        case RangeWidget:
            w = new conf.widget(name, conf.value, conf.min, conf.max, conf.step);
            monitor(w);
            break;
        case BoolWidget:
            w = new conf.widget(name, conf.value);
            break;
        default:
            throw "append_widget: Not implemented (yet!) for the given widget type.";
            break;
    }
    return w;
}

// Write all options in html to local storage.
function save_options(evt) {
    var options = {};
    // read the widgets
    for(var name in state.widgets){
        if(state.widgets.hasOwnProperty(name)){
            options[name] = state.widgets[name].read();
        }
    }
    // save
    localStorage['options'] = JSON.stringify(options);
    // provide feedback
    $('#status').text('Options saved.');
    setTimeout(function() {
            $('#status').text('');
            }, 750);
}

$(document).ready(restore_options);
$('#save').on('click', save_options);
