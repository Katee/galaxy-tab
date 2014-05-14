// Configuration for each option (default values, etc..)

options_config = { conf_charge:        {widget:'RangeWidget', value:-70  , label:'Charge',                min: -200, max:0,   step:5   }
                 , conf_distance:      {widget:'RangeWidget', value: 25  , label:'Distance' ,             min: 0,    max:100, step:5   }
                 , conf_linkmindark:   {widget:'RangeWidget', value:  0.5, label:'Link Minimum Darkness', min: 0,    max:1,   step:0.05}
                 , conf_noderadius:    {widget:'RangeWidget', value:  5  , label:'Node Radius',           min: 0,    max:20,  step:0.5 }
                 , opt_showsingletons: {widget:'BoolWidget' , value: true, label:'Show unlinked Nodes?'                                }
                 };

// Read all options from local storage (or provide a default value).
function read_options() {
    var saved = localStorage['options'],
        options = saved == undefined ? {} : JSON.parse(saved);
    // add in missing things
    for(var name in options_config){
        if(options_config.hasOwnProperty(name)){
            if(!options.hasOwnProperty(name)){
                console.log('Adding default value for new option:', name);
                options[name] = options_config[name].value;
            }else
            if(typeof options[name] != typeof options_config[name].value){
                console.log('Swapping-in default value for wrong type on:', name);
                options[name] = options_config[name].value;
            }
        }
    }
    return options;
}

// eof
