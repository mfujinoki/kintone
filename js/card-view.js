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
      if (i % 5 === 0) {
        cardView += '<div class="row m-2">';// １列に5レコード表示し、改行します。
      }
      // １レコード毎にカードビューのHTMLを生成します。
      cardView += '<div class="m-1 cell-2 border bd-light">' +
        '<div class="card image-header float-left">' +
          '<div class="card-header fg-white"' +
            'style="background-image: url(' + imageUrl + ')">' +
          '</div>' +
        '</div>' +
        '<div class="card-content p-2">' +
          '<div class="name">' + name + '</div>' +
          '<div class="title">' + company + '</div>' +
          '<a href="' + detailLink + '" class="more"> 詳細 <span class="mif-arrow-right"></span></a>' +
        '</div>' +
        '<div class="card-footer">' +
          '<button class="button light" onclick="window.location.href=\'' + facebook + '\'"><span class="mif-facebook"></span></button>' +
          '<button class="button light" onclick="window.location.href=\'' + linked_in + '\'"><span class="mif-linkedin"></span></button>' +
          '<button class="button light" onclick="window.location.href=\'' + instagram + '\'"><span class="mif-instagram"></span></button>' +
        '</div>' +
      '</div>';
      if (i % 5 === 4 || i === max - 1) {
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
    if (event.viewId !== 5684508) { // 作成したカスタマイズビューのIDを指定
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
