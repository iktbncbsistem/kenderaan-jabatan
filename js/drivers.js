const drivers=[
{name:'En. Ahmad bin Ali',type:'Rasmi',role:'Pemandu Rasmi • Jawatan 01',phone:'06-000 0001',license:'D / E',expiry:'15/08/2027',status:'Aktif',letter:'—'},
{name:'En. Rahman bin Hassan',type:'Rasmi',role:'Pemandu Rasmi • Jawatan 02',phone:'06-000 0002',license:'D / E',expiry:'20/11/2027',status:'Aktif',letter:'—'},
{name:'En. Zulkifli bin Omar',type:'Rasmi',role:'Pemandu Rasmi • Jawatan 03',phone:'06-000 0003',license:'D / E',expiry:'04/03/2027',status:'Aktif',letter:'—'},
{name:'En. Faizal bin Ahmad',type:'Gantian',role:'Pemandu Gantian Institut',phone:'06-000 0010',license:'D / E',expiry:'18/06/2027',status:'Aktif',letter:'IKTBN.CHB/PP/2026/014'},
{name:'Pn. Noraini binti Hassan',type:'Gantian',role:'Pemandu Gantian Institut',phone:'06-000 0011',license:'D',expiry:'22/09/2027',status:'Aktif',letter:'IKTBN.CHB/PP/2026/019'},
{name:'En. Mohd Firdaus',type:'Gantian',role:'Pemandu Gantian Institut',phone:'06-000 0012',license:'D / E',expiry:'01/12/2026',status:'Aktif',letter:'IKTBN.CHB/PP/2026/022'},
{name:'En. Azlan Rahim',type:'Gantian',role:'Pemandu Gantian Institut',phone:'06-000 0013',license:'D',expiry:'17/01/2027',status:'Aktif',letter:'IKTBN.CHB/PP/2026/027'},
{name:'En. Hafiz Salleh',type:'External',role:'Pemandu Agensi • Jabatan X',phone:'012-000 1001',license:'D / E',expiry:'12/05/2027',status:'Rekod Perjalanan',letter:'—'},
{name:'En. Kamal Ismail',type:'External',role:'Pemandu Agensi • Jabatan Y',phone:'012-000 1002',license:'D',expiry:'30/07/2027',status:'Rekod Perjalanan',letter:'—'},
{name:'En. Shukri Musa',type:'External',role:'Pemandu Agensi • Program Z',phone:'012-000 1003',license:'D / E',expiry:'09/10/2027',status:'Rekod Perjalanan',letter:'—'}
];
const grid=document.getElementById('driverGrid');let activeTab='all';
function initials(n){return n.replace('En. ','').replace('Pn. ','').split(' ').slice(0,2).map(x=>x[0]).join('')}
function render(){
 const q=document.getElementById('search').value.toLowerCase();
 const list=drivers.filter(d=>(activeTab==='all'||(activeTab==='official'&&d.type==='Rasmi')||(activeTab==='alternate'&&d.type==='Gantian')||(activeTab==='external'&&d.type==='External'))&&(!q||`${d.name} ${d.role} ${d.license}`.toLowerCase().includes(q)));
 grid.innerHTML=list.map(d=>`<article class="driver-card"><div class="driver-top"><div class="avatar-lg">${initials(d.name)}</div><div><div class="driver-name">${d.name}</div><div class="driver-role">${d.role}</div></div></div><div class="driver-lines"><div class="line"><span>Telefon</span><strong>${d.phone}</strong></div><div class="line"><span>Lesen</span><strong>${d.license}</strong></div><div class="line"><span>Tamat Lesen</span><strong>${d.expiry}</strong></div><div class="line"><span>Status</span><strong>${d.status}</strong></div></div><div class="driver-footer"><span class="pill ${d.type==='Rasmi'?'green':d.type==='Gantian'?'amber':'purple'}">${d.type==='Rasmi'?'PEMANDU RASMI':d.type==='Gantian'?'PEMANDU GANTIAN':'PEMANDU AGENSI'}</span>${d.type==='Gantian'?`<span class="pill blue">📄 Surat Sah</span>`:''}</div></article>`).join('');
}
document.getElementById('search').addEventListener('input',render);
document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));t.classList.add('active');activeTab=t.dataset.tab;render()});
const modal=document.getElementById('modal');document.getElementById('addDriver').onclick=()=>modal.classList.remove('hidden');document.getElementById('close').onclick=()=>modal.classList.add('hidden');document.getElementById('cancel').onclick=()=>modal.classList.add('hidden');
document.getElementById('form').onsubmit=e=>{e.preventDefault();modal.classList.add('hidden');showToast('Rekod pemandu disimpan (demo)');e.target.reset()};
function showToast(m){const t=document.getElementById('toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1800)}
render();
