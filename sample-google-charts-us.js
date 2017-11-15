(function() {
    "use strict";

    function drawChart(records) {
      var data = new google.visualization.DataTable();
      data.addColumn('string', 'Task ID');
      data.addColumn('string', 'Task Name');
      data.addColumn('string', 'Resource');
      data.addColumn('date', 'Start Date');
      data.addColumn('date', 'End Date');
      data.addColumn('number', 'Duration');
      data.addColumn('number', 'Percent Complete');
      data.addColumn('string', 'Dependencies');
      // Set the record.
      for (var i = 0; i < records.length; i++) {
          data.addRow([records[i]['project_no']['value'],records[i]['project_name']['value'],records[i]['project_team_members']['value'][0]['name'],new Date(records[i]['start_date']['value']),new Date(records[i]['end_date']['value']),null,Number(records[i]['status']['value']),null]);
      }
      var options = {
        height: records.length * 30 + 100,
        gantt: {
          trackHeight: 30
        }
      };

      var chart = new google.visualization.Gantt(document.getElementById('chart_div'));

      chart.draw(data, options);
    }
    // Record list of events.
    kintone.events.on('app.record.index.show', function(event) {

        var records = event.records;

        // Don't display when there is no record.
        if (records.length === 0) {
            return;
        }
        var elSpace = kintone.app.getHeaderSpaceElement();
        // I create an element of Gantt chart.
        var elGantt = document.getElementById("chart_div");
        if (elGantt === null) {
            elGantt = document.createElement("div");
            elGantt.id = "chart_div";
            elSpace.appendChild(elGantt);
        }


        google.charts.load('current', {'packages':['gantt']});
        google.charts.setOnLoadCallback(
          function(){
            drawChart(records);
        });
    });
})();
