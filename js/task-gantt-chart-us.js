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
      var task_no='';
      var task_name='';
      var task_resource = '';
      var start_date='';
      var end_date='';
      var status=0;
      for (var i = 0; i < records.length; i++) {
          task_no = records[i]['task_no']['value'];
          task_name = records[i]['task_name']['value'];
          if (records[i]['task_member']['value'].length > 0)
          {
            for (var j = 0; j < records[i]['task_member']['value'].length; j++)
              if(j === 0)
                task_resource = records[i]['task_member']['value'][j]['name'];
              else
                task_resource += ', ' + records[i]['task_member']['value'][j]['name'];
          }
          start_date = new Date(records[i]['start_date']['value']);
          end_date = new Date(records[i]['end_date']['value']);
          status = new Number(records[i]['task_status']['value']);
          data.addRow([task_no, task_name,task_resource,start_date,end_date,null,status,null]);
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
