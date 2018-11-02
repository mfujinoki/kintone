jQuery.noConflict();
(function($, PLUGIN_ID) {
    'use strict';
    // Get configuration settings

    var CONF = kintone.plugin.app.getConfig(PLUGIN_ID);

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
                    case 'NUMBER':
                        $option.attr('value', prop.code);
                        $option.text(escapeHtml(prop.label));
                        $('#select_number_field').append($option.clone());
                        break;
                    case 'SINGLE_LINE_TEXT':
                        $option.attr('value', prop.code);
                        $option.text(escapeHtml(prop.label));
                        $('#select_zerofilled_field').append($option.clone());
                        break;
                    default:
                        break;
                }
            }
            // Set default values

            $('#select_number_field').val(CONF.number);
            $('#select_zerofilled_field').val(CONF.zerofilled);
            $('#text_digits').val(CONF.digits);
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
            var number = $('#select_number_field').val();
            var zerofilled = $('#select_zerofilled_field').val();
            var digits = $('#text_digits').val();
            // Check required fields
            if (number === '' || zerofilled === '' || digits === '') {
                alert('Please set required field(s)');
                return;
            }
            var numDigits = Number(digits);
            if (numDigits > 30 || numDigits < 1 || !Number.isInteger(numDigits)) {
                alert('The number of digits must be 1 to 30 integer.');
                return;
            }
            config.number = number;
            config.zerofilled = zerofilled;
            config.digits = digits;
            kintone.plugin.app.setConfig(config);
        });
        // Process when 'Cancel' is clicked
        $('#check-plugin-cancel').click(function() {
            history.back();
        });
    });
})(jQuery, kintone.$PLUGIN_ID);
