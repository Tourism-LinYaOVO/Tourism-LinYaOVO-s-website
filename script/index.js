/* ===== 运行时长 ===== */
const START_TIME = new Date('2026-04-20T12:02:00Z').getTime();
function updateRuntime() {
  const diff = Date.now() - START_TIME;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  document.getElementById('runtime').innerHTML =
    `本站已运行 <span>${d}</span> 天 <span>${h}</span> 时 <span>${m}</span> 分 <span>${s}</span> 秒`;
}
updateRuntime();
setInterval(updateRuntime, 1000);

/* ===== 加载数据并渲染 ===== */
fetch('./data.json')
  .then(res => res.json())
  .then(categories => {
    const tabBar = document.getElementById('tab-bar');
    const contentContainer = document.getElementById('content-container');

    categories.forEach((cat, index) => {
      // 1. 创建 Tab 按钮
      const tab = document.createElement('div');
      tab.className = 'tab-item';
      if (index === 0) tab.classList.add('active');
      tab.textContent = cat.category;
      tab.onclick = () => switchTab(index);
      tabBar.appendChild(tab);

      // 2. 创建内容区域
      const area = document.createElement('div');
      area.className = 'content-area';
      area.id = `content-${index}`;
      if (index === 0) area.classList.add('active');

      // 3. 创建混合容器
      const mixedContainer = document.createElement('div');
      mixedContainer.className = 'mixed-container';

      // 4. 处理分类
      if (cat.file) {
        // 情况 A：直接是文档
        const docDiv = document.createElement('div');
        docDiv.className = 'doc-content';
        docDiv.id = `doc-${index}`;
        docDiv.innerHTML = '<p>加载中...</p>';
        mixedContainer.appendChild(docDiv);
        loadDoc(docDiv, cat.file);
      } else if (cat.items) {
        // 情况 B：混合内容
        cat.items.forEach((item, itemIndex) => {
          if (item.type === 'link') {
            const card = document.createElement('a');
            card.className = 'card';
            card.href = item.url;
            card.target = '_blank';
            card.innerHTML = `<img src="${item.icon}"><div><h3>${item.title}</h3><p>${item.desc}</p></div>`;
            mixedContainer.appendChild(card);
          } else if (item.type === 'markdown') {
            const docDiv = document.createElement('div');
            docDiv.className = 'doc-content';
            docDiv.id = `doc-${index}-${itemIndex}`;
            docDiv.innerHTML = '<p>加载中...</p>';
            mixedContainer.appendChild(docDiv);
            loadDoc(docDiv, item.file);
          }
        });
      }

      area.appendChild(mixedContainer);
      contentContainer.appendChild(area);
    });
  });

/* ===== 切换 Tab ===== */
function switchTab(index) {
  document.querySelectorAll('.tab-item').forEach((tab, i) => tab.classList.toggle('active', i === index));
  document.querySelectorAll('.content-area').forEach((area, i) => area.classList.toggle('active', i === index));
}

/* ===== 加载文档 ===== */
function loadDoc(container, filePath) {
  fetch(filePath)
    .then(res => res.ok ? res.text() : Promise.reject('文件未找到'))
    .then(markdown => {
      container.innerHTML = marked.parse(markdown);
    })
    .catch(err => {
      container.innerHTML = `<p style="color:#ff6b6b;">加载失败：${err}</p>`;
    });
}
