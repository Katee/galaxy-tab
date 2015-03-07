// (main) An options page for galaxy tab.
// uses: js/defaults.js

state = { widgets: {}
        };

// Update the options page to display all the options widgets with their default values.
// If a configuration object is given, use it to set the options instead of the defaults.
// Optional<Object> -> void
function restore_options(conf) {
    var table = $('table#options');
    // build widgets and set their values
    for(var name in options_config){
        if(options_config.hasOwnProperty(name)){
            // create a widget if one doesn't exist
            if(!state.widgets.hasOwnProperty(name)){
                state.widgets[name] = add_widget_to_table(table, name, options_config[name]);
            }
            // if the conf object is given and has this property, use its value for the widget
            state.widgets[name].write( (conf && conf.hasOwnProperty(name))
                                     ? conf[name]
                                     : options_config[name].value );
        }
    }
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
        case 'RangeWidget':
            w = new RangeWidget(name, conf.value, conf.min, conf.max, conf.step);
            monitor(w);
            break;
        case 'BoolWidget':
            w = new BoolWidget(name, conf.value);
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

$(document).ready(function(){
  restore_options(read_options());

  $('button#save').on('click', save_options);
  $('button#defaults').on('click', restore_options);
});
