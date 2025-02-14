// URLのクエリパラメータを取得する関数
function getQueryParams() {
    const params = {};
    const queryString = window.location.search.substring(1);
    const regex = /([^&=]+)=([^&]*)/g;
    let m;

    while (m = regex.exec(queryString)) {
        params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
    }
    return params;
}

// ページ読み込み時にクエリパラメータを確認
window.onload = function() {
    const params = getQueryParams();

    // ?string= の場合
    if (params.string) {
        document.getElementById('base64Input').value = params.string;
        updatePreview(params.string); // プレビューを更新
    }

    // ?file= の場合
    if (params.file) {
        fetch(params.file)
            .then(response => {
                if (!response.ok) {
                    throw new Error('ネットワークエラーが発生しました。');
                }
                return response.text();
            })
            .then(data => {
                document.getElementById('base64Input').value = data;
                updatePreview(data); // データを入力した後にプレビューを更新
            })
            .catch(error => {
                alert(error.message);
            });
    }
};

// URL入力フィールドに対するイベントリスナー
document.getElementById('urlInput').addEventListener('input', function() {
    const url = this.value.trim(); // 入力されたURLを取得

    if (url) {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('ネットワークエラーが発生しました。');
                }
                return response.text();
            })
            .then(data => {
                document.getElementById('base64Input').value = data;
                updatePreview(data); // データを入力した後にプレビューを更新
            })
            .catch(error => {
                alert(error.message);
            });
    }
});

// 残りのコードはそのまま
document.getElementById('pasteButton').addEventListener('click', async function() {
    try {
        const text = await navigator.clipboard.readText();
        document.getElementById('base64Input').value = text;
        updatePreview(text); // クリップボードの内容でプレビューを更新
    } catch (error) {
        alert('クリップボードの内容を取得できませんでした。');
    }
});

// ファイル入力の変更イベント
document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            document.getElementById('base64Input').value = content;
            updatePreview(content); // ファイルの内容でプレビューを更新
        };
        reader.readAsText(file); // テキストファイルとして読み込む
    }
});

document.getElementById('base64Input').addEventListener('input', function() {
    updatePreview(this.value.trim());
});

function updatePreview(base64String) {
    let fileType = '';

    if (base64String.startsWith('iVBOR')) fileType = 'image/png';
    else if (base64String.startsWith('/9j/')) fileType = 'image/jpeg';
    else if (base64String.startsWith('R0lG')) fileType = 'image/gif';
    else if (base64String.startsWith('JVBER')) fileType = 'application/pdf';
    else if (base64String.startsWith('C94B')) fileType = 'image/webp';
    else if (base64String.startsWith('SUQz')) fileType = 'audio/mp3';
    else if (base64String.startsWith('data:video/')) fileType = 'video/mp4';
    else if (base64String.startsWith('UklGRkwc')) fileType = 'audio/wav';
    else if (base64String.startsWith('data:image/tiff;base64,')) fileType = 'image/tiff';
    else if (base64String.startsWith('data:video/quicktime;base64,')) fileType = 'video/quicktime';

    // すべてのプレビュー要素を非表示にする
    ['image', 'audio', 'video', 'pdf'].forEach(id => {
        document.getElementById(id).style.display = 'none';
    });

    if (base64String && fileType) {
        const fullBase64String = `data:${fileType};base64,${base64String}`;
        const element = document.getElementById(fileType.startsWith('image/') ? 'image' :
                                               fileType.startsWith('audio/') ? 'audio' :
                                               fileType.startsWith('video/') ? 'video' : 'pdf');
        element.src = fullBase64String;
        element.style.display = 'block';
    }
}

