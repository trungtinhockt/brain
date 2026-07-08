// Đồng Bộ - khởi tạo trang sau khi mở khoá (tìm kiếm + sơ đồ liên kết)
function initSiteSearch(dataJson) {
  const input = document.getElementById('site-search');
  const results = document.getElementById('search-results');
  if (!input || !results) return;
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { results.style.display = 'none'; return; }
    const matches = dataJson.filter(d => d[1].toLowerCase().includes(q) || d[2].toLowerCase().includes(q)).slice(0, 8);
    if (!matches.length) { results.style.display = 'none'; return; }
    results.innerHTML = matches.map(m => `<a href="insight${m[0]}.html" style="display:block;padding:8px 12px;font-size:12.5px;border-bottom:1px solid var(--border-light);">#${m[0]} ${m[1]}</a>`).join('');
    results.style.display = 'block';
  });
  input.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') {
      const q = input.value.trim().toLowerCase();
      const m = dataJson.find(d => d[1].toLowerCase().includes(q) || d[2].toLowerCase().includes(q));
      if (m) window.location.href = `insight${m[0]}.html`;
    }
  });
  document.addEventListener('click', (ev) => {
    if (!ev.target.closest('.searchbox') && !ev.target.closest('#search-results')) results.style.display = 'none';
  });
}

function initIndexPage() {
  const DATA = window.INSIGHT_DATA || [];
  initSiteSearch(DATA);
  const svg = document.getElementById('graph-svg');
  if (svg && window.renderGraph) {
    renderGraph(svg, { onNavigate: (id) => { window.location.href = `insight${id}.html`; } });
  }
  // Sidebar toggle for mobile
  const toggle = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  if (toggle && sidebar) {
    toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
  }
}
