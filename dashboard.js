/* dashboard.js - kelola berita: tampilkan, edit, hapus (admin lokal) */

function openModal(editIndex=null){
  const modal = document.getElementById('modal');
  modal.setAttribute('aria-hidden','false');
  const title = document.getElementById('modal-title');
  document.getElementById('m-title').value = '';
  document.getElementById('m-content').value = '';
  document.getElementById('m-category').value = 'Pengumuman';
  document.getElementById('m-preview').innerHTML = '';
  document.getElementById('delete-news').style.display = 'none';
  modal.dataset.edit = '';

  if(editIndex !== null){
    const arr = JSON.parse(localStorage.getItem('news')) || [];
    const n = arr[editIndex];
    if(n){
      title.innerText = 'Edit Berita';
      document.getElementById('m-title').value = n.title;
      document.getElementById('m-content').value = n.content;
      document.getElementById('m-category').value = n.category || 'Pengumuman';
      if(n.image && n.image!=='Tidak ada gambar') document.getElementById('m-preview').innerHTML = `<img src="${n.image}" style="max-width:180px;border-radius:8px">`;
      document.getElementById('delete-news').style.display = 'inline-block';
      modal.dataset.edit = editIndex;
    }
  } else {
    title.innerText = 'Tambah Berita Baru';
  }
}

function closeModal(){
  const modal = document.getElementById('modal');
  modal.setAttribute('aria-hidden','true');
  modal.dataset.edit = '';
}

function renderAdminList(){
  const wrap = document.getElementById('admin-list');
  const arr = JSON.parse(localStorage.getItem('news')) || [];
  if(arr.length===0){ wrap.innerHTML = '<div class="no-news">Belum ada berita.</div>'; return; }
  wrap.innerHTML = '';
  arr.slice().reverse().forEach((n, idx)=>{
    const realIdx = arr.length - 1 - idx;
    const el = document.createElement('div');
    el.className = 'news-card';
    el.innerHTML = `
      <h3>${n.title}</h3>
      <div class="date">${n.date} • ${n.category}</div>
      ${n.image && n.image!=='Tidak ada gambar' ? `<img src="${n.image}" style="max-width:220px;border-radius:8px">` : ''}
      <p>${n.content.length>200? n.content.slice(0,200)+'...': n.content}</p>
      <div style="margin-top:8px">
        <button class="btn small" onclick="openModal(${realIdx})">Edit</button>
        <button class="btn danger small" onclick="deleteNews(${realIdx})">Hapus</button>
      </div>
    `;
    wrap.appendChild(el);
  });
}

async function deleteNews(index){
  if(!confirm('Yakin ingin menghapus berita ini?')) return;
  const arr = JSON.parse(localStorage.getItem('news')) || [];
  arr.splice(index,1);
  localStorage.setItem('news', JSON.stringify(arr));
  renderAdminList();
}

// Hook page
if(document.getElementById('admin-list')){
  renderAdminList();
  document.getElementById('btn-new').addEventListener('click', ()=> openModal(null));
  document.getElementById('modal-close').addEventListener('click', closeModal);

  document.getElementById('m-image').addEventListener('change', function(){
    const f = this.files[0];
    if(!f){ document.getElementById('m-preview').innerHTML=''; return; }
    const r = new FileReader();
    r.onload = e => document.getElementById('m-preview').innerHTML = `<img src="${e.target.result}" style="max-width:180px;border-radius:8px">`;
    r.readAsDataURL(f);
  });

  document.getElementById('save-news').addEventListener('click', async ()=>{
    const editIdx = document.getElementById('modal').dataset.edit;
    const title = document.getElementById('m-title').value.trim();
    const content = document.getElementById('m-content').value.trim();
    const category = document.getElementById('m-category').value;
    const file = document.getElementById('m-image').files[0];
    if(!title || !content){ alert('Judul & Konten wajib diisi'); return; }

    // gunakan fungsi saveNews dari news.js
    await window.saveNews({title, content, category, file, editIndex: editIdx===''? null: Number(editIdx)});
    closeModal();
    renderAdminList();
  });

  document.getElementById('delete-news').addEventListener('click', ()=>{
    const idx = document.getElementById('modal').dataset.edit;
    if(idx==='') return; deleteNews(Number(idx)); closeModal();
  });
}
