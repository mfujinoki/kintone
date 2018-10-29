jQuery.noConflict();
(function($, PLUGIN_ID) {
    'use strict';
    // Get configuration settings

    var CONF = kintone.plugin.app.getConfig(PLUGIN_ID);
    //Create Map object for fetch critiria
    var FETCH_CRITERIA_A = new Map();
    var FETCH_CRITERIA_B = new Map();

    function escapeHtml(htmlstr) {
        return htmlstr.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }
    function setDropDownForSpace(rows) {
        // Get each field information
        for (var i = 0; i < rows.length; i++) {
            var fields = rows[i];
            for (var cnt = 0; cnt < fields.length; cnt++) {
                var rowField = fields[cnt];
                var $option = $('<option>');
                switch (rowField.type) {
                    // Only pick Space fields
                    case 'SPACER':
                        $option.attr('value', rowField.elementId);
                        $option.text(escapeHtml(rowField.elementId));
                        $('#select_number_space_field').append($option.clone());
                        break;
                    default:
                        break;
                }
            }
        }
        // Set default value
        $('#select_number_space_field').val(CONF.numberSpace);
    }
    function setDropDownForRelatedRecords() {
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
                    // Only pick Related Records field
                    case 'REFERENCE_TABLE':
                        $option.attr('value', prop.code);
                        $option.text(escapeHtml(prop.label));
                        $('#select_related_records_field').append($option.clone());
                        //Set fetch criteria
                        FETCH_CRITERIA_A.set(prop.code, prop.referenceTable.condition.field);
                        FETCH_CRITERIA_B.set(prop.code, prop.referenceTable.condition.relatedField);
                        break;
                    default:
                        break;
                }
            }
            // Set default values
            $('#select_related_records_field').val(CONF.relatedRecords);
        }, function(resp) {
            return alert('Failed to retrieve fields information');
        });
    }
    function getLayout() {
        // Retrieve field information, then set dropdown
        return kintone.api(kintone.api.url('/k/v1/preview/app/form/layout', true), 'GET',
            {'app': kintone.app.getId()}).then(function(resp) {
            var rows = [];
            for (var i = 0; i < resp.layout.length; i++) {
                var row = resp.layout[i];
                // If type is ROW
                if (row.type === 'ROW') {
                    rows.push(row.fields);
                } else if (row.type === 'GROUP') {
                    for (var j = 0; j < row.layout.length; j++) {
                        var row2 = row.layout[j];
                        if (row2.type !== 'ROW') {
                            continue;
                        }
                        rows.push(row2.fields);
                    }
                }
            }
            return rows;
        }, function(resp) {
            return alert('Failed to retrieve layout information.');
        });
    }

    $(document).ready(function() {
        // Set dropdown list
        setDropDownForRelatedRecords()
            .then(getLayout)
            .then(setDropDownForSpace);
        // Set input values when 'Save' button is clicked
        $('#check-plugin-submit').click(function() {
            var config = [];
            var relatedRecords = $('#select_related_records_field').val();
            var space = $('#select_number_space_field').val();

            // Check requred fields
            if (relatedRecords === '' || space === '') {
                alert('Please set required field(s)');
                return;
            }
            config.relatedRecords = relatedRecords;
            config.numberSpace = space;
            config.fetch_criteria_a = FETCH_CRITERIA_A.get(relatedRecords);
            config.fetch_criteria_b = FETCH_CRITERIA_B.get(relatedRecords);

            kintone.plugin.app.setConfig(config);
        });
        // Process when 'Cancel' is clicked
        $('#check-plugin-cancel').click(function() {
            history.back();
        });
    });
})(jQuery, kintone.$PLUGIN_ID);
