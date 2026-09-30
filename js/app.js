const requests=[
{id:"PR-2026-001",name:"Ahmad Bin Ali",location:"Kuala Lumpur",date:"02 Okt 2026",time:"08:00–17:00",need:"Pemandu Tunggu",status:"Menunggu"},
{id:"PR-2026-002",name:"Siti Aminah",location:"Seremban",date:"03 Okt 2026",time:"07:30–16:00",need:"Tanpa Pemandu Tunggu",status:"Menunggu"},
{id:"PR-2026-003",name:"Mohd Faiz",location:"Melaka",date:"04 Okt 2026",time:"09:00–18:00",need:"Pemandu Tunggu",status:"Diluluskan"}];
const vehicles=[
{id:"v1",name:"Van IKTBN 01",type:"Van",fuel:"Diesel",seats:14,status:"available"},
{id:"v2",name:"Sedan IKTBN 02",type:"Sedan",fuel:"Petrol",seats:5,status:"available"},
{id:"v3",name:"Bas IKTBN 01",type:"Bas",fuel:"Diesel",seats:40,status:"under_maintenance"},
{id:"v4",name:"EV IKTBN 01",type:"Sedan EV",fuel:"Electric",seats:5,status:"scheduled"}];
const drivers=[
{id:"d1",name:"Ahmad",cat:"Pemandu Rasmi",license:"Kelas D",eligible:["Sedan","Van"],available:true,appointed:true},
{id:"d2",name:"Rahman",cat:"Pemandu Gantian",license:"Kelas D",eligible:["Sedan","Van","Bas"],available:true,appointed:true},
{id:"d3",name:"Ali",cat:"Pemandu Rasmi",license:"Kelas D",eligible:["Sedan"],available:true,appointed:true},
{id:"d4",name:"Samad",cat:"Pemandu Gantian",license:"Kelas D",eligible:["Sedan","Van"],available:true,appointed:false}];
let selectedVehicle=null,selectedDriver=null;
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);

$$(".nav").forEach(b=>b.onclick=()=>{ $$(".nav").forEach(x=>x.classList.remove("active"));b.classList.add("active");$$(".view").forEach(x=>x.classList.remove("active"));$("#"+b.dataset.view).classList.add("active")});
$("#letter").onchange=e=>$("#fileText").textContent=e.target.files[0]?.name||"PDF / JPG / PNG · Maksimum 10MB";
$("#requestForm").onsubmit=e=>{e.preventDefault();toast("Permohonan disemak. Dalam production ia akan dihantar ke Supabase.");};

function renderRequests(){
 const q=$("#search").value.toLowerCase(),f=$("#filter").value;
 $("#requestList").innerHTML=requests.filter(r=>(f==="Semua"||r.status===f)&&`${r.id} ${r.name} ${r.location}`.toLowerCase().includes(q)).map(r=>`
 <div class="request"><div><small>No. Permohonan</small><b>${r.id}</b></div><div><small>Pemohon</small><b>${r.name}</b></div><div><small>Lokasi</small><b>${r.location}<br>${r.date} · ${r.time}</b></div><div><small>Keperluan</small><b>${r.need}</b></div><button class="primary" onclick="openAssignment('${r.id}')">Semak</button></div>`).join("");
}
window.openAssignment=id=>{$$(".nav").forEach(x=>x.classList.toggle("active",x.dataset.view==="assignment"));$$(".view").forEach(x=>x.classList.remove("active"));$("#assignment").classList.add("active");toast(id+" dibuka untuk assignment");};
$("#search").oninput=renderRequests;$("#filter").onchange=renderRequests;

function renderVehicles(){
 $("#vehicles").innerHTML=vehicles.map(v=>{let locked=v.status!=="available";return `<div class="item ${locked?"locked":""} ${selectedVehicle===v.id?"selected":""}" data-v="${v.id}"><span class="badge ${locked?"red":""}">${locked?(v.status==="scheduled"?"SCHEDULED":"MAINTENANCE"):"AVAILABLE"}</span><b>${v.name}</b><small>${v.type} · ${v.seats} tempat duduk · ${v.fuel}</small>${locked?"<small>🔒 Tidak boleh dipilih</small>":"<small>✓ Available untuk tempoh perjalanan</small>"}</div>`}).join("");
$$("[data-v]").forEach(x=>x.onclick=()=>{let v=vehicles.find(a=>a.id===x.dataset.v);if(v.status!=="available")return toast("Kenderaan tidak available.");selectedVehicle=v.id;selectedDriver=null;renderVehicles();renderDrivers();update();});
}
function renderDrivers(){
 if(!selectedVehicle){$("#drivers").innerHTML='<div class="item locked">Pilih kenderaan dahulu.</div>';return}
 let v=vehicles.find(x=>x.id===selectedVehicle);
 $("#drivers").innerHTML=drivers.map(d=>{let ok=d.available&&d.appointed&&d.eligible.includes(v.type);let why=!d.appointed?"Surat lantikan tidak sah":!d.eligible.includes(v.type)?"Kelas lesen tidak memenuhi keperluan":"Tidak available";return `<div class="item ${ok?"":"locked"} ${selectedDriver===d.id?"selected":""}" data-d="${d.id}"><span class="badge ${ok?"":"red"}">${ok?"ELIGIBLE":"NOT ELIGIBLE"}</span><b>${d.name}</b><small>${d.cat} · ${d.license}</small><small>${ok?"✓ Available · ✓ Lesen sesuai · ✓ Syarat lantikan":"❌ "+why}</small></div>`}).join("");
$$("[data-d]").forEach(x=>x.onclick=()=>{let d=drivers.find(a=>a.id===x.dataset.d);let v=vehicles.find(a=>a.id===selectedVehicle);if(!(d.available&&d.appointed&&d.eligible.includes(v.type)))return toast("Pemandu tidak memenuhi syarat.");selectedDriver=d.id;renderDrivers();update();});
}
function update(){let v=vehicles.find(x=>x.id===selectedVehicle),d=drivers.find(x=>x.id===selectedDriver);$("#sv").textContent=v?.name||"Belum dipilih";$("#sd").textContent=d?`${d.name} — ${d.cat}`:"Belum dipilih";$("#confirm").disabled=!(v&&d)}
$("#confirm").onclick=()=>toast("Assignment berjaya disahkan — Trip dijadualkan (prototype).");
function toast(m){let t=$("#toast");t.textContent=m;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2500)}
renderRequests();renderVehicles();renderDrivers();update();
