// メインJavaScript

document.addEventListener('DOMContentLoaded', () => {
  // プラグイン情報をGitHubから自動取得
  async function loadPluginInfo() {
    const pluginCards = document.querySelectorAll('[data-plugin]');

    for (const card of pluginCards) {
      const pluginName = card.getAttribute('data-plugin');

      try {
        // GitHub Releases APIから最新リリースを取得
        const response = await fetch(`https://api.github.com/repos/tekuteku3210/kintone-plugins/releases`);
        if (!response.ok) throw new Error('Failed to fetch releases');

        const releases = await response.json();

        // 指定されたプラグインのリリースを探す（タグ名が "{plugin-name}-v" で始まるもの）
        const pluginRelease = releases.find(r => r.tag_name.startsWith(`${pluginName}-v`));

        if (pluginRelease) {
          // バージョン表記を更新（tag_nameから "tab-view-v1.1.0" → "v1.1.0"）
          const version = pluginRelease.tag_name.replace(`${pluginName}-`, '');
          const versionSpan = card.querySelector('.plugin-version');
          if (versionSpan) {
            versionSpan.textContent = version;
          }

          // 日付を更新（published_atから "YYYY-MM-DD" → "YYYY年M月"）
          const dateSpan = card.querySelector('.plugin-date');
          if (dateSpan) {
            const publishedDate = new Date(pluginRelease.published_at);
            const year = publishedDate.getFullYear();
            const month = publishedDate.getMonth() + 1;
            dateSpan.textContent = `${year}年${month}月`;
          }

          // ダウンロードリンクを更新
          const downloadLink = card.querySelector('.plugin-download');
          if (downloadLink && pluginRelease.assets.length > 0) {
            // assetsの中から .zip ファイルを探す
            const zipAsset = pluginRelease.assets.find(a => a.name.endsWith('.zip'));
            if (zipAsset) {
              downloadLink.href = zipAsset.browser_download_url;
              downloadLink.setAttribute('download', zipAsset.name);
            }
          }
        }
      } catch (error) {
        console.error(`プラグイン情報の取得に失敗しました (${pluginName}):`, error);
        // エラー時はデフォルト表示のまま
        const versionSpan = card.querySelector('.plugin-version');
        if (versionSpan && versionSpan.textContent === '読み込み中...') {
          versionSpan.textContent = '-';
        }
      }
    }
  }

  // ページ読み込み時にプラグイン情報を取得
  loadPluginInfo();

  // モバイルメニューの切り替え
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  // タブ切り替え（無償/有償プラグイン）
  const tabFree = document.getElementById('tab-free');
  const tabPremium = document.getElementById('tab-premium');
  const freePlugins = document.getElementById('free-plugins');
  const premiumPlugins = document.getElementById('premium-plugins');

  if (tabFree && tabPremium && freePlugins && premiumPlugins) {
    tabFree.addEventListener('click', () => {
      // タブのスタイル変更
      tabFree.classList.add('tab-active');
      tabFree.classList.remove('text-gray-600', 'hover:text-gray-900');
      tabPremium.classList.remove('tab-active');
      tabPremium.classList.add('text-gray-600', 'hover:text-gray-900');

      // コンテンツの表示切り替え
      freePlugins.classList.remove('hidden');
      premiumPlugins.classList.add('hidden');
    });

    tabPremium.addEventListener('click', () => {
      // タブのスタイル変更
      tabPremium.classList.add('tab-active');
      tabPremium.classList.remove('text-gray-600', 'hover:text-gray-900');
      tabFree.classList.remove('tab-active');
      tabFree.classList.add('text-gray-600', 'hover:text-gray-900');

      // コンテンツの表示切り替え
      premiumPlugins.classList.remove('hidden');
      freePlugins.classList.add('hidden');
    });
  }

  // スムーズスクロール（アンカーリンク）
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  anchorLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;

      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const headerHeight = 80; // ヘッダーの高さ
        const targetPosition = target.offsetTop - headerHeight;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });

        // モバイルメニューを閉じる
        if (mobileMenu) {
          mobileMenu.classList.add('hidden');
        }
      }
    });
  });

  // スクロールアニメーション（フェードイン）
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // アニメーション対象要素を監視
  const animateElements = document.querySelectorAll('.card-hover, .feature-item');
  animateElements.forEach(el => observer.observe(el));

  // ダウンロードボタンのクリック追跡（将来的にアナリティクスと連携可能）
  const downloadButtons = document.querySelectorAll('a[download]');
  downloadButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const pluginName = button.getAttribute('href').split('/').pop();
      console.log(`Download: ${pluginName}`);
      // Google Analytics等のトラッキングコードをここに追加可能
      // gtag('event', 'download', { plugin_name: pluginName });
    });
  });

  // お知らせ機能
  const STORAGE_KEY = 'kintone-plugins-read-announcements';
  const notificationBell = document.getElementById('notification-bell');
  const notificationBadge = document.getElementById('notification-badge');
  const announcementModal = document.getElementById('announcement-modal');
  const closeModal = document.getElementById('close-modal');
  const announcementList = document.getElementById('announcement-list');

  // 既読お知らせIDを取得
  function getReadAnnouncements() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }

  // 既読お知らせIDを保存
  function saveReadAnnouncements(ids) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }

  // お知らせIDを既読にする
  function markAsRead(id) {
    const readIds = getReadAnnouncements();
    if (!readIds.includes(id)) {
      readIds.push(id);
      saveReadAnnouncements(readIds);
    }
  }

  // カテゴリごとの色とアイコンを取得
  function getCategoryStyle(type) {
    const styles = {
      release: { color: 'text-blue-600', bg: 'bg-blue-100', icon: 'fa-rocket', label: 'リリース' },
      feature: { color: 'text-green-600', bg: 'bg-green-100', icon: 'fa-star', label: '新機能' },
      update: { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: 'fa-wrench', label: '更新' },
      notice: { color: 'text-purple-600', bg: 'bg-purple-100', icon: 'fa-bell', label: 'お知らせ' }
    };
    return styles[type] || styles.notice;
  }

  // お知らせを表示
  function renderAnnouncements(announcements) {
    const readIds = getReadAnnouncements();

    if (announcements.length === 0) {
      announcementList.innerHTML = `
        <div class="text-center text-gray-500 py-8">
          <i class="fas fa-inbox text-5xl mb-4 opacity-50"></i>
          <p class="text-lg">お知らせはありません</p>
        </div>
      `;
      return;
    }

    announcementList.innerHTML = announcements.map(item => {
      const isRead = readIds.includes(item.id);
      const style = getCategoryStyle(item.type);

      return `
        <div class="announcement-item relative mb-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer ${isRead ? 'opacity-60' : ''}"
             data-id="${item.id}"
             data-url="${item.url || '#'}">
          ${!isRead ? '<span class="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full"></span>' : ''}
          <div class="flex items-start ${!isRead ? 'ml-4' : ''}">
            <div class="${style.bg} ${style.color} w-10 h-10 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
              <i class="fas ${style.icon}"></i>
            </div>
            <div class="flex-1">
              <div class="flex items-center mb-1">
                <span class="${style.bg} ${style.color} text-xs px-2 py-1 rounded-full font-semibold mr-2">${style.label}</span>
                <span class="text-xs text-gray-500">${item.date}</span>
              </div>
              <h3 class="font-bold text-gray-900 mb-1">${item.title}</h3>
              <p class="text-sm text-gray-600 whitespace-pre-line">${item.description}</p>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // お知らせアイテムのクリックイベント
    document.querySelectorAll('.announcement-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.getAttribute('data-id');
        const url = item.getAttribute('data-url');

        markAsRead(id);
        updateBadge(announcements);

        // URLがあれば遷移
        if (url && url !== '#') {
          window.open(url, '_blank');
        }

        // 既読スタイルを適用
        item.classList.add('opacity-60');
        const dot = item.querySelector('.bg-blue-500');
        if (dot) dot.remove();
      });
    });
  }

  // バッジを更新
  function updateBadge(announcements) {
    const readIds = getReadAnnouncements();
    const unreadCount = announcements.filter(a => !readIds.includes(a.id)).length;

    if (unreadCount > 0) {
      notificationBadge.textContent = unreadCount > 99 ? '99+' : unreadCount;
      notificationBadge.classList.remove('hidden');
      notificationBadge.classList.add('flex');
    } else {
      notificationBadge.classList.add('hidden');
      notificationBadge.classList.remove('flex');
    }
  }

  // GitHubリリース情報を取得
  async function fetchGitHubReleases() {
    try {
      const response = await fetch('https://api.github.com/repos/tekuteku3210/kintone-plugins/releases');
      if (!response.ok) {
        console.warn('GitHub Releases APIの取得に失敗しました');
        return [];
      }
      const releases = await response.json();

      // リリース情報をお知らせ形式に変換
      return releases.map(release => {
        // リリースノートから最初の数行を抽出（descriptionとして使用）
        const body = release.body || '';
        const lines = body.split('\n').filter(line => line.trim());
        const description = lines.slice(0, 5).join('\n'); // 最初の5行を使用

        return {
          id: `release-${release.tag_name}`,
          type: 'release',
          title: release.name || release.tag_name,
          description: description || 'リリースノートはありません',
          date: release.published_at.split('T')[0], // ISO日付からYYYY-MM-DD形式に変換
          url: release.html_url
        };
      });
    } catch (error) {
      console.error('GitHubリリース情報の取得エラー:', error);
      return [];
    }
  }

  // お知らせデータを読み込み（GitHubリリースのみ）
  // 将来的にGitHub Discussionsを追加する場合は、ここに統合ロジックを追加
  async function loadAnnouncements() {
    try {
      // GitHubリリースを取得
      const announcements = await fetchGitHubReleases();

      if (announcements.length === 0) {
        announcementList.innerHTML = `
          <div class="text-center text-gray-500 py-8">
            <i class="fas fa-inbox text-5xl mb-4 opacity-50"></i>
            <p class="text-lg">お知らせはまだありません</p>
          </div>
        `;
        return;
      }

      renderAnnouncements(announcements);
      updateBadge(announcements);
    } catch (error) {
      console.error('お知らせの読み込みに失敗しました:', error);
      announcementList.innerHTML = `
        <div class="text-center text-red-500 py-8">
          <i class="fas fa-exclamation-triangle text-5xl mb-4"></i>
          <p class="text-lg">お知らせの読み込みに失敗しました</p>
        </div>
      `;
    }
  }

  // モーダルを開く
  if (notificationBell && announcementModal) {
    notificationBell.addEventListener('click', () => {
      announcementModal.classList.remove('hidden');
      announcementModal.classList.add('flex');
      loadAnnouncements();
    });
  }

  // モーダルを閉じる
  if (closeModal && announcementModal) {
    closeModal.addEventListener('click', () => {
      announcementModal.classList.add('hidden');
      announcementModal.classList.remove('flex');
    });

    // 背景クリックで閉じる
    announcementModal.addEventListener('click', (e) => {
      if (e.target === announcementModal) {
        announcementModal.classList.add('hidden');
        announcementModal.classList.remove('flex');
      }
    });
  }

  // ページ読み込み時にバッジを更新
  loadAnnouncements();
});
