// メインJavaScript

document.addEventListener('DOMContentLoaded', () => {
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
});
