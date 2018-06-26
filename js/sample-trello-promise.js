(function() {
    'use strict';
    var key = config.TRELLO_API_KEY;//Trello API key
    var token = config.TRELLO_API_TOKEN;//Trello Token
    var idList = '5adf7f268a838ad62e5d9781';//List ID
    var trelloURL = 'https://api.trello.com';//Trello API URL

    /*Trelloへの添付ファイルアップロード関数*/
    function uploadFile(id, fileName, blob) {
        return new kintone.Promise(function(resolve, reject) {
            var formData = new FormData();//FormDataのオブジェクト作成
            formData.append("file", blob, fileName);//ファイル内容とファイル名を設定
            //Trello APIにより、添付ファイルをカードに追加
            var url = trelloURL + '/1/cards/' + id + '/attachments?key=' + key + '&token=' + token;
            var xhr = new XMLHttpRequest();
            xhr.open('POST', url);
            xhr.onload = function() {
                if (xhr.status === 200) {
                    // successful
                    resolve(xhr.responseText);
                } else {
                    // fails
                    reject('File upload error:' + xhr.statusText);
                }
            };
            xhr.onerror = function() {
                reject('There was a file upload error.');
            };
            xhr.send(formData);
        });
    }
    /*kintoneの添付ファイルダウンロード関数*/
    function downloadFile(id, fileName, fileKey) {
        return new kintone.Promise(function(resolve, reject) {
            var xhr = new XMLHttpRequest();
            var params = {
                "fileKey": fileKey
            };
            var url = kintone.api.urlForGet('/k/v1/file', params);//kintoneのファイルダウンロードAPIのUrlを設定
            xhr.open('GET', url);
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            xhr.responseType = 'blob';//blog形式で取得
            xhr.onload = function() {
                if (xhr.status === 200) {//処理成功時のみ実行
                    // successful
                    var blob = new Blob([xhr.response]);//ファイル内容の取得
                    resolve(blob);
                } else {
                    // fails
                    reject('File download error:' + xhr.statusText);
                }
            };
            xhr.onerror = function() {
                reject('There was a file download error.');
            };
            xhr.send();
        });
    }
    //複数ファイルのダウンロード関数
    function downloadFiles(files, fileNum) {
        var opt_fileNum = fileNum || 0;
        return downloadFile(files[opt_fileNum].cardId, files[opt_fileNum].fileName, files[opt_fileNum].fileKey).then(function(blob) {
            return uploadFile(files[opt_fileNum].cardId, files[opt_fileNum].fileName, blob).then(function(resp) {
                opt_fileNum++;
                if (opt_fileNum < files.length) {
                    return downloadFiles(files, opt_fileNum);
                }
            });
        });
    }
    kintone.events.on(['app.record.detail.process.proceed'], function(event) {//プロセスの変更時のトリガーイベント
        //ステータスが承認以外なら処理中止
        if (event.nextStatus.value !== '承認') {
            return event;
        }
        //レコードのデータの取得
        var rec = event.record;
        //レコードがない場合、処理中止
        if (!rec) {
            return event;
        }
        var to_do = rec.To_Do.value;//To Do名
        console.log(to_do);
        var due_date = rec.Duedate.value;//締切日
        console.log(due_date);
        var details = rec.Details.value;//詳細内容
        console.log(details);

        //Trello APIで新規にカードを追加
        return kintone.proxy(trelloURL + '/1/cards?idList=' + idList + '&name=' + encodeURIComponent(to_do) +
            '&desc=' + encodeURIComponent(details) + '&due=' + due_date + '&key=' + key + '&token=' + token,
            'POST', {}, {}).then(function(args) {
                if (args[1] === 200) {
                    //success
                    var responseBody = JSON.parse(args[0]);
                    var cardId = responseBody.id;//追加されたカードのIDを取得
                    var attachments = rec.Attachments.value;//添付ファイルの取得
                    if (attachments && attachments.length > 0) {
                        var files = [];
                        for (var i = 0; i < attachments.length; i++) {
                            var fileKey = attachments[i].fileKey;//添付ファイルのFile Keyを取得
                            console.log('fileKey: ' + fileKey);
                            var fileName = attachments[i].name;//添付ファイル名を取得
                            console.log(fileName);
                            var file = {};
                            file['cardId'] = cardId;//カードのID
                            file['fileKey'] = attachments[i].fileKey;//添付ファイルのFile Key
                            file['fileName'] = attachments[i].name;//添付ファイル名
                            files.push(file);
                        }
                        return downloadFiles(files);
                    }
                } else {
                    event.error = args[0];
                    return event;
                }
            }).catch(function(error) {
                //error
                console.log(error);
                event.error = error;
                return event;
            });
    });
})();