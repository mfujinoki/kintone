jQuery.noConflict();
(function($, PLUGIN_ID) {
    'use strict';
    // Get configuration settings

    var CONF = kintone.plugin.app.getConfig(PLUGIN_ID);
    var number_fields = [];
    function setDropDown() {
        // Retrieve field information, then set dropdown
        return kintone.api(kintone.api.url('/k/v1/preview/app/form/fields', true), 'GET',
            {'app': kintone.app.getId()}).then(function(resp) {

            for (var key in resp.properties) {
                if (!resp.properties.hasOwnProperty(key)) {
                    continue;
                }
                var prop = resp.properties[key];

                switch (prop.type) {
                    case 'SUBTABLE':
                        for (var key2 in prop.fields) {
                            var field = prop.fields[key2];
                            var $option = $('<option>');
                            if (field.type === 'USER_SELECT') {
                                //Set table code and number field code
                                $option.attr('value', prop.code + ',' + field.code);
                                $option.text(field.label);
                                $('#select_user_field').append($option.clone());
                            }
                        }
                        break;
                    case "NUMBER":
                        number_fields.push(JSON.parse('{"label": "' + prop.label +
                        '", "value": "' + prop.code + '", "isDisabled": false}'));
                        break;
                    default:
                        break;
                }
            }
            // Set default values
            $('#select_user_field').val(CONF.table_field + ',' + CONF.user_field);
        }, function(resp) {
            return alert('Failed to retrieve field(s) information');
        });
    }
    function setSubtable() {

        // Get space info.
        var subtableSpace = document.getElementById('subtable_space');

        var text = new kintoneUIComponent.Text();
        var dropdown = new kintoneUIComponent.Dropdown({
            items: number_fields
        });

        var table = new kintoneUIComponent.Table({
            rowTemplate: [text, dropdown],
            header: ['Login Name', 'User Count Destination']
        });

        subtableSpace.appendChild(table.render());

        // Set default values
        if (CONF.user_count) {
            var user_count = JSON.parse(CONF.user_count);
            table.setValue(user_count);
        }

        return table;
    }

    $(document).ready(function() {
        // Set dropdown list
        setDropDown()
            .then(setSubtable)
            .then(function(table) {
                // Set input values when 'Save' button is clicked
                $('#check-plugin-submit').click(function() {
                    var config = [];
                    var user_field = $('#select_user_field').val();
                    var value = table.getValue();//Get config values in table
                    var users = [];
                    value.forEach(rowData => {
                        var user = [rowData[0], rowData[1]];
                        users.push(user);
                    });
                    // Check requred fields
                    if (user_field === '' || users.length === 0) {
                        alert('Please set required field(s)');
                        return;
                    }

                    config.table_field = user_field.split(',')[0];//Set table field code
                    config.user_field = user_field.split(',')[1];//Set user field code
                    config.user_count = JSON.stringify(users);//Set login name and user count field

                    kintone.plugin.app.setConfig(config);
                });
            });
        // Process when 'Cancel' is clicked
        $('#check-plugin-cancel').click(function() {
            history.back();
        });
    });
})(jQuery, kintone.$PLUGIN_ID);
