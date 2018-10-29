jQuery.noConflict();
(function($, PLUGIN_ID) {
    'use strict';
    // Get configuration settings

    var CONF = kintone.plugin.app.getConfig(PLUGIN_ID);

    function setDropDown() {
        // Retrieve field information, then set dropdown
        return kintone.api(kintone.api.url('/k/v1/preview/app/form/fields', true), 'GET',
            {'app': kintone.app.getId()}).then(function(resp) {

            for (var key in resp.properties) {
                if (!resp.properties.hasOwnProperty(key)) {
                    continue;
                }
                var prop = resp.properties[key];

                if (prop.type === 'SUBTABLE') {
                    for (var key2 in prop.fields) {
                        var field = prop.fields[key2];
                        var $option = $('<option>');
                        if (field.type === 'USER_SELECT') {
                            $option.attr('value', prop.code + ',' + field.code); //Set table code and number field code
                            $option.text(field.label);
                            $('#select_user_field').append($option.clone());
                        }
                    }
                }
            }
            // Set default values
            $('#select_user_field').val(CONF.user_field);
        }, function(resp) {
            return alert('Failed to retrieve field(s) information');
        });
    }
    function setSubtable() {
        // Get space info.
        var subtableSpace = document.getElementById('subtable_space');
        /*if (document.getElementById('subtable_space') !== null) {
            return event;
        }*/

        var textCode = new kintoneUIComponent.Text();
        var textName = new kintoneUIComponent.Text();
        var table = new kintoneUIComponent.Table({
            rowTemplate: [textCode, textName],
            header: ['Login Name', 'User Count Destination']
        });

        subtableSpace.appendChild(table.render());
    }

    $(document).ready(function() {
        // Set dropdown list
        setDropDown();
        setSubtable();
        // Set input values when 'Save' button is clicked
        $('#check-plugin-submit').click(function() {
            var config = [];
            var user_field = $('#select_user_field').val();

            // Check requred fields
            if (user_field === '') {
                alert('Please set required field(s)');
                return;
            }

            config.table_field = user_field.split(',')[0];//Set table field code
            config.user_field = user_field.split(',')[1];//Set user field code

            kintone.plugin.app.setConfig(config);
        });
        // Process when 'Cancel' is clicked
        $('#check-plugin-cancel').click(function() {
            history.back();
        });
    });
})(jQuery, kintone.$PLUGIN_ID);
