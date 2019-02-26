/*
MIT License
Copyright (c) 2018 Cybozu
https://github.com/kintone/SAMPLE-Date-input-button-Plug-in/blob/master/LICENSE
*/

jQuery.noConflict();
(function($, PLUGIN_ID) {
    'use strict';
    // Get configuration settings
    var CONF = kintone.plugin.app.getConfig(PLUGIN_ID);

    function escapeHtml(htmlstr) {
        return htmlstr.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function setDropDownForSpace(rows) {
        // Use the row information obtained from getLayout() and extract all Blank space fields.
        // Create a dropdown menu containing a list of Space fields in the config.
        for (var i = 0; i < rows.length; i++) {
            var fields = rows[i];
            for (var cnt = 0; cnt < fields.length; cnt++) {
                var rowField = fields[cnt];
                var $option = $('<option>');
                switch (rowField.type) {
                    // Only pick Space fields
                    case 'SPACER':
                        $option.attr('value', rowField.elementId);
                        $option.text(escapeHtml(rowField.elementId));
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
        // Retrieve field layout information from the form so that it can later be used to identify Blank space fields.
        // If layout[].type is ROW, push data into an array.
        // If layout[].type is GROUP, it could still contain Blank space fields, so process it in another loop.
        // If layout[].type is SUBTABLE, ignore it, as Blank space fields cannot be contained in tables.
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
            return alert('Failed to retrieve layout information of the Kintone App.');
        });
    }

    function setDropDownForDate() {
        // Retrieve all fields from the form and extract all Date fields.
        // Create a dropdown menu containing a list of Date fields in the config.
        return kintone.api(kintone.api.url('/k/v1/preview/app/form/fields', true), 'GET',
            {'app': kintone.app.getId()}).then(function(resp) {

            for (var key in resp.properties) {
                if (!resp.properties.hasOwnProperty(key)) {
                    continue;
                }
                var prop = resp.properties[key];
                var $option = $('<option>');

                switch (prop.type) {
                    // Only pick Date field
                    case 'DATE':
                        $option.attr('value', prop.code);
                        $option.text(escapeHtml(prop.label));
                        $('#select_date_field').append($option.clone());
                        break;
                    default:
                        break;
                }
            }
            // Set default values
            $('#select_date_field').val(CONF.date);
        }, function(resp) {
            return alert('Failed to retrieve field information of the Kintone App.');
        });
    }

    $(document).ready(function() {
        // Set dropdown list
        setDropDownForDate()
            .then(getLayout)
            .then(setDropDownForSpace);
        // Set input values when 'Save' button is clicked
        $('#check-plugin-submit').click(function() {
            var config = [];
            var date = $('#select_date_field').val();
            var space = $('#select_space_field').val();

            // Check required fields
            if (date === '' || space === '') {
                alert('Please set required field(s)');
                return;
            }
            config.date = date;
            config.space = space;

            kintone.plugin.app.setConfig(config);
        });
        // Process when 'Cancel' is clicked
        $('#check-plugin-cancel').click(function() {
            history.back();
        });
    });
})(jQuery, kintone.$PLUGIN_ID);
