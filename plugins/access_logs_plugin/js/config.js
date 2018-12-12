jQuery.noConflict();
(function($, PLUGIN_ID) {
    'use strict';
    // Get configuration settings

    var CONF = kintone.plugin.app.getConfig(PLUGIN_ID);

    function setDropDown(app_id) {
        // Retrieve field information, then set dropdown
        return kintone.api(kintone.api.url('/k/v1/preview/app/form/fields', true), 'GET',
            {'app': app_id}).then(function(resp) {
            //Remove all options but first
            $('#select_app_id_field').find('option').not(':first').remove();
            $('#select_record_id_field').find('option').not(':first').remove();

            for (var key in resp.properties) {
                if (!resp.properties.hasOwnProperty(key)) {
                    continue;
                }
                var prop = resp.properties[key];
                var $option = $('<option>');
                switch (prop.type) {
                    case 'NUMBER':
                        $option.attr('value', prop.code);
                        $option.text(prop.label);
                        $('#select_app_id_field').append($option.clone());
                        $('#select_record_id_field').append($option.clone());
                        break;
                    case 'SINGLE_LINE_TEXT':
                        $option.attr('value', prop.code);
                        $option.text(prop.label);
                        $('#select_app_id_field').append($option.clone());
                        $('#select_record_id_field').append($option.clone());
                        break;
                    default:
                        break;
                }
            }

        }, function(resp) {
            return alert('Failed to retrieve field(s) information');
        });
    }
    function getAppName(app_id) {
        return kintone.api(kintone.api.url('/k/v1/app', true), 'GET', {id: app_id}, function(resp) {
            // success
            $('#app_name').text(resp.name);
        }, function(error) {
            // error
            return alert('Failed to retrieve app name information');
        });
    }
    $(document).ready(function() {

        // Set dropdown list
        var app_id = CONF.app_id_text;
        if (app_id !== undefined) {
            setDropDown(app_id)
                .then(function() {
                    // Set default values
                    $('#app_id_text').val(CONF.app_id_text);
                    $('#app_name').text(CONF.app_name);
                    $('#select_app_id_field').val(CONF.app_id_dropdown);
                    $('#select_record_id_field').val(CONF.record_id_dropdown);
                });
        }

        // Process when App ID is changed
        $('#app_id_text').change(function() {
            // Set dropdown list
            var app_id_text = $('#app_id_text').val();
            if (app_id_text !== '') {
                setDropDown(app_id_text)
                    .then(getAppName(app_id_text))
                    .then(function() {
                        if (app_id_text === CONF.app_id_text) {
                            // Set default values
                            $('#app_id_text').val(CONF.app_id_text);
                            $('#app_name').text(CONF.app_name);
                            $('#select_app_id_field').val(CONF.app_id_dropdown);
                            $('#select_record_id_field').val(CONF.record_id_dropdown);
                        }
                    });
            }
        });

        // Set input values when 'Save' button is clicked
        $('#plugin-submit').click(function() {
            var config = [];
            var app_id_text = $('#app_id_text').val();
            var app_name = $('#app_name').text();
            var app_id_dropdown = $('#select_app_id_field').val();
            var record_id_dropdown = $('#select_record_id_field').val();

            // Check required fields
            if (app_id_text === '' || app_id_dropdown === '' || record_id_dropdown === '') {
                alert('Please set required field(s)');
                return;
            }

            config.app_id_text = app_id_text;
            config.app_name = app_name;
            config.app_id_dropdown = app_id_dropdown;
            config.record_id_dropdown = record_id_dropdown;

            kintone.plugin.app.setConfig(config);
        });
        // Process when 'Cancel' is clicked
        $('#plugin-cancel').click(function() {
            history.back();
        });

    });
})(jQuery, kintone.$PLUGIN_ID);
