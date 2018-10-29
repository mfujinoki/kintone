jQuery.noConflict();
(function($, PLUGIN_ID) {
    'use strict';
    // Get configuration settings

    var CONF = kintone.plugin.app.getConfig(PLUGIN_ID);
    var DEFAULT = new Map();

    function escapeHtml(htmlstr) {
        return htmlstr.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }
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

                switch (prop.type) {
                    case 'RADIO_BUTTON':
                        $option.attr('value', prop.code);
                        $option.text(escapeHtml(prop.label));
                        $('#select_radio_button_field').append($option.clone());
                        DEFAULT.set(prop.code, prop.defaultValue);
                        break;
                    default:
                        break;
                }
            }
            // Set default values
            $('#select_radio_button_field').val(CONF.radio_button);
        }, function(resp) {
            return alert('Failed to retrieve field(s) information');
        });
    }
    $(document).ready(function() {
        // Set dropdown list
        setDropDown();
        // Set input values when 'Save' button is clicked
        $('#check-plugin-submit').click(function() {
            var config = [];
            var radio_button = $('#select_radio_button_field').val();
            // Check requred fields
            if (radio_button === '') {
                alert('Please set required field(s)');
                return;
            }
            config.radio_button = radio_button;
            config.default_value = DEFAULT.get(radio_button);
            kintone.plugin.app.setConfig(config);
        });
        // Process when 'Cancel' is clicked
        $('#check-plugin-cancel').click(function() {
            history.back();
        });
    });
})(jQuery, kintone.$PLUGIN_ID);
