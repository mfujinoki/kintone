jQuery.noConflict();
(function($, PLUGIN_ID) {
    'use strict';
    // Get configuration settings
    var CONF = kintone.plugin.app.getConfig(PLUGIN_ID);

    function setDropDownForSpace(rows) {
        // Get each field information
        for (var i = 0; i < rows.length; i++) {
            var fields = rows[i];
            for (var cnt = 0; cnt < fields.length; cnt++) {
                var rowField = fields[cnt];
                var $option = $('<option>');
                switch (rowField.type) {
                    // Only pick Space fields
                    case 'SPACER':
                        $option.attr('value', rowField.elementId);
                        $option.text(rowField.elementId);
                        $('#select_space_field').append($option.clone());
                        break;
                    default:
                        break;
                }
            }
        }
        // Set default value
        $('#select_space_field').val(CONF.space);
    }
    function getLayout() {
        // Retrieve field information, then set dropdown
        return kintone.api(kintone.api.url('/k/v1/preview/app/form/layout', true), 'GET',
            {'app': kintone.app.getId()}).then(function(resp) {
            var rows = [];
            for (var i = 0; i < resp.layout.length; i++) {
                var row = resp.layout[i];
                // If type is ROW
                if (row.type === 'ROW') {
                    rows.push(row.fields);
                } else if (row.type === 'GROUP') {
                    for (var j = 0; j < row.layout.length; j++) {
                        var row2 = row.layout[j];
                        if (row2.type !== 'ROW') {
                            continue;
                        }
                        rows.push(row2.fields);
                    }
                }
            }
            return rows;
        }, function(resp) {
            return alert('Failed to retrieve layout information.');
        });
    }
    function setDropDownForUser() {
        // Retrieve field information, then set dropdown
        return kintone.api(kintone.api.url('/k/v1/preview/app/form/fields', true), 'GET',
            {'app': kintone.app.getId()}).then(function(resp) {

            for (var key in resp.properties) {
                if (!resp.properties.hasOwnProperty(key)) {
                    continue;
                }
                var prop = resp.properties[key];
                var $option = $('<option>');

                switch (prop.type) {
                    // Only pick User Select field
                    case 'USER_SELECT':
                        $option.attr('value', prop.code);
                        $option.text(prop.label);
                        $('#select_user_field').append($option.clone());
                        break;
                    default:
                        break;
                }
            }
            // Set default values
            $('#select_user_field').val(CONF.user);
        }, function(resp) {
            return alert('Failed to retrieve fields information');
        });
    }

    $(document).ready(function() {
        // Set default values
        if (!CONF.label) {
            CONF.label = "Add yourself";
        }
        $('#text-button-label').val(CONF.label);
        // Set dropdown list
        setDropDownForUser()
            .then(getLayout)
            .then(setDropDownForSpace);
        // Set input values when 'Save' button is clicked
        $('#check-plugin-submit').click(function() {
            var config = [];
            var space = $('#select_space_field').val();
            var label = $('#text-button-label').val();
            var user = $('#select_user_field').val();

            // Check requred fields
            if (space === '' || label === '' || user === '') {
                alert('Please set required field(s)');
                return;
            }
            config.space = space;
            config.label = label;
            config.user = user;

            kintone.plugin.app.setConfig(config);
        });
        // Process when 'Cancel' is clicked
        $('#check-plugin-cancel').click(function() {
            history.back();
        });
    });
})(jQuery, kintone.$PLUGIN_ID);
