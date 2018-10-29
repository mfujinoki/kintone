
jQuery.noConflict();

(function($, PLUGIN_ID) {
    'use strict';

    // Get configuration settings
    var KEY = PLUGIN_ID;
    var CONF = kintone.plugin.app.getConfig(KEY);
    // Input mode
    var MODE_ON = '1'; // Check after change
    var MODE_OFF = '0'; // No check after change
    function escapeHtml(htmlstr) {
        return htmlstr.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function setDropdown() {
        // Retrieve field information, then set dropdown
        kintone.api(kintone.api.url('/k/v1/preview/app/form/fields', true), 'GET',
            {'app': kintone.app.getId()}, function(resp) {

                for (var key in resp.properties) {
                    if (!resp.properties.hasOwnProperty(key)) {
                        continue;
                    }
                    var prop = resp.properties[key];
                    var $option = $('<option>');

                    switch (prop.type) {
                        // Only pick Single Text and Number fields
                        case 'SINGLE_LINE_TEXT':
                        case 'NUMBER':
                        case 'LINK':

                            $option.attr('value', escapeHtml(prop.code));
                            $option.text(escapeHtml(prop.label));
                            $('#select_checkvalue_field_zip').append($option.clone());
                            $('#select_checkvalue_field_tel').append($option.clone());
                            $('#select_checkvalue_field_fax').append($option.clone());
                            $('#select_checkvalue_field_mail').append($option.clone());
                            break;

                        default:
                            break;
                    }
                }
                // Set default values
                $('#select_checkvalue_field_zip').val(CONF.zip);
                $('#select_checkvalue_field_tel').val(CONF.tel);
                $('#select_checkvalue_field_fax').val(CONF.fax);
                $('#select_checkvalue_field_mail').val(CONF.mail);
            });
    }

    $(document).ready(function() {

        // Set field values if already have values
        if (CONF) {
            // Set dropdown list
            setDropdown();
            $('#check-plugin-change_mode').prop('checked', false);
            // Check mode is on
            if (CONF.mode === MODE_ON) {
                $('#check-plugin-change_mode').prop('checked', true);
            }
        }

        // Set input values when 'Save' button is clicked
        $('#check-plugin-submit').click(function() {
            var config = [];
            var zip = $('#select_checkvalue_field_zip').val();
            var tel = $('#select_checkvalue_field_tel').val();
            var fax = $('#select_checkvalue_field_fax').val();
            var mail = $('#select_checkvalue_field_mail').val();
            var mode = $('#check-plugin-change_mode').prop('checked');
            // Check requred fields
            if (zip === '' || tel === '' || fax === '' || mail === '') {
                alert('Please set required field(s)');
                return;
            }
            config.zip = zip;
            config.tel = tel;
            config.fax = fax;
            config.mail = mail;
            // Check duplicate
            var uniqueConfig = [zip, tel, fax, mail];
            var uniqueConfig2 = uniqueConfig.filter(function(value, index, self) {
                return self.indexOf(value) === index;
            });
            if (Object.keys(config).length !== uniqueConfig2.length) {
                alert('Duplicate fields not allowed');
                return;
            }

            config.mode = MODE_OFF;
            if (mode) {
                config.mode = MODE_ON;
            }
            kintone.plugin.app.setConfig(config);
        });

        // Process when 'Cancel' is clicked
        $('#check-plugin-cancel').click(function() {
            history.back();
        });
    });

})(jQuery, kintone.$PLUGIN_ID);
