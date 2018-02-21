(function(){
    'use strict'

    kintone.events.on(['app.record.detail.show','app.record.edit.show'],function(event){
      var record = event.record;

      if (document.getElementById('student_list')!== null)
      {
        return event;
      }

      var subtableSpace = kintone.app.record.getSpaceElement('student_list');

      var params = {
          "app": 104,
          "query": "class_code in (\"" + record.class_code.value + "\") order by student_no asc limit 500",
          "fields": ["$id", "student_code", "student_name"]
      };

      kintone.api('/k/v1/records', 'GET', params).then(function(resp) {
          // success:生徒一覧を表示する
          var tableRecords = resp.records;
          var studentTable = document.createElement('table');
          studentTable.style.border = "1px solid black";
          var caption = studentTable.createCaption();
          caption.appendChild(document.createTextNode('生徒一覧'));
          var tableHeader = studentTable.createTHead();
          var tr = tableHeader.insertRow(-1);
          tr.style.border = "1px solid black";
          var th1 = document.createElement('th');
          th1.style.border = "1px solid black";
          var th2 = document.createElement('th');
          th2.style.border = "1px solid black";
          tr.appendChild(th1);
          tr.appendChild(th2);

          th1.appendChild(document.createTextNode('コード'));
          th2.appendChild(document.createTextNode('氏名'));

          studentTable.appendChild(tableHeader);

          var body = document.createElement('tbody');
          for (var i=0; i < tableRecords.length; i++)
          {
            var row = body.insertRow(-1);
            row.style.border = "1px solid black";
            var cell1 = row.insertCell(-1);
            cell1.style.border = "1px solid black"
            var cell2 = row.insertCell(-1);
            cell2.style.border = "1px solid black"

            var link = document.createElement('a');
            link.href = "/k/104/show#record=" + tableRecords[i].$id.value;
            link.target = "_blank";
            link.text = tableRecords[i].student_code.value;
            cell1.appendChild(link);
            cell2.appendChild(document.createTextNode(tableRecords[i].student_name.value));

          }

          studentTable.appendChild(body);

          subtableSpace.appendChild(studentTable);
      }, function(error) {
          //error:エラーの場合はメッセージを表示する
          var errmsg = 'レコード取得時にエラーが発生しました。';
          // レスポンスにエラーメッセージが含まれる場合はメッセージを表示する
          if (error.message !== undefined) {
              errmsg += '\n' + error.message;
          }
          subtableSpace.appendChild(document.createTextNode(errmsg));
      });

      return event;


    });
})();
