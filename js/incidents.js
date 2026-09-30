const incidents=[
['INS-2026-001','18/03/2026 10:25','Kemalangan','SEDAN IKTBN 02','En. Pemandu 02','Seremban','Sederhana','Selesai'],
['INS-2026-002','07/05/2026 16:10','Kerosakan','VAN IKTBN 01','En. Pemandu 01','IKTBN Chembong','Rendah','Selesai'],
['INS-2026-003','19/06/2026 08:40','Kemalangan','BAS IKTBN 01','Pemandu Gantian','Melaka','Tinggi','Dalam Siasatan'],
['INS-2026-004','11/07/2026 14:20','Kerosakan','LORI IKTBN 01','En. Pemandu 03','Shah Alam','Rendah','Selesai'],
['INS-2026-005','22/09/2026 09:05','Kerosakan','EV IKTBN 01','En. Pemandu 03','IKTBN Chembong','Sederhana','Terbuka'],
['INS-2026-006','29/09/2026 17:35','Insiden Lain','VAN IKTBN 01','Pemandu Gantian','Port Dickson','Rendah','Terbuka']
];
function render(){const q=search.value.toLowerCase();rows.innerHTML=incidents.filter(x=>(!q||x.join(' ').toLowerCase().includes(q))&&(!typeFilter.value||x[2]===typeFilter.value)&&(!statusFilter.value||x[7]===statusFilter.value)).map((x,i)=>`<tr><td><b>${x[0]}</b></td><td>${x[1]}</td><td>${x[2]}</td><td>${x[3]}</td><td>${x[4]}</td><td>${x[5]}</td><td class="${x[6]==='Tinggi'?'high':x[6]==='Sederhana'?'medium':'low'}">${x[6]}</td><td><span class="badge ${x[7]==='Selesai'?'done':x[7]==='Dalam Siasatan'?'invest':'open'}">${x[7]}</span></td><td><button class="secondary" onclick="detail(${i})">Lihat</button></td></tr>`).join('')}
search.oninput=render;typeFilter.onchange=render;statusFilter.onchange=render;
function detail(i){const x=incidents[i];detailTitle.textContent=x[0]+' · '+x[2];detail.innerHTML=`<div class="detailgrid"><div class="detailbox"><small>Tarikh / Masa</small><b>${x[1]}</b></div><div class="detailbox"><small>Status</small><b>${x[7]}</b></div><div class="detailbox"><small>Kenderaan</small><b>${x[3]}</b></div><div class="detailbox"><small>Pemandu</small><b>${x[4]}</b></div><div class="detailbox"><small>Lokasi</small><b>${x[5]}</b></div><div class="detailbox"><small>Keterukan</small><b>${x[6]}</b></div></div><div class="timeline"><div><b>Laporan awal direkodkan</b><span>${x[1]}</span></div><div><b>Semakan pegawai kenderaan</b><span>Rekod dikaitkan dengan perjalanan dan kenderaan.</span></div><div><b>Tindakan susulan</b><span>${x[7]==='Selesai'?'Insiden telah ditutup selepas tindakan selesai.':'Masih memerlukan tindakan / dokumen susulan.'}</span></div></div>`;detailModal.classList.remove('hidden')}
newBtn.onclick=()=>modal.classList.remove('hidden');close.onclick=()=>modal.classList.add('hidden');cancel.onclick=()=>modal.classList.add('hidden');closeDetail.onclick=()=>detailModal.classList.add('hidden');
form.onsubmit=e=>{e.preventDefault();modal.classList.add('hidden');toast('Laporan awal insiden berjaya direkodkan.');e.target.reset()};
openAlert.onclick=()=>{statusFilter.value='Terbuka';render();toast('Paparan ditapis kepada insiden terbuka.')};filterBtn.onclick=()=>{document.querySelector('.filters').scrollIntoView({behavior:'smooth'});toast('Penapis insiden tersedia.')};
function toast(x){const t=document.querySelector('#toast');t.textContent=x;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}
render();
