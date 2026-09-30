const fleet=[['VAN 01',38,3200],['SEDAN 02',31,2850],['BAS 01',22,4100],['LORI 01',16,4760],['EV 01',19,1824]];
fleetChart.innerHTML=fleet.map(x=>`<div class="barcol"><div class="bar" style="--h:${x[1]*3.2}px"></div><b>${x[1]} trip</b><span>${x[0]}</span></div>`).join('');
const drivers=[['EP','En. Pemandu 01',38],['EP','En. Pemandu 02',31],['EP','En. Pemandu 03',26],['PG','Pemandu Gantian 01',18],['PG','Pemandu Gantian 02',13]];
document.querySelector('#drivers').innerHTML=drivers.map(x=>`<div class="driverrow"><div class="avatar">${x[0]}</div><div><b>${x[1]}</b><div class="miniBar"><i style="width:${x[2]/38*100}%"></i></div></div><strong>${x[2]} trip</strong></div>`).join('');
const reports=[['📊','Ringkasan Pengurusan','KPI keseluruhan operasi'],['🚗','Penggunaan Kenderaan','Trip, mileage & utilisasi'],['🛣','Perjalanan & Kilometer','Lokasi, jarak & tempoh'],['⛽','Bahan Api & Kad Minyak','Liter, transaksi & kos'],['⚡','EV & Pengecasan','kWh, trip & kecekapan'],['🔧','Penyelenggaraan & Kos','Servis, vendor & kos'],['👤','Pemandu','Aktiviti & rekod tugasan'],['⚠','Kemalangan & Insiden','Kes, status & tindakan']];
document.querySelector('#reports').innerHTML=reports.map((r,i)=>`<div class="report" onclick="openReport('${r[1]}')"><b>${r[0]} ${r[1]}</b><span>${r[2]}</span></div>`).join('');
function openReport(name){modal.classList.remove('hidden');reportType.value=name;toast('Jenis laporan dipilih: '+name)}
reportBtn.onclick=()=>modal.classList.remove('hidden');close.onclick=()=>modal.classList.add('hidden');period.onchange=()=>toast('Dashboard ditukar kepada '+period.value);
function toast(x){const t=document.querySelector('#toast');t.textContent=x;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}
