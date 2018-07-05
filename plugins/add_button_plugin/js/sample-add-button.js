(function(PLUGIN_ID) {
    "use strict";
    // Get Configuration settings
    var CONFIG = kintone.plugin.app.getConfig(PLUGIN_ID);
    // Exit if no configuration settings
    if (!CONFIG) {
        return false;
    }
    // Run a function when the record list page appears
    kintone.events.on('app.record.index.show', function(event) {
        //Prevent duplication of the button
        if (document.getElementById('my_index_button') !== null) {
            return;
        }
        // Set a button
        var myIndexButton = document.createElement('button');
        myIndexButton.id = 'my_index_button';
        myIndexButton.innerHTML = 'Click Me!';

        // Button onclick function
        myIndexButton.onclick = function() {
            window.alert(CONFIG.text_to_display);
        };
        // Retrieve the header menu space element and set the button there
        kintone.app.getHeaderMenuSpaceElement().appendChild(myIndexButton);
    });
})(kintone.$PLUGIN_ID);
