const data=[
{id:'PKJ-2026-0031',name:'Pemohon A',dept:'Bahagian Pengurusan',phone:'012-3456789',date:'02/10/2026',time:'07:00',loc:'Kuala Lumpur',purpose:'Mesyuarat rasmi',need:'Tunggu',letter:true,status:'Menunggu Semakan',conflict:false},
{id:'PKJ-2026-0030',name:'Pemohon B',dept:'Unit Latihan',phone:'013-2223344',date:'03/10/2026',time:'08:00',loc:'Seremban',purpose:'Urusan rasmi',need:'Tidak Tunggu',letter:true,status:'Menunggu Penjadualan',conflict:false},
{id:'PKJ-2026-0029',name:'Pemohon C',dept:'Kejuruteraan',phone:'014-8889911',date:'04/10/2026',time:'09:00',loc:'Putrajaya',purpose:'Program jabatan',need:'Tunggu',letter:true,status:'Conflict',conflict:true},
{id:'PKJ-2026-0028',name:'Pemohon D',dept:'Akademik',phone:'016-2221111',date:'05/10/2026',time:'07:30',loc:'Melaka',purpose:'Lawatan rasmi',need:'Tunggu',letter:true,status:'Menunggu Semakan',conflict:false},
{id:'PKJ-2026-0027',name:'Pemohon E',dept:'Pentadbiran',phone:'019-7771122',date:'06/10/2026',time:'08:00',loc:'Shah Alam',purpose:'Urusan rasmi',need:'Tidak Tunggu',letter:true,status:'Menunggu Penjadualan',conflict:false}
];
let selected=null,current='';
const rows=document.querySelector('#rows');
function badge(s){return s==='Conflict'?'redbadge':s==='Menunggu Penjadualan'?'bluebadge':'orangebadge'}
function render(){const q=search.value.toLowerCase();rows.innerHTML=data.filter(x=>(!q||JSON.stringify(x).toLowerCase().includes(q))&&(!current||x.status===current)&&(!typeFilter.value||x.need===typeFilter.value)).map(x=>`<tr><td><b>${x.id}</b></td><td>${x.name}<br><small>${x.dept}</small></td><td>${x.date}<br>${x.time}</td><td>${x.loc}</td><td>${x.need}</td><td>${x.letter?'🟢 Ada':'🔴 Tiada'}</td><td><span class="badge ${badge(x.status)}">${x.status}</span></td><td><button class="view" onclick="openApproval('${x.id}')">Semak</button></td></tr>`).join('')}
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');current=b.dataset.status;render()});
search.oninput=render;typeFilter.onchange=render;
window.openApproval=function(id){selected=data.find(x=>x.id===id);modal.classList.remove('hidden');modalTitle.textContent=selected.id;modalSub.textContent=selected.purpose;dApplicant.textContent=selected.name;dDept.textContent=selected.dept;dPhone.textContent=selected.phone;dDate.textContent=selected.date+' · '+selected.time;dLocation.textContent=selected.loc;dPurpose.textContent=selected.purpose;need.value=selected.need;vehicle.value='';driver.value='';updateCheck()};
function updateCheck(){const hasV=!!vehicle.value,hasD=!!driver.value,conf=selected&&selected.conflict;vehicleCheck.textContent=hasV?(conf?'Kenderaan pilihan bertembung dengan jadual lain':'Kenderaan tersedia untuk slot ini'):'Pilih kenderaan untuk semakan';vehicleState.textContent=hasV?(conf?'✕ CONFLICT':'✓ TERSEDIA'):'—';vehicleState.className=hasV?(conf?'bad':'ok'):'';driverCheck.textContent=hasD?(conf?'Pemandu mempunyai pertindihan jadual':'Pemandu tersedia untuk slot ini'):'Pilih pemandu untuk semakan';driverState.textContent=hasD?(conf?'✕ CONFLICT':'✓ TERSEDIA'):'—';scheduleCheck.textContent=conf?'Pertindihan jadual dikesan — perlu pilihan lain':'Tiada pertindihan dikesan';scheduleState.textContent=conf?'✕ CONFLICT':'✓ OK';overall.textContent=conf?'PERLU SEMAKAN':'LULUS UNTUK DIJADUALKAN';overall.className='badge '+(conf?'redbadge':'greenbadge')}
[vehicle,driver].forEach(x=>x.onchange=updateCheck);
close.onclick=()=>modal.classList.add('hidden');
approve.onclick=()=>{if(!vehicle.value||!driver.value)return toast('Pilih kenderaan dan pemandu dahulu.');if(selected.conflict)return toast('Conflict dikesan. Pilih kenderaan/pemandu lain.');selected.status='Menunggu Penjadualan';modal.classList.add('hidden');render();toast('Permohonan diluluskan dan dijadualkan.')};
returnBtn.onclick=()=>{selected.status='Menunggu Semakan';modal.classList.add('hidden');render();toast('Permohonan dipulangkan untuk pembetulan.')};
reject.onclick=()=>{selected.status='Tidak Diluluskan';modal.classList.add('hidden');render();toast('Permohonan ditandakan tidak diluluskan.')};
function toast(x){const t=document.querySelector('#toast');t.textContent=x;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2300)}
render();
