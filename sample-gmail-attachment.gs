function sendToKintone() {
  'use strict';
  Logger.log('Function called');
  var subdomain = "2t48w.kintone.com";//サブドメイン名
  var scriptProperties = PropertiesService.getScriptProperties();
  var apps = {
    YOUR_APPLICATION1: { appid: scriptProperties.getProperty('AppId'), name: "Contact from Gmail", token: scriptProperties.getProperty('ApiToken') }
  };
  var manager = new KintoneManager.KintoneManager(subdomain, apps);// ライブラリーの初期化
  var records = JSON.parse(getGmailMessage());// JSON形式に変換
  var response = manager.create("YOUR_APPLICATION1", records);//kintone レコードの生成
  // ステータスコード
  // 成功すれば200になる
  var code = response.getResponseCode();
  Logger.log('Response code is "%s"', code);
}
function getGmailMessage() {
  var threads = GmailApp.search('is:unread subject:(Fuji Business International) has:attachment'); // Get all unread threads with the subject in inbox
  var records = '[';
  for (var i = 0; i < threads.length; i++) {
    var messages = threads[i].getMessages();// Get messages
    for (var j = 0; j < messages.length; j++) {
      var message = messages[j];
      var attachments = message.getAttachments();
      var fileKeys = '';
      for (var k = 0; k < attachments.length; k++) {
        Logger.log('Message "%s" contains the attachment "%s" (%s bytes)',
                   message.getSubject(), attachments[k].getName(), attachments[k].getSize());
        var fileKey = uploadAttachment(attachments[k]);
        if(fileKey != null)
        {
          fileKeys += fileKey + ',';
        }
      }
      records += Utilities.formatString('{"name": { "value": "%s" }', replaceCharacters(message.getFrom()));//送信者の名前の取得
      records += ',' + Utilities.formatString('"email" : { "value": "%s" }', replaceCharacters(message.getReplyTo()));//送信者のメールアドレス取得
      records += ',' + Utilities.formatString('"subject" : { "value": "%s" }', replaceCharacters(message.getSubject()));//メール題目の取得
      records += ',' + Utilities.formatString('"message" : { "value": "%s" }', replaceCharacters(message.getPlainBody()));//メッセージの取得
      if (fileKeys.length > 0)
      {
        if(fileKeys.match(',$'))
        {
          fileKeys = fileKeys.substring(0,fileKeys.length - 1);
        }
        records += ',' + Utilities.formatString('"Attachment":{"value":[ %s ]}', fileKeys);//File Keyの設定
      }
      records += '},';
      message.markRead(); // Mark as read
    }
  }
  if (records.match(',$'))
  {
    records = records.substring(0,records.length - 1);
  }
  records += ']';
  Logger.log('Response JSON is "%s"', records);
  return records;
}
function uploadAttachment(attachment)
{
  var blob = attachment.copyBlob();
  // Make a POST request with form data.
  var formData = {
    'file': blob
  };
  var scriptProperties = PropertiesService.getScriptProperties();
  var formHeader = {
    'X-Requested-With' : 'XMLHttpRequest',
    'X-Cybozu-API-Token' : scriptProperties.getProperty('ApiToken')
  };
  // Because payload is a JavaScript object, it will be interpreted as
  // as form data. (No need to specify contentType; it will automatically
  // default to either 'application/x-www-form-urlencoded'
  // or 'multipart/form-data')
  var options = {
    'method' : 'post',
    'headers' : formHeader,
    'payload' : formData
  };
  return UrlFetchApp.fetch('https://2t48w.kintone.com/k/v1/file.json', options);
}
function replaceCharacters(str)
{
  return str
  .replace(/"/g,"\'")
  .replace(/\n/g, "\\n")
  .replace(/\r/g, "\\r")
  .replace(/\t/g, "\\t");
}
