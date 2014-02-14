// write all options to local storage
function save_options(evt) {
    localStorage['options'] = JSON.stringify({
        conf_charge:        $('#conf_charge'       ).val(),
        conf_distance:      $('#conf_distance'     ).val(),
        conf_linkmindark:   $('#conf_linkmindark'  ).val(),
        conf_noderadius:    $('#conf_noderadius'   ).val(),
        opt_showsingletons: $('#opt_showsingletons').prop('checked')
        });

    // provide feedback
    $('#status').text('Options saved.');
    setTimeout(function() {
            $('#status').text('');
            }, 750);
}

// add a span to monitor a ranged input
function monitor(jel){
    var span = $('<span>');
    span.text(jel.val());
    jel.after(span);
    jel.on('change', function() {
            span.text(jel.val());
            });
}

// update options page to display a configuration object
function restore_options() {
    options = read_options();
    $('#conf_charge'       ).val(options.conf_charge     );
    $('#conf_distance'     ).val(options.conf_distance   );
    $('#conf_linkmindark'  ).val(options.conf_linkmindark);
    $('#conf_noderadius'   ).val(options.conf_noderadius );
    $('#opt_showsingletons').prop('checked', options.opt_showsingletons);

    monitor($('#conf_charge'     ));
    monitor($('#conf_distance'   ));
    monitor($('#conf_linkmindark'));
    monitor($('#conf_noderadius' ));
}

$(document).ready(restore_options);
$('#save').on('click', save_options);
