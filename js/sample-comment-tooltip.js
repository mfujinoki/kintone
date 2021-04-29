/*
 * Comment tooltip sample program
 * Copyright (c) 2021 Cybozu
 *
 * Licensed under the MIT License
*/
(function() {
    'use strict';
    // Luxon 日付フォーマット用のライブラリー
    const DateTime = luxon.DateTime;
    // レコード一覧イベント
  kintone.events.on('app.record.index.show', (event) => {
    if (event.viewId !== 5684546) {return event;} // 作成した一覧のIDを指定
    const elements = kintone.app.getFieldElements('レコード番号');
    const appId = kintone.app.getId();
    elements.forEach(element => {
      const id = element.innerText;
      const body = {
        'app': appId,
        'record': id
      };   
      kintone.api(kintone.api.url('/k/v1/record/comments', true), 'GET', body, (resp) => {
        // success
        let comments = '<br/>';
        if (resp.comments.length == 0) {
          return;
        }
        for (let i = 0; i < 3; i++)
        {
          let comment = resp.comments[i];
          let commentText = comment.text;
          let createdDate = new Date(comment.createdAt);
          if (commentText.length > 50) {
              commentText = commentText.substring(0, 50) + '...'; 
          }
          comments += '<div style="border:1px solid orange; border-radius: 5px; background-color: orange; padding: 5px;"><div>' + 
            comment.id + ': ' + comment.creator.name + '[' + DateTime.fromJSDate(createdDate).toLocaleString(DateTime.DATETIME_MED) + // 日付をLuxonフォーマットに変換
            ']' +'</div>' + '<div>' + commentText + '</div></div><br/>';
        }
        tippy(element, { 
          content: comments,
          allowHTML: true,
          theme: 'light',
        });
        
      }, (error) => {
        // error
        console.log(error);
      });
    });
    console.log(elements);  
    return event;
  });
})();