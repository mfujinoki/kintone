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
                var $option = $('<option>');

                if (prop.type === 'DATETIME' || prop.type === 'UPDATED_TIME' || prop.type === 'CREATED_TIME') {
                    $option.attr('value', prop.code);
                    $option.text(prop.label);
                    $('#select_datetime_field').append($option.clone());
                }
            }
            // Set default values
            $('#select_datetime_field').val(CONF.datetime_field);
        }, function(resp) {
            return alert('Failed to retrieve field(s) information');
        });
    }
    $(document).ready(function() {
        // Set default values
        if (CONF.locale) {
            $('#select_locale').val(CONF.locale);
        }
        // Set dropdown list
        setDropDown();
        // Set input values when 'Save' button is clicked
        $('#check-plugin-submit').click(function() {
            var config = [];
            var locale = $('#select_locale').val();
            var datetime = $('#select_datetime_field').val();
            // Check required fields
            if (locale === '' || datetime === '') {
                alert('Please set required field(s)');
                return;
            }
            config.locale = locale;
            config.datetime_field = datetime;
            kintone.plugin.app.setConfig(config);
        });
        // Process when 'Cancel' is clicked
        $('#check-plugin-cancel').click(function() {
            history.back();
        });
    });
})(jQuery, kintone.$PLUGIN_ID);
