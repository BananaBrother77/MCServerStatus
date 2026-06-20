const toolCategories = [
  {
    name: 'Available',
    icon: 'search',
    tools: [
      { name: 'Server Status', href: 'server-status.html' },
      { name: 'Player Lookup', href: 'player-viewer.html' },
    ],
  },
];

function buildSidebarHTML() {
  let html = '';
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  for (const category of toolCategories) {
    html += `<div class="tool-category">`;
    html += `<h4 class="tool-category-title"><i data-lucide="${category.icon}" width="16" height="16"></i> ${category.name}</h4>`;
    html += `<ul class="tool-category-list">`;

    for (const tool of category.tools) {
      const isSoon = tool.href === '#';
      const isActive = !isSoon && tool.href === currentPage;
      const classes = [
        'tool-nav-link',
        isSoon ? 'disabled' : '',
        isActive ? 'active' : '',
      ]
        .filter(Boolean)
        .join(' ');

      html += `<li>`;
      html += `<a href="${tool.href}" class="${classes}"${isSoon ? ' aria-disabled="true" tabindex="-1"' : ''}${isActive ? ' aria-current="page"' : ''}>`;
      html += `<span>${tool.name}</span>`;
      if (isSoon) html += `<span class="soon-badge">Soon</span>`;
      html += `</a>`;
      html += `</li>`;
    }

    html += `</ul>`;
    html += `</div>`;
  }

  return html;
}

function createSidebar() {
  if (document.getElementById('toolNavSidebar')) return;

  const sidebar = document.createElement('aside');
  sidebar.id = 'toolNavSidebar';
  sidebar.className = 'sidebar tool-nav-sidebar';
  sidebar.innerHTML = `
    <div class="sidebar-header">
      <h3>Tools</h3>
      <button id="closeToolNavBtn" aria-label="Close tools navigation">&times;</button>
    </div>
    <div class="tool-nav-content">
      ${buildSidebarHTML()}
    </div>
  `;

  const overlay = document.createElement('div');
  overlay.id = 'toolNavOverlay';
  overlay.className = 'sidebar-overlay';

  document.body.appendChild(sidebar);
  document.body.appendChild(overlay);

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function initToolNav() {
  createSidebar();

  const sidebar = document.getElementById('toolNavSidebar');
  const overlay = document.getElementById('toolNavOverlay');
  const closeBtn = document.getElementById('closeToolNavBtn');
  const toggleBtn = document.getElementById('toolNavBtn');

  function openSidebar() {
    sidebar.classList.add('active');
    overlay.classList.add('active');
  }

  function closeSidebar() {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
  }

  if (toggleBtn) toggleBtn.addEventListener('click', openSidebar);
  if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
  if (overlay) overlay.addEventListener('click', closeSidebar);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('active')) {
      closeSidebar();
    }
  });
}

initToolNav();
