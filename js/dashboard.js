const kpis=[
 {icon:'🚗',title:'Jumlah Kenderaan',value:'124',sub:['Aktif 112','Tidak Aktif 6']},
 {icon:'👤',title:'Jumlah Pemandu',value:'38',sub:['Utama 3','Gantian 5']},
 {icon:'▣',title:'Permohonan Pending',value:'7',sub:['Baharu 4','Proses 3']},
 {icon:'⚡',title:'Tenaga / Bahan Api',value:'3,482 L',sub:['Kos RM7,296','EV 1,284 kWh']},
 {icon:'🔧',title:'Penyelenggaraan Due',value:'5',sub:['Akan Datang 12','Lewat 3']},
 {icon:'🛡',title:'Insurans / Cukai',value:'4',sub:['≤ 30 hari 4','Lewat 2']}
];
document.getElementById('kpiGrid').innerHTML=kpis.map(k=>`<article class="kpi"><div class="icon">${k.icon}</div><h4>${k.title}</h4><div class="value">${k.value}</div><div class="sub"><span>${k.sub[0]}</span><span>${k.sub[1]}</span></div></article>`).join('');

const bars=[['WVD 1234','3,420',82],['WVD 5678','2,850',68],['WVD 9012','1,960',51],['WVD 3456','1,420',38],['WVD 7890','980',27]];
document.getElementById('vehicleChart').innerHTML=bars.map(b=>`<div class="bar"><strong>${b[1]}</strong><i style="--h:${b[2]*2}px"></i><span>${b[0]}</span></div>`).join('');

const requests=[
 ['29/09/2026','Ahmad Bin Ali','Mesyuarat di Putrajaya','—','Baharu','blue'],
 ['28/09/2026','Siti Nor Aisyah','Program latihan','Lulus','Dalam Proses','amber'],
 ['27/09/2026','Mohd Razak','Lawatan tapak, Seremban','Lulus','Selesai','green'],
 ['26/09/2026','Norhafizah','Urusan rasmi, KL','—','Baharu','blue'],
 ['25/09/2026','Azman Ismail','Mesyuarat jabatan','Tolak','Ditolak','red']
];
document.getElementById('requestTable').innerHTML=requests.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td><span class="status ${r[5]}">${r[4]}</span></td></tr>`).join('');

const maintenance=[
 ['02/10/2026','WVD 5678','Servis berkala','Akan Datang'],
 ['05/10/2026','WVD 1234','Tukar tayar','Akan Datang'],
 ['10/10/2026','WVD 9012','Servis enjin','Akan Datang'],
 ['15/10/2026','WVD 3456','Tukar bateri','Akan Datang'],
 ['20/10/2026','WVD 7890','Servis berkala','Akan Datang']
];
document.getElementById('maintenanceTable').innerHTML=maintenance.map(r=>`<tr><td>${r[0]}</td><td><b>${r[1]}</b></td><td>${r[2]}</td><td><span class="status blue">${r[3]}</span></td></tr>`).join('');

const expiry=[
 ['WVD 1234','Insurans','15/10/2026','≤ 30 hari','amber'],
 ['WVD 5678','Cukai Jalan','20/10/2026','≤ 30 hari','amber'],
 ['WVD 9012','Insurans','28/10/2026','≤ 30 hari','amber'],
 ['WVD 3456','Cukai Jalan','05/09/2026','Lewat','red'],
 ['WVD 7890','Insurans','10/09/2026','Lewat','red']
];
document.getElementById('expiryTable').innerHTML=expiry.map(r=>`<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td>${r[2]}</td><td><span class="status ${r[4]}">${r[3]}</span></td></tr>`).join('');
