jQuery.noConflict();
(function($, PLUGIN_ID) {
    'use strict';

    // Get Configuraiton settings
    var CONF = kintone.plugin.app.getConfig(PLUGIN_ID);

    $(document).ready(function() {

        // If setting exists, set the value.
        if (CONF) {
            $('#text-to-display').val(CONF.text_to_display);
        }

        // Submit Button Click Event
        $('#add-button-plugin-submit').click(function() {
            var config = [];
            var text_to_display = $('#text-to-display').val();
            // Check required field
            if (text_to_display === '') {
                alert('Text to Display is required');
                return;
            }
            config.text_to_display = text_to_display;
            kintone.plugin.app.setConfig(config);
        });

        // Cancel Button Click Event
        $('#add-button-plugin-cancel').click(function() {
            history.back();
        });
    });

})(jQuery, kintone.$PLUGIN_ID);
