/*
 * 回答の条件によって別フィールドの表示/非表示を切り替えるサンプルプログラム
 * Copyright (c) 2014 Cybozu
 * 
 * Licensed under the MIT License
 */
(function() {
    "use strict";

    //レコードの追加、編集、詳細画面で適用する
    var events = ['app.record.detail.show',
                  'app.record.create.show',
                  'app.record.create.change.past',
                  'app.record.create.change.radio2',
                  'app.record.create.change.radio3',
                  'app.record.create.change.radio4',
                  'app.record.create.change.radio5',
                  'app.record.edit.show',
                  'app.record.edit.change.past',
                  'app.record.edit.change.radio2',
                  'app.record.edit.change.radio3',
                  'app.record.edit.change.radio4',
                  'app.record.edit.change.radio5'];

    kintone.events.on(events, function(event) {

        var record = event.record;

        //1問目になにも選択されていなかった場合は「その他」フィールドを表示しない
        var past = record['past']['value'];
        if (past.length === 0) {
            kintone.app.record.setFieldShown('other', false);
        }

        //1問目で「その他」が選択された場合は「その他」フィールドを表示する
        for (var i = 0; i < past.length; i++) {
            if (past[i] === 'その他') {
                kintone.app.record.setFieldShown('other', true);
            }else {
                kintone.app.record.setFieldShown('other', false);
            }

        }

        //2問目の回答に応じて「予防接種名」フィールドの表示、非表示を切り替える
        if (record['radio2']['value'] === 'ある') {
            kintone.app.record.setFieldShown('vaccination', true);
        }else {
            //「ない」の場合は非表示
            kintone.app.record.setFieldShown('vaccination', false);
        }

        //3問目の回答に応じて「病名」「発症した時期」フィールドの表示、非表示を切り替える
        if (record['radio3']['value'] === 'いいえ') {
            kintone.app.record.setFieldShown('disease', false);
            kintone.app.record.setFieldShown('date3', false);
        }else {
            //「はい」の場合は「病名」「時期」を表示する
            kintone.app.record.setFieldShown('disease', true);
            kintone.app.record.setFieldShown('date3', true);
        }

        //4問目の回答に応じて「アレルギーの原因」「症状」フィールドの表示、非表示を切り替える
        if (record['radio4']['value'] === 'ない') {
            kintone.app.record.setFieldShown('cause', false);
            kintone.app.record.setFieldShown('symptom', false);
        }else {
            //「ある」の場合は「病名」「時期」を表示する
            kintone.app.record.setFieldShown('cause', true);
            kintone.app.record.setFieldShown('symptom', true);
        }

        //5問目の回答に応じて「詳細」フィールドの表示、非表示を切り替える
        if (record['radio5']['value'] === 'ない') {
            kintone.app.record.setFieldShown('detail', false);
        }else {
            //「ある」の場合は「病名」「時期」を表示する
            kintone.app.record.setFieldShown('detail', true);
        }

    });
})(); 