const official=[
['En. Pemandu 01','PMD-001','Unit Kenderaan','D / E','18/07/2027','Aktif'],
['En. Pemandu 02','PMD-002','Unit Kenderaan','D / E','03/11/2027','Aktif'],
['En. Pemandu 03','PMD-003','Unit Kenderaan','D','22/02/2028','Aktif']
];
const alternates=[
['Puan Staf Gantian 01','STF-1042','Unit Pentadbiran','D','30/08/2027','Sah','SKP/PK/2026/018'],
['Encik Staf Gantian 02','STF-1188','Unit Teknikal','D / E','15/01/2028','Sah','SKP/PK/2026/021']
];
const history=[
['02/10/2026','PKJ-2026-0030','En. Pemandu 02','Rasmi','SEDAN IKTBN 02','Pemandu','Lengkap'],
['02/10/2026','PKJ-2026-0031','Pemandu Gantian 01','Gantian','VAN IKTBN 01','Pemandu','Lengkap'],
['03/10/2026','PKJ-2026-0032','En. Pemandu 03','Rasmi','EV IKTBN 01','Pemandu','Lengkap'],
['03/10/2026','PKJ-2026-0033','Pemandu Gantian 02','Gantian','BAS IKTBN 01','Pemandu','Menunggu Log']
];
function card(v,isAlt=false){return `<div class="driver"><div class="driverhead"><div style="display:flex;gap:10px"><div class="avatar">${v[0].split(' ').map(x=>x[0]).slice(0,2).join('')}</div><div><h2>${v[0]}</h2><small>${v[2]} · ${v[1]}</small></div></div><span class="badge ${isAlt?'alternate':'official'}">${isAlt?'Pemandu Gantian':'Pemandu Rasmi'}</span></div><div class="driverinfo"><div><span>Kelas Lesen</span><b>${v[3]}</b></div><div><span>Luput Lesen</span><b>${v[4]}</b></div></div>${isAlt?`<div class="license">📄 Surat Lantikan Pengarah <b>${v[6]} · ✓ Disahkan</b></div>`:`<div class="license">✓ Jawatan warant perjawatan · status ${v[5]}</div>`}<div class="actionsrow"><button class="secondary" onclick="toast('Profil pemandu dibuka')">Lihat Profil</button><button class="secondary" onclick="toast('Sejarah tugasan dibuka')">Sejarah</button></div></div>`}
function render(){let q=search.value.toLowerCase();officialBox.innerHTML=official.filter(v=>v.join(' ').toLowerCase().includes(q)).map(v=>card(v)).join('');alternateBox2.innerHTML=alternates.filter(v=>v.join(' ').toLowerCase().includes(q)).map(v=>card(v,true)).join('');historyRows.innerHTML=history.filter(v=>v.join(' ').toLowerCase().includes(q)).map(v=>`<tr><td>${v[0]}</td><td>${v[1]}</td><td><b>${v[2]}</b></td><td>${v[3]}</td><td>${v[4]}</td><td>${v[5]}</td><td><span class="badge ${v[6]==='Lengkap'?'okbadge':'warnbadge'}">${v[6]}</span></td></tr>`).join('')}
const officialBox=document.querySelector('#official'),alternateBox2=document.querySelector('#alternate');render();search.oninput=render;
document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));t.classList.add('active');['official','alternate','history'].forEach(id=>document.getElementById(id).classList.add('hidden'));document.getElementById(t.dataset.tab).classList.remove('hidden')});
addBtn.onclick=()=>driverModal.classList.remove('hidden');closeDriver.onclick=()=>driverModal.classList.add('hidden');cancelDriver.onclick=()=>driverModal.classList.add('hidden');
authorityBtn.onclick=()=>{authorityModal.classList.remove('hidden');authorityList.innerHTML=alternates.map(v=>`<div class="auth"><div class="authrow"><b>${v[0]}</b><span class="badge official">✓ DISAHKAN</span></div><p>${v[6]} · Tarikh lantikan sah · Dokumen PDF tersedia</p><button onclick="toast('Dokumen lantikan dibuka')">Lihat Dokumen</button></div>`).join('')};
closeAuthority.onclick=()=>authorityModal.classList.add('hidden');
driverForm.onsubmit=e=>{e.preventDefault();const status=e.target.querySelectorAll('select')[1].value; if(status==='Pemandu Gantian' && !appointmentFile.files.length){toast('Tidak boleh simpan: surat lantikan Pengarah wajib.');return}driverModal.classList.add('hidden');toast('Profil pemandu berjaya direkodkan.');e.target.reset()};
function toast(x){const t=document.querySelector('#toast');t.textContent=x;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2300)}
