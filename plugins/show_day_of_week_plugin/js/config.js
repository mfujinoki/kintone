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
                    case 'DATE':
                        $option.attr('value', prop.code);
                        $option.text(escapeHtml(prop.label));
                        $('#select_date_field').append($option.clone());
                        break;
                    default:
                        break;
                }
            }
            // Set default values
            $('#select_date_field').val(CONF.date_field);
            if (CONF.name_of_days === undefined) {
                return; //Return if config is not set.
            }
            var days = JSON.parse(CONF.name_of_days);
            $('#sun_text').val(days[0]);
            $('#mon_text').val(days[1]);
            $('#tue_text').val(days[2]);
            $('#wed_text').val(days[3]);
            $('#thu_text').val(days[4]);
            $('#fri_text').val(days[5]);
            $('#sat_text').val(days[6]);
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
            var days = [];
            var date_field = $('#select_date_field').val();
            var sun = $('#sun_text').val();
            var mon = $('#mon_text').val();
            var tue = $('#tue_text').val();
            var wed = $('#wed_text').val();
            var thu = $('#thu_text').val();
            var fri = $('#fri_text').val();
            var sat = $('#sat_text').val();
            // Check required fields
            if (date_field === '' || sun === '' || mon === '' || tue === '' || wed === '' ||
                thu === '' || fri === '' || sat === '') {
                alert('Please set required field(s)');
                return;
            }
            days.push(sun, mon, tue, wed, thu, fri, sat);
            config.date_field = date_field;
            config.name_of_days = JSON.stringify(days);
            kintone.plugin.app.setConfig(config);
        });
        // Process when 'Cancel' is clicked
        $('#check-plugin-cancel').click(function() {
            history.back();
        });
    });
})(jQuery, kintone.$PLUGIN_ID);
