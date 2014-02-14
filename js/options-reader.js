// read all options from local storage (or provide a default value)
// return a configuration object
function read_options() {
    var ostr = localStorage['options'];
    return (ostr ? JSON.parse(ostr) : {
            conf_charge: -70,
            conf_distance: 25,
            conf_linkmindark: 0.5,
            conf_noderadius: 5,
            opt_showsingletons: true
            });
}
