jQuery.noConflict();
(function($, PLUGIN_ID) {
    'use strict';
    // Get configuration settings

    var CONF = kintone.plugin.app.getConfig(PLUGIN_ID);
    var user_fields = [];
    user_fields.push({"label": "-----", "value": ""});
    var number_fields = [];
    number_fields.push({"label": "-----", "value": ""});
    function getFields() {
        // Retrieve field information
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
                            if (field.type === 'USER_SELECT') {
                                //Set table code and number field code
                                user_fields.push({"label": field.label,
                                    "value": prop.code + ',' + field.code});
                            }
                        }
                        break;
                    case "NUMBER":
                        number_fields.push({"label": prop.label,
                            "value": prop.code });
                        break;
                    default:
                        break;
                }
            }
        }, function(resp) {
            return alert('Failed to retrieve field(s) information');
        });
    }
    function setUIComponent() {
        // Get space info.
        var dropdownSpace = document.getElementById('dropdown_space');
        var user_dropdown = new kintoneUIComponent.Dropdown({
            items: user_fields,
            value: ''
        });
        dropdownSpace.appendChild(user_dropdown.render());
        // Set default values
        if (CONF.table_field && CONF.user_field) {
            user_dropdown.setValue('');
            for (var i = 0; i < user_fields.length; i++) {
                if (user_fields[i].value === CONF.table_field + ',' + CONF.user_field) {
                    user_dropdown.setValue(CONF.table_field + ',' + CONF.user_field);
                    break;
                }
            }
        }

        // Get space info.
        var subtableSpace = document.getElementById('subtable_space');

        var text = new kintoneUIComponent.Text();
        text.setValue('');
        var count_dropdown = new kintoneUIComponent.Dropdown({
            items: number_fields,
            value: ''
        });

        var table = new kintoneUIComponent.Table({
            rowTemplate: [text, count_dropdown],
            header: ['Login Name', 'User Count Destination']
        });

        subtableSpace.appendChild(table.render());

        // Set default values
        if (CONF.user_count) {
            var user_count = JSON.parse(CONF.user_count);
            for (var j = 0; j < user_count.length; j++) {
                var count_field = '';
                for (var key in number_fields) {
                    if (number_fields[key].value === user_count[j][1]) {
                        count_field = user_count[j][1];
                    }
                }
                user_count[j][1] = count_field;
            }
            table.setValue(user_count);
        }

        return {dropdown: user_dropdown, table: table};
    }

    $(document).ready(function() {
        getFields() //Get fields info.
            .then(setUIComponent) //Set UI Component
            .then(function(components) {
                // Set input values when 'Save' button is clicked
                $('#check-plugin-submit').click(function() {
                    var config = [];
                    var user_field = components.dropdown.getValue();//Get selected value for user field
                    var values = components.table.getValue();//Get config values in table
                    var users = [];

                    for (var i = 0; i < values.length; i++) {
                        var user = [values[i][0], values[i][1]];
                        users.push(user);
                    }
                    // Check required fields
                    if (user_field === '') {
                        alert('Please set required field(s)');
                        return;
                    }
                    for (var j = 0; j < users.length; j++) {
                        if (users[j][0] === '' || users[j][1] === '') {
                            alert('Please set required field(s)');
                            return;
                        }
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
