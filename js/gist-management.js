/*
 * Gist Management sample program
 * Copyright (c) 201９ Cybozu
 *
 * Licensed under the MIT License
*/
(function() {
    "use strict";
    const app_id = kintone.app.getId(); // kintone App Idの取得
    const octokit = new Octokit({
        //auth: config.OCTOKIT_AUTH_TOKEN,
        auth: '3d0c80240d18d027b3ec31c5066590226f8763ab',
        log: console
    });

    // Gistの新規作成
    function createGist() {
        octokit.gists.create({
            "files": {
                "sample.js": {
                    "content": "_"
                }
            }
        }).then(function(resp) {
            if (resp.status === 201) { // Statusが201だと成功
                let gist_id = resp.data.id;// Gist Idを取得
                let gist_url = resp.data.html_url;// Gist Urlを取得
                let param = {
                    "app": app_id,
                    "record": {
                        "gist_id": {
                            "value": gist_id
                        },
                        "gist_url": {
                            "value": gist_url
                        }
                    }
                };

                kintone.api(kintone.api.url('/k/v1/record', true), 'POST', param).then(function() {
                    alert('ID: ' + gist_id + ' でGistを作成しました。');
                    location.reload();
                    open(gist_url);
                }, function(error) {
                    if (error.message) {
                        alert(error.message);
                    }
                });
            } else {
                alert('Gistの作成に失敗しました!');
            }
        }).catch(function(err) {
            alert(err);
        });
    }
    // Gistのコンテンツ取得
    function getGist(gist_id) {
        return octokit.gists.get({
            "gist_id": gist_id
        }).then(function(resp) {
            if (resp.status === 200) { // Statusが200だと成功
                return resp;
            }
            alert('Gistの取得に失敗しました!');
        }).catch(function(err) {
            alert(err);
        });
    }

    kintone.events.on('app.record.index.show', function(event) {
        // 画面上部にボタンを設置
        let gistButton = document.createElement('button');
        gistButton.id = 'gist_button';
        gistButton.innerHTML = 'Gist 新規作成';
        gistButton.className = "button-simple-cybozu geo-search-btn";
        gistButton.style = "margin-left: 30px;";
        gistButton.addEventListener('click', function() {
            createGist();
        });
        kintone.app.getHeaderMenuSpaceElement().appendChild(gistButton);
        return event;
    });
    kintone.events.on(['app.record.create.show', 'app.record.edit.show', 'app.record.index.edit.show'],
        function(event) {
            event.record.gist_id.disabled = true;//Gist Idの編集を不可にする
            event.record.gist_url.disabled = true;//Gist Urlの編集を不可にする
            return event;
        }
    );
    kintone.events.on('app.record.detail.show',
        function(event) {
            // Gistのコンテンツを取得
            if (!event.record.gist_id.value) {
                return event;
            }
            getGist(event.record.gist_id.value)
                .then(function(resp) {
                    let contents = resp.data;
                    let gist_space = kintone.app.record.getSpaceElement('gist_contents');
                    let description_label = document.createElement('label');
                    if (contents.description) {
                        description_label.innerHTML = contents.description;
                    }
                    gist_space.appendChild(description_label);
                    for (let key in contents.files) {
                        let fieldset = document.createElement('fieldset');
                        let legend = document.createElement('legend');
                        let pre = document.createElement('pre');
                        let code = document.createElement('code');
                        code.className = 'prettyprint';
                        legend.innerHTML = contents.files[key].filename;
                        fieldset.appendChild(legend);
                        code.innerText = contents.files[key].content;
                        pre.appendChild(code);
                        fieldset.appendChild(pre);
                        gist_space.appendChild(fieldset);
                    }


                    // Gist編集ボタンを設置
                    // 増殖バグ回避
                    if (document.getElementById('gist_button') !== null) {
                        return event;
                    }
                    let gistButton = document.createElement('button');
                    gistButton.id = 'gist_button';
                    gistButton.innerHTML = 'Gist 編集';
                    gistButton.className = "button-simple-cybozu geo-search-btn";
                    gistButton.style = "margin-left: 30px; margin-top: 30px;";
                    gistButton.addEventListener('click', function() {
                        open(contents.html_url);
                    });
                    kintone.app.record.getSpaceElement('button_space').appendChild(gistButton);
                    PR.prettyPrint();
                });
            return event;
        });
})();
