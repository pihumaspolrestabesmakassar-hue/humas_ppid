/* news.js - meng-handle penyimpanan berita, pencarian, tampilan daftar & detail */

// Helper: load image file as base64 (returns Promise)
function fileToBase64(file){
  return new Promise((resolve, reject)=>{
    if(!file) return resolve(null);
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = e => reject(e);
    reader.readAsDataURL(file);
  });
}

// Simpan berita (dipanggil dari index.html atau dashboard)
async function saveNews({title, content, category, file, editIndex=null}){
  const newsArray = JSON.parse(localStorage.getItem('news')) || [];
  const imageData = file ? await fileToBase64(file) : null;
  const newsObj = {
    title, content, category, image: imageData || 'Tidak ada gambar',
    date: new Date().toLocaleString()
  };

  if(editIndex !== null){
    newsArray[editIndex] = newsObj;
  } else {
    newsArray.push(newsObj);
  }
  localStorage.setItem('news', JSON.stringify(newsArray));
}

// INDEX: upload form handling (index.html)
if(document.getElementById('news-form')){
  const form = document.getElementById('news-form');
  const imageInput = document.getElementById('image');
  const preview = document.getElementById('image-preview');

  imageInput.addEventListener('change', function(){
    const f = this.files[0];
    if(!f){ preview.innerHTML = ''; return; }
    const reader = new FileReader();
    reader.onload = e => preview.innerHTML = `<img src="${e.target.result}" style="max-width:200px;border-radius:8px">`;
    reader.readAsDataURL(f);
  });

  form.addEventListener('submit', async function(e){
    e.preventDefault();
    const title = document.getElementById('title').value.trim();
    const content = document.getElementById('content').value.trim();
    const category = document.getElementById('category').value;
    const file = document.getElementById('image').files[0];

    if(!title || !content){ alert('Judul & konten wajib diisi'); return; }
    await saveNews({title, content, category, file});
    form.reset(); preview.innerHTML = '';
    alert('Berita berhasil diupload (simulasi).');
  });
}

// BERITA: render list + search + filter
function renderNewsList(containerId='news-list', searchTerm = '', filterCat='all'){
  const listEl = document.getElementById(containerId);
  if(!listEl) return;
  const newsArray = JSON.parse(localStorage.getItem('news')) || [];
  if(newsArray.length === 0){ listEl.innerHTML = `<div class="no-news">Belum ada berita yang dipublikasikan.</div>`; return; }

  const filtered = newsArray
    .map((n,i)=>({...n,index:i}))
    .filter(n=>{
      const term = searchTerm.toLowerCase();
      const matchTerm = n.title.toLowerCase().includes(term) || n.content.toLowerCase().includes(term) || n.category.toLowerCase().includes(term);
      const matchCat = filterCat === 'all' ? true : n.category === filterCat;
      return matchTerm && matchCat;
    })
    .reverse();

  listEl.innerHTML = '';
  filtered.forEach(n=>{
    listEl.innerHTML += `
      <div class="news-card">
        <div class="news-title"><a href="detail.html?id=${n.index}">${n.title}</a></div>
        <div class="date">${n.date} • ${n.category}</div>
        ${n.image && n.image !== 'Tidak ada gambar' ? `<img src="${n.image}" class="thumb">` : ''}
        <p>${n.content.length>200? n.content.slice(0,200)+'...': n.content}</p>
      </div>
    `;
  });
}

// Hook pencarian di berita.html
if(document.getElementById('search')){
  const s = document.getElementById('search');
  const f = document.getElementById('filter-cat');
  function rerender(){ renderNewsList('news-list', s.value||'', f.value||'all'); }
  s.addEventListener('input', rerender);
  f.addEventListener('change', rerender);
  // initial
  renderNewsList('news-list','', 'all');
}

// DETAIL: render detail based on ?id=
if(document.getElementById('news-detail')){
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const arr = JSON.parse(localStorage.getItem('news')) || [];
  const el = document.getElementById('news-detail');
  if(!id || !arr[id]){
    el.innerHTML = `<div class="news-detail">Berita tidak ditemukan.</div>`;
  } else {
    const n = arr[id];
    el.innerHTML = `
      <div class="news-detail">
        <h2>${n.title}</h2>
        <div class="date">${n.date} • ${n.category}</div>
        ${n.image && n.image !== 'Tidak ada gambar' ? `<img src="${n.image}" class="thumb">` : ''}
        <div class="content">${n.content.replace(/\n/g, '<br>')}</div>
      </div>
    `;
  }
}

// Jika pemanggilan global, export fungsi (untuk dashboard dll)
window.renderNewsList = renderNewsList;
window.saveNews = saveNews;
