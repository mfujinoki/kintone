jQuery.noConflict();
(function($, PLUGIN_ID) {
    'use strict';
    // Get configuration settings

    var CONF = kintone.plugin.app.getConfig(PLUGIN_ID);

    var status_fields = [];
    status_fields.push({"label": "-----", "value": ""});
    function getStatus() {
        // Retrieve status information
        return kintone.api(kintone.api.url('/k/v1/preview/app/status', true), 'GET',
            {'app': kintone.app.getId()}).then(function(resp) {

            for (var key in resp.states) {
                if (!resp.states.hasOwnProperty(key)) {
                    continue;
                }
                status_fields.push({"label": resp.states[key].name, "value": resp.states[key].name });
            }
        }, function(resp) {
            return alert('Failed to retrieve status information');
        });
    }
    function setUIComponent() {
        // Get table space info.
        var subtableSpace = document.getElementById('subtable_space');
        var status_dropdown = new kintoneUIComponent.Dropdown({
            items: status_fields,
            value: ''
        });

        var table = new kintoneUIComponent.Table({
            rowTemplate: [status_dropdown],
            header: ['Status Name']
        });

        subtableSpace.appendChild(table.render());

        // Set default values
        if (CONF.status_names) {
            var status_names = JSON.parse(CONF.status_names);
            for (var j = 0; j < status_names.length; j++) {
                var status_name = '';
                for (var key in status_fields) {
                    if (status_fields[key].value === status_names[j][0]) {
                        status_name = status_names[j][0];
                    }
                }
                status_names[j][0] = status_name;
            }
            table.setValue(status_names);
        }
        // Get title space info.
        var titleSpace = document.getElementById('title_space');
        var title_text = new kintoneUIComponent.Text({
            value: 'Are you sure?'
        });
        titleSpace.appendChild(title_text.render());
        // Set default values
        if (CONF.title_text) {
            title_text.setValue(CONF.title_text);
        }

        // Get body space info.
        var bodySpace = document.getElementById('body_space');
        var body_text = new kintoneUIComponent.Text({
            value: 'Are you sure you want to proceed?'
        });
        bodySpace.appendChild(body_text.render());
        // Set default values
        if (CONF.body_text) {
            body_text.setValue(CONF.body_text);
        }

        // Get button space info.
        var buttonSpace = document.getElementById('button_space');
        var button_text = new kintoneUIComponent.Text({
            value: 'Yes, proceed it!'
        });
        buttonSpace.appendChild(button_text.render());
        // Set default values
        if (CONF.button_text) {
            button_text.setValue(CONF.button_text);
        }
        return {table: table, title: title_text, body: body_text, button: button_text};
    }

    $(document).ready(function() {
        getStatus() //Get status info.
            .then(setUIComponent) //Set UI Component
            .then(function(components) {
                // Set input values when 'Save' button is clicked
                $('#check-plugin-submit').click(function() {
                    var config = [];
                    var values = components.table.getValue();//Get config values in table
                    var title_text = components.title.getValue();//Get config value in title text box
                    var body_text = components.body.getValue();//Get config value in body text box
                    var button_text = components.button.getValue();//Get config value in button text box
                    var statuses = [];

                    for (var i = 0; i < values.length; i++) {
                        statuses.push(values[i]);
                    }
                    // Check required fields
                    for (var j = 0; j < statuses.length; j++) {
                        if (statuses[j] === '') {
                            alert('Please set required field(s)');
                            return;
                        }
                    }
                    if (title_text === '' || body_text === '' || button_text === '') {
                        alert('Please set required field(s)');
                        return;
                    }

                    config.status_names = JSON.stringify(statuses);//Set statuses
                    config.title_text = title_text;//Set title text
                    config.body_text = body_text;//Set body text
                    config.button_text = button_text;//Set button text

                    kintone.plugin.app.setConfig(config);
                });
            });
        // Process when 'Cancel' is clicked
        $('#check-plugin-cancel').click(function() {
            history.back();
        });
    });
})(jQuery, kintone.$PLUGIN_ID);
