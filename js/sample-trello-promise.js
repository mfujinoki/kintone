(function() {
    'use strict';
    var key = config.TRELLO_API_KEY;//Trello API key
    var token = config.TRELLO_API_TOKEN;//Trello Token
    var idList = '5adf7f268a838ad62e5d9781';//List ID
    var trelloURL = 'https://api.trello.com';//Trello API URL

    /*Trelloへの添付ファイルアップロード関数*/
    function fileUpload(id, fileName, blob) {
        return new Promise(function(resolve, reject) {
            var formData = new FormData();//FormDataのオブジェクト作成
            formData.append("file", blob , fileName);//ファイル内容とファイル名を設定
            //Trello APIにより、添付ファイルをカードに追加
            var url = trelloURL + '/1/cards/' + id + '/attachments?key=' + key + '&token=' + token;
            var xhr = new XMLHttpRequest();
            xhr.open('POST', url);
            xhr.onload = function() {
                if (xhr.status === 200) {
                    // successful
                    console.log(xhr.responseText);
                    resolve(xhr.response);
                } else {
                    // fails
                    console.log(xhr.responseText);
                    reject(Error('File upload error:' + xhr.statusText));
                }
            };
            xhr.onerror = function() {
                reject(Error('There was a file upload error.'));
            };
            xhr.send(formData);
        });
    }
    /*kintoneの添付ファイルダウンロード関数*/
    function fileDownload(id, fileName, fileKey) {
        return new Promise(function(resolve, reject) {
            var url = kintone.api.url('/k/v1/file', true) + '?fileKey=' + fileKey;//kintone API ファイルダウンロードメソッド
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url);
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            xhr.responseType = 'blob';//blog形式で取得
            xhr.onload = function() {
                if (xhr.status === 200) {//処理成功時のみ実行
                    // successful
                    var blob = new Blob([xhr.response]);//ファイル内容の取得
                    uploadFile(id, fileName, blob);//ファイルアップロード関数の呼び出し

                    resolve(xhr.response);
                } else {
                    // fails
                    console.log(xhr.responseText);
                    reject(Error('File download error:' + xhr.statusText));
                }
            };
            xhr.onerror = function() {
                reject(Error('There was a file download error.'));
            };
            xhr.send();
        });
    }
    kintone.events.on(['app.record.detail.process.proceed'], function(event) {//プロセスの変更時のトリガーイベント
            //ステータスが承認なら実行
            if (event.nextStatus.value === '承認') {
                //レコードのデータの取得
                var rec = event.record;

                if (rec) {
                    var to_do = rec.To_Do.value;//To Do名
                    console.log(to_do);
                    var due_date = rec.Duedate.value;//締切日
                    console.log(due_date);
                    var details = rec.Details.value;//詳細内容
                    console.log(details);

                    //Trello APIで新規にカードを追加
                    kintone.proxy(trelloURL + '/1/cards?idList=' + idList + '&name=' + encodeURIComponent(to_do) + '&desc=' + encodeURIComponent(details) +
                    '&due=' + due_date + '&key=' + key + '&token=' + token, 'POST', {}, {}).then(function(args) {
                        //success
                        /*  args[0] -> body(文字列)
                        *  args[1] -> status(数値)
                        *  args[2] -> headers(オブジェクト)
                        */
                        var responseBody = JSON.parse(args[0]);
                        console.log(args[0]);
                        var cardId = responseBody.id;//追加されたカードのIDを取得
                        console.log(cardId);

                        var attachments = rec.Attachments.value;//添付ファイルの取得
                        if (attachments) {
                            for (var i = 0; i < attachments.length; i++) {
                                var fileKey = attachments[i].fileKey;//添付ファイルのFile Keyを取得
                                console.log('fileKey: ' + fileKey);
                                var fileName = attachments[i].name;//添付ファイル名を取得
                                console.log(fileName);
                                getfile(cardId, fileName, fileKey);//ファイルダウンロード関数の呼び出し
                            }
                        }
                    }, function(error) {
                        //error
                        console.log(error);  //proxy APIのレスポンスボディ(文字列)を表示
                    });
                }
            }
    });
})();
