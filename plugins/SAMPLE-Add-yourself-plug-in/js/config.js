/*
MIT License
Copyright (c) 2018 Cybozu
https://github.com/kintone/SAMPLE-Add-yourself-plug-in/blob/master/LICENSE
*/
jQuery.noConflict();
(function($, PLUGIN_ID) {
    'use strict';
    // Get configuration settings
    var CONF = kintone.plugin.app.getConfig(PLUGIN_ID);

    function setDropDown() {
        // Retrieve field information, then set drop-down
        return KintoneConfigHelper.getFields().then(function(resp) {
            var $userDropDown = $('#select_user_field');
            var $spaceDropDown = $('#select_space_field');
            for (var i = 0; i < resp.length; i++) {
                var $option = $('<option></option>');
                switch (resp[i].type) {
                    case "USER_SELECT":
                        $option.attr('value', resp[i].code);
                        $option.text(resp[i].label);
                        $userDropDown.append($option.clone());
                        break;
                    case "SPACER":
                        $option.attr('value', resp[i].elementId);
                        $option.text(resp[i].elementId);
                        $spaceDropDown.append($option.clone());
                        break;
                    default:
                        break;
                }
            }
            // Set default values
            if (CONF.user) {
                $userDropDown.val(CONF.user);
            }
            if (CONF.space) {
                $spaceDropDown.val(CONF.space);
            }
        }, function(resp) {
            return alert('Failed to retrieve fields information');
        });
    }

    $(document).ready(function() {
        // Set default values
        if (!CONF.label) {
            CONF.label = "Add yourself";
        }
        $('#text-button-label').val(CONF.label);
        // Set drop-down list
        setDropDown();

        // Set input values when 'Save' button is clicked
        $('#check-plugin-submit').click(function() {
            var config = [];
            var space = $('#select_space_field').val();
            var label = $('#text-button-label').val();
            var user = $('#select_user_field').val();

            // Check required fields
            if (space === '' || label === '' || user === '') {
                alert('Please set the required field(s) in the drop-downs');
                return;
            }
            config.space = space;
            config.label = label;
            config.user = user;

            kintone.plugin.app.setConfig(config);
        });
        // Process when 'Cancel' is clicked
        $('#check-plugin-cancel').click(function() {
            history.back();
        });
    });
})(jQuery, kintone.$PLUGIN_ID);
