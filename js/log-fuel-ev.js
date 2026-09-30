const data=[
['02/10/2026','VAN IKTBN 01','En. Pemandu 01','Kuala Lumpur','12450','12510','Diesel','32.50 L','Lengkap'],
['02/10/2026','SEDAN IKTBN 02','En. Pemandu 02','Seremban','58220','58305','Petrol','18.20 L','Lengkap'],
['02/10/2026','EV IKTBN 01','En. Pemandu 03','Putrajaya','8450','8528','Elektrik','21.40 kWh','Lengkap'],
['03/10/2026','BAS IKTBN 01','Pemandu Gantian','Melaka','33210','33380','Diesel','46.70 L','Belum Lengkap'],
['04/10/2026','LORI IKTBN 01','En. Pemandu 01','Shah Alam','21180','21245','Diesel','24.10 L','Lengkap']
];
const rows=document.querySelector('#rows');
function render(){let q=search.value.toLowerCase();rows.innerHTML=data.filter(x=>(!q||x.join(' ').toLowerCase().includes(q))&&(!mode.value||x[6]===mode.value)&&(!logStatus.value||x[8]===logStatus.value)).map(x=>`<tr><td>${x[0]}</td><td><b>${x[1]}</b></td><td>${x[2]}</td><td>${x[3]}</td><td>${x[4]}</td><td>${x[5]}</td><td>${x[6]}</td><td>${x[7]}</td><td><span class="badge ${x[8]==='Lengkap'?'ok':'pending'}">${x[8]}</span></td><td><button class="secondary" onclick="toast('Rekod dibuka')">Lihat</button></td></tr>`).join('')}
[search,mode,logStatus].forEach(x=>x.addEventListener('input',render));[mode,logStatus].forEach(x=>x.addEventListener('change',render));
newBtn.onclick=()=>modal.classList.remove('hidden');close.onclick=()=>modal.classList.add('hidden');cancel.onclick=()=>modal.classList.add('hidden');
cardBtn.onclick=()=>cardModal.classList.remove('hidden');closeCard.onclick=()=>cardModal.classList.add('hidden');charge.onclick=()=>chargeModal.classList.remove('hidden');closeCharge.onclick=()=>chargeModal.classList.add('hidden');
[startKm,endKm].forEach(x=>x.oninput=()=>{distance.value=(Number(endKm.value)>=Number(startKm.value)&&endKm.value&&startKm.value)?(Number(endKm.value)-Number(startKm.value)).toFixed(1)+' km':''});
form.onsubmit=e=>{e.preventDefault();toast('Buku log berjaya direkodkan.');modal.classList.add('hidden');form.reset()};
handoverForm.onsubmit=e=>{e.preventDefault();holder.textContent=e.target.querySelectorAll('select')[1].value;cardModal.classList.add('hidden');toast('Serahan kad minyak direkodkan. Pemegang semasa dikemas kini.')};
chargeForm.onsubmit=e=>{e.preventDefault();chargeModal.classList.add('hidden');toast('Rekod pengecasan EV berjaya disimpan.');e.target.reset()};
function toast(x){const t=document.querySelector('#toast');t.textContent=x;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}render();
