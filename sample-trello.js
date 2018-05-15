(function() {
    'use strict';
    const key = '8e9d3d79fb998bec392d4619c591e11e';//Trello API key
    const token = '5e6eff83c066eb1c4a72d1afe84d93ae95b6f27f52ce8dbaac979f37343356a0';//Trello Token
    const idList = '5adf7f268a838ad62e5d9781';
    const trelloURL = 'https://api.trello.com';

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


          kintone.proxy(trelloURL+ '/1/cards?idList=' + idList+'&name='+to_do+'&desc='+details+'&due='+due_date+'&key=' + key + '&token=' + token, 'POST', {}, {}).then(function(args) {
              //success
              /*  args[0] -> body(文字列)
               *  args[1] -> status(数値)
               *  args[2] -> headers(オブジェクト)
               */
              var responseBody =  JSON.parse(args[0]);
              console.log(args[0]);
              var cardId = responseBody.id;
              console.log(cardId);
              var attachments = rec.Attachments.value;//添付ファイルの取得
              if (attachments)
              {
                  for(var i=0;i < attachments.length;i++)
                  {
                    var fileKey = attachments[i].fileKey;
                    console.log('fileKey: ' + fileKey);
                    getfile(cardId, fileKey);
                  }
              }
          }, function(error) {
              //error
              console.log(error);  //proxy APIのレスポンスボディ(文字列)を表示
          });
        }
      }
    });

    function getfile(id, filekey){
      //var url = 'https://devxorudc.cybozu.com/k/v1/file.json?fileKey=' + filekey;
      var xhr = new XMLHttpRequest();
    　xhr.open('GET', 'https://devxorudc.cybozu.com/k/v1/file.json?fileKey=' + filekey);
    　xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    　xhr.responseType = 'blob';
    　xhr.onload = function() {
    　 if (xhr.status === 200) {
    　     // success
    　　　 var blob = new Blob([xhr.response]);

          uploadFile(id, blob);
    　　　//var url = window.URL || window.webkitURL;
    　　　//var blobUrl = url.createObjectURL(blob);
    　　　//console.log(blobUrl);
    　 } else {
    　   // error
    　   console.log(xhr.responseText);
    　 }
      };
      xhr.send();
    }

    function uploadFile(id, blob){
      var data = {
          'format': 'RAW',
          'value': blob
      }

      kintone.proxy.upload(trelloURL+'/1/cards/' + id + '/attachments'+'?key=' + key + '&token=' + token, 'POST', {}, data).then(function(args) {
          //success
          /*  args[0] -> body(文字列)
           *  args[1] -> status(数値)
           *  args[2] -> headers(オブジェクト)
           */
          console.log(args[0]);
      }, function(error) {
          //error
          console.log(error);  //proxy APIのレスポンスボディ(文字列)を表示
      });
    }
})();
