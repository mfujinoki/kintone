/*
 *  Card view sample program
 * Copyright (c) 2020 Cybozu
 *
 * Licensed under the MIT License
*/
(function() {
  'use strict';
  /* ファイルダウンロード関数 (Promise)
    * kintoneレコードの添付ファイルのfileKeyの値から、画像ファイルをダウンロード
    * parameter: fileKey
    * return: ファイルURL
    */
  const downLoadFile = (fileKey) => {
    return new kintone.Promise((resolve, reject) => {
      if (fileKey !== null) {
        const apiurl = '/k/v1/file.json?fileKey=' + fileKey;
        const xhr = new XMLHttpRequest();
        xhr.open('GET', apiurl, true);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.responseType = 'blob';
        xhr.onload = () => {
          if (xhr.status === 200) {
            // success
            const blob = new Blob([xhr.response]);
            const url = window.URL || window.webkitURL;
            resolve(url.createObjectURL(blob));
          } else {
            reject('Downloading file failed.');
          }
        };
        xhr.send();
      } else {
        resolve(''); // fileKeyがnullの場合、返り値にブランクを設定
      }
    });
  };
    /* For Loop関数 (非同期)
    * param: kintone event オブジェクト
    * 各レコードによるCard Viewのエレメントの生成
    */
  const forLoop = async (event) => {
    const records = event.records;
    let cardView = '';
    for (let i = 0, max = records.length; max > i; i++) {
      const record = records[i];
      const name = record.last_name.value + ' ' + record.first_name.value;
      const company = record.company.value;
      const detailLink = 'show#record=' + record.$id.value + '&l.view=' + event.viewId + '&l.q&mode=show';// レコード詳細ページへのリンク
      const facebook = record.facebook.value;
      const linked_in = record.linked_in.value;
      const instagram = record.instagram.value;
      const fileKey = record.profile_image.value.length > 0 ? record.profile_image.value[0].fileKey : null;// 添付ファイルがない場合、Nullを設定します。
      const imageUrl = await downLoadFile(fileKey);// ファイルをダウンロードし、URLを生成。非同期なので、結果を待ちます。
      if (i % 6 === 0) {
        cardView += '<div class="row">';// １列に６レコード表示し、改行します。
      }
      // １レコード毎にカードビューのHTMLを生成します。
      cardView += '<div class="card-deck">' +
          '<div class="card">' +
            '<img class="card-img-top" src="' + imageUrl + '" alt="Card image">' +
            '<div class="card-body">' +
              '<h4 class="card-title">' + name + '</h4>' +
              '<p class="card-text">' + company + '</p>' +
              '<a href="' + detailLink + '" class="btn btn-primary"> 詳細 </a>' +
            '</div>' +
            '<div class="card-footer">' +
              '<button class="button light" onclick="window.location.href=\'' + facebook + '\'"><i class="fab fa-facebook"></i></button>' +
              '<button class="button light" onclick="window.location.href=\'' + linked_in + '\'"><ion-icon name="logo-linkedin"></ion-icon></button>' +
              '<button class="button light" onclick="window.location.href=\'' + instagram + '\'"><ion-icon name="logo-instagram"></ion-icon></button>' +
            '</div>' +
          '</div>' +
        '</div>';
      if (i % 6 === 5 || i === max - 1) {
        cardView += '</div>';// 行の最後にdivをクローズします。
      }
    }
    const cardViewEl = document.getElementById('card-view');// カスタマイズビューのエレメントを取得
    // 増殖防止
    while (cardViewEl.hasChildNodes()) {
      cardViewEl.removeChild(cardViewEl.firstChild);
    }
    cardViewEl.innerHTML = cardView;// 生成したカードビューをカスタマイズビューに出力
  };
    // レコード一覧イベント
  kintone.events.on('app.record.index.show', (event) => {
    if (event.viewId !== 5684516) { // 作成したカスタマイズビューのIDを指定
      return event;
    }
    try {
      forLoop(event);
    } catch (error) {
      console.log(error);
    }
    return event;
  });
})();
  