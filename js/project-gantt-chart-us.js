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
      var project_no='';
      var project_name='';
      var project_resource = '';
      var start_date='';
      var end_date='';
      var status=0;
      for (var i = 0; i < records.length; i++) {
          project_no = records[i]['project_no']['value'];
          project_name = records[i]['project_name']['value'];
          if (records[i]['project_manager']['value'].length > 0)
          {
            for (var j = 0; j < records[i]['project_manager']['value'].length; j++)
              if(j === 0)
                project_resource = records[i]['project_manager']['value'][j]['name'];
              else
                project_resource += ', ' + records[i]['project_manager']['value'][j]['name'];
          }
          start_date = new Date(records[i]['start_date']['value']);
          end_date = new Date(records[i]['end_date']['value']);
          status = new Number(records[i]['status']['value']);
          data.addRow([project_no, project_name,project_resource,start_date,end_date,null,status,null]);
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
