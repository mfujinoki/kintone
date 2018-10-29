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
                    case 'USER_SELECT':
                        $option.attr('value', prop.code);
                        $option.text(escapeHtml(prop.label));
                        $('#select_user_field').append($option.clone());
                        break;
                    default:
                        break;
                }
            }
            // Set default values
            $('#select_user_field').val(CONF.user_log);
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
            var users = $('#select_user_field').val();

            // Check requred fields
            if (users === '') {
                alert('Please set required field(s)');
                return;
            }
            config.user_log = users;

            kintone.plugin.app.setConfig(config);
        });
        // Process when 'Cancel' is clicked
        $('#check-plugin-cancel').click(function() {
            history.back();
        });
    });
})(jQuery, kintone.$PLUGIN_ID);
