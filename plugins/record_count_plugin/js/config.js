jQuery.noConflict();
(function($, PLUGIN_ID) {
    'use strict';
    // Get configuration settings

    var CONF = kintone.plugin.app.getConfig(PLUGIN_ID);
    var DROPDOWN_VALUES = new Map();

    function setDropDown() {
        // Retrieve field information, then set dropdown
        return kintone.api(kintone.api.url('/k/v1/preview/app/form/fields', true), 'GET',
            {'app': kintone.app.getId()}).then(function(resp) {

            for (var key in resp.properties) {
                if (!resp.properties.hasOwnProperty(key)) {
                    continue;
                }
                var prop = resp.properties[key];
                var $option = $('<option>');

                if (prop.type === 'DROP_DOWN') {
                    $option.attr('value', prop.code);
                    $option.text(prop.label);
                    $('#select_dropdown_field').append($option.clone());
                    DROPDOWN_VALUES.set(prop.code, prop.options);
                }
            }
            // Set default values
            $('#select_dropdown_field').val(CONF.dropdown_field);

        }, function(resp) {
            return alert('Failed to retrieve field(s) information');
        });
    }
    function setDropdownValue() {//Set dropdown values based on dorpdown selected.
        var dropdown_field = $('#select_dropdown_field').val();
        if (dropdown_field === null) {
            return;//Return if the first dropdown is not yet selected.
        }
        $('#select_dropdown_value').empty();
        var opt = DROPDOWN_VALUES.get(dropdown_field);
        for (var key in opt) {
            if (!opt.hasOwnProperty(key)) {
                continue;
            }
            var prop = opt[key];
            var $option = $('<option>');

            $option.attr('value', prop.label);
            $option.text(prop.label);
            $('#select_dropdown_value').append($option.clone());
        }
        // Set default values
        $('#select_dropdown_value').val(CONF.dropdown_choice);
        if ($('#select_dropdown_value').val() === null) {//Set first option if no value is selected.
            $('#select_dropdown_value option:first').attr('selected', 'selected');
        }
    }
    $(document).ready(function() {
        // Set dropdown list
        setDropDown()
            .then(setDropdownValue);
        // Set input values when 'Save' button is clicked
        $('#check-plugin-submit').click(function() {
            var config = [];
            var dropdown_field = $('#select_dropdown_field').val();
            var dropdown_choice = $('#select_dropdown_value').val();
            // Check required fields
            if (dropdown_field === '' || dropdown_choice === '' || dropdown_choice === null) {
                alert('Please set required field(s)');
                return;
            }
            config.dropdown_field = dropdown_field;
            config.dropdown_choice = dropdown_choice;
            kintone.plugin.app.setConfig(config);
        });
        // Process when 'Cancel' is clicked
        $('#check-plugin-cancel').click(function() {
            history.back();
        });
        // Populate the second dropdown when the first dropdown is changed.
        $('#select_dropdown_field').change(function() {
            setDropdownValue();
        });
    });
})(jQuery, kintone.$PLUGIN_ID);
