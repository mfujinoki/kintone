(function() {
    'use strict';
    const key = '8e9d3d79fb998bec392d4619c591e11e';//Trello API key
    const token = '5e6eff83c066eb1c4a72d1afe84d93ae95b6f27f52ce8dbaac979f37343356a0';//Trello Token
    const idList = '5adf7f268a838ad62e5d9781';
    kintone.events.on(['app.record.detail.process.proceed'], function(event) {
      //ステータスが承認されたら実行
      if(event.nextStatus.value == '承認')
      {
        //レコードのデータの取得
        var rec = event.record;

        if (rec) {
          var to_do = rec.To_Do.value;
          console.log(to_do);
          var due_date = rec.Duedate.value;
          console.log(due_date);
          var details = rec.Details.value;
          console.log(details);
          var attachments = rec.Attachments.value;
          if (attachments)
          {
              for(var i=0;i < attachments.values.length;i++)
              {
                console.log('fileKey: ' + attachments[i].fileKey);
                console.log('name: ' + attachments[i].name);
              }
          }

          kintone.proxy('https://api.trello.com/1/cards?idList='+idList+'&name='+to_do+'&desc='+details+'&due='+due_date+'&key=' + key + '&token=' + token, 'POST', {}, {}).then(function(args) {
              //success
              /*  args[0] -> body(文字列)
               *  args[1] -> status(数値)
               *  args[2] -> headers(オブジェクト)
               */
              //var responseBody =  JSON.parse(args[0]);
              console.log(args[0]);

          }, function(error) {
              //error
              console.log(error);  //proxy APIのレスポンスボディ(文字列)を表示
          });
        }
      }
    });
})();
