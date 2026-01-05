// プラグイン詳細ページ用JavaScript

document.addEventListener('DOMContentLoaded', () => {
  // URLからプラグイン名を取得（tabview.html → "tab-view", field-conditional-display.html → "field-conditional-display"）
  const pageName = window.location.pathname.split('/').pop().replace('.html', '');
  const pluginName = pageName === 'tabview' ? 'tab-view' : pageName;

  // GitHub Releases APIから最新リリース情報を取得
  async function loadPluginDetail() {
    try {
      const response = await fetch('https://api.github.com/repos/tekuteku3210/kintone-plugins/releases');
      if (!response.ok) throw new Error('Failed to fetch releases');

      const releases = await response.json();

      // 指定されたプラグインのリリースを全て取得
      const pluginReleases = releases.filter(r => r.tag_name.startsWith(`${pluginName}-v`));

      if (pluginReleases.length === 0) {
        console.warn(`No releases found for plugin: ${pluginName}`);
        return;
      }

      // 最新リリースを取得
      const latestRelease = pluginReleases[0];
      const version = latestRelease.tag_name.replace(`${pluginName}-`, '');

      // ヘッダー部分のバージョン更新
      updateHeaderVersion(version, latestRelease.published_at);

      // ダウンロードセクション更新
      updateDownloadSection(latestRelease, version);

      // サイドバーのバージョン情報更新
      updateSidebarInfo(version, latestRelease.published_at);

      // 更新履歴セクション更新
      updateChangelogSection(pluginReleases);

    } catch (error) {
      console.error('プラグイン詳細情報の取得に失敗しました:', error);
    }
  }

  // ヘッダー部分のバージョンと日付を更新
  function updateHeaderVersion(version, publishedAt) {
    // バージョン表記を更新
    const versionSpan = document.querySelector('section.bg-gradient-to-r span.text-blue-100 i.fa-tag, section.bg-gradient-to-r span.text-green-100 i.fa-tag');
    if (versionSpan && versionSpan.parentElement) {
      versionSpan.parentElement.innerHTML = `<i class="fas fa-tag mr-2"></i>${version}`;
    }

    // 日付を更新
    const dateSpan = document.querySelector('section.bg-gradient-to-r span.text-blue-100 i.fa-calendar, section.bg-gradient-to-r span.text-green-100 i.fa-calendar');
    if (dateSpan && dateSpan.parentElement) {
      const date = new Date(publishedAt);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      dateSpan.parentElement.innerHTML = `<i class="fas fa-calendar mr-2"></i>${year}年${month}月リリース`;
    }
  }

  // ダウンロードセクションのリンクとボタン更新
  function updateDownloadSection(release, version) {
    // ZIPファイルのアセットを取得
    const zipAsset = release.assets.find(a => a.name.endsWith('.zip'));
    if (!zipAsset) return;

    // ダウンロードボタンを更新
    const downloadBtn = document.querySelector('a.bg-primary-500[download]');
    if (downloadBtn) {
      downloadBtn.href = zipAsset.browser_download_url;
      downloadBtn.setAttribute('download', zipAsset.name);
      downloadBtn.innerHTML = `<i class="fas fa-download mr-2"></i> ZIPをダウンロード (${version})`;
    }

    // GitHubで見るボタンをGitHub Releaseへのリンクに変更
    const githubBtn = document.querySelector('a.border.border-gray-300[target="_blank"]');
    if (githubBtn) {
      githubBtn.href = release.html_url;
      githubBtn.innerHTML = `<i class="fab fa-github mr-2"></i> GitHub Releaseで見る`;
    }
  }

  // サイドバーのバージョン情報更新
  function updateSidebarInfo(version, publishedAt) {
    // バージョン
    const versionDd = document.querySelector('dt:contains("バージョン")');
    if (versionDd) {
      const dd = versionDd.nextElementSibling;
      if (dd && dd.tagName === 'DD') {
        dd.textContent = version;
      }
    } else {
      // contains疑似クラスが使えないので、別の方法で探す
      const dts = document.querySelectorAll('dt');
      dts.forEach(dt => {
        if (dt.textContent.includes('バージョン')) {
          const dd = dt.nextElementSibling;
          if (dd && dd.tagName === 'DD') {
            dd.textContent = version;
          }
        }
      });
    }

    // リリース日
    const dateDts = document.querySelectorAll('dt');
    dateDts.forEach(dt => {
      if (dt.textContent.includes('リリース日')) {
        const dd = dt.nextElementSibling;
        if (dd && dd.tagName === 'DD') {
          const date = new Date(publishedAt);
          const year = date.getFullYear();
          const month = date.getMonth() + 1;
          dd.textContent = `${year}年${month}月`;
        }
      }
    });
  }

  // 更新履歴セクションを動的生成
  function updateChangelogSection(releases) {
    const changelogSection = document.querySelector('h3:has(i.fa-history)');
    if (!changelogSection) return;

    const container = changelogSection.parentElement.querySelector('.space-y-4');
    if (!container) return;

    // 既存の履歴をクリア
    container.innerHTML = '';

    // リリースごとに履歴を生成
    releases.forEach(release => {
      const version = release.tag_name.replace(`${pluginName}-`, '');
      const date = new Date(release.published_at);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      // リリースノートをパースして変更内容を抽出
      const body = release.body || '';
      const changes = parseReleaseNotes(body);

      const changelogHtml = `
        <div class="border-l-4 border-${pluginName === 'tab-view' ? 'blue' : 'green'}-500 pl-4">
          <div class="flex items-center mb-2">
            <span class="bg-${pluginName === 'tab-view' ? 'blue' : 'green'}-100 text-${pluginName === 'tab-view' ? 'blue' : 'green'}-800 px-2 py-1 rounded text-xs font-semibold mr-2">${version}</span>
            <span class="text-sm text-gray-500">${year}年${month}月</span>
          </div>
          ${changes}
        </div>
      `;

      container.insertAdjacentHTML('beforeend', changelogHtml);
    });
  }

  // リリースノートをパースして変更内容を抽出
  function parseReleaseNotes(body) {
    // マークダウンから見出しと箇条書きを抽出
    const lines = body.split('\n');
    let html = '';
    let inList = false;

    lines.forEach(line => {
      line = line.trim();

      // 見出し（## で始まる行）
      if (line.startsWith('## ')) {
        if (inList) {
          html += '</ul>';
          inList = false;
        }
        const title = line.replace('## ', '');
        // 特定の見出しは除外
        if (!title.includes('ダウンロード') && !title.includes('---')) {
          html += `<p class="text-sm text-gray-700 mb-2 font-semibold">${escapeHtml(title)}</p>`;
        }
      }
      // 箇条書き（- で始まる行）
      else if (line.startsWith('- ') || line.startsWith('* ')) {
        if (!inList) {
          html += '<ul class="text-sm text-gray-600 space-y-1 ml-4">';
          inList = true;
        }
        const text = line.replace(/^[-*] /, '');
        html += `<li>• ${escapeHtml(text)}</li>`;
      }
    });

    if (inList) {
      html += '</ul>';
    }

    return html || '<p class="text-sm text-gray-600">詳細はGitHub Releaseをご覧ください</p>';
  }

  // HTMLエスケープ
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ページ読み込み時にプラグイン詳細情報を取得
  loadPluginDetail();
});
