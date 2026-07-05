// frontend/app.js - very simple vanilla JS client
const apiBase = '/api';
const loginForm = document.getElementById('login-form');
const authMsg = document.getElementById('auth-msg');
const dashboard = document.getElementById('dashboard');
const authSection = document.getElementById('auth-section');
const userControls = document.getElementById('user-controls');
const patientsList = document.getElementById('patients-list');
const reportsList = document.getElementById('reports-list');
const btnRefresh = document.getElementById('btn-refresh');
const btnAdd = document.getElementById('btn-add');
const fileImport = document.getElementById('file-import');
const btnGenerate = document.getElementById('btn-generate');

let token = localStorage.getItem('token');
let currentUser = JSON.parse(localStorage.getItem('user') || 'null');

function authHeader() {
  return token ? { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' } : { 'Content-Type':'application/json' };
}

async function renderUI() {
  if (!token) {
    dashboard.classList.add('hidden');
    authSection.classList.remove('hidden');
    return;
  }
  authSection.classList.add('hidden');
  dashboard.classList.remove('hidden');
  userControls.innerHTML = `<span>${currentUser.name} (${currentUser.role})</span> <button id="btn-logout">Logout</button>`;
  document.getElementById('btn-logout').addEventListener('click', () => {
    localStorage.removeItem('token'); localStorage.removeItem('user'); token=null; currentUser=null; renderUI();
  });
  // role-based UI
  document.querySelectorAll('.role-admin').forEach(el => el.style.display = currentUser.role === 'admin' ? 'inline-block' : 'none');
  document.querySelectorAll('.role-doctor').forEach(el => el.style.display = (currentUser.role === 'doctor' || currentUser.role==='admin') ? 'inline-block' : 'none');
  document.querySelectorAll('.role-nurse').forEach(el => el.style.display = (currentUser.role === 'nurse' || currentUser.role==='doctor' || currentUser.role==='admin') ? 'inline-block' : 'none');

  await fetchPatients();
  await fetchReports();
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = new FormData(loginForm);
  const body = { email: form.get('email'), password: form.get('password') };
  const res = await fetch(apiBase + '/auth/login', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(body) });
  const j = await res.json();
  if (j.ok) {
    token = j.token;
    currentUser = j.user;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(currentUser));
    authMsg.textContent = '';
    renderUI();
  } else {
    authMsg.textContent = j.error || 'Login failed';
  }
});

async function fetchPatients() {
  patientsList.innerHTML = 'Loading...';
  const res = await fetch(apiBase + '/patients', { headers: authHeader() });
  if (res.status === 401) { token=null; localStorage.removeItem('token'); renderUI(); return; }
  const patients = await res.json();
  patientsList.innerHTML = '';
  patients.forEach(p => {
    const el = document.createElement('div'); el.className = 'patient';
    el.innerHTML = `<strong>${p.name}</strong> <div>MRN: ${p.mrn||''} | Status: ${p.status||''}</div>
      <div><button data-id="${p._id}" class="btn-edit">Edit</button> ${currentUser.role==='admin' ? `<button data-id="${p._id}" class="btn-delete">Delete</button>` : ''}</div>`;
    patientsList.appendChild(el);
  });
  document.querySelectorAll('.btn-delete').forEach(btn => btn.addEventListener('click', async (ev) => {
    if (!confirm('Delete patient?')) return;
    const id = ev.target.dataset.id;
    await fetch(apiBase + '/patients/' + id, { method:'DELETE', headers: authHeader() });
    fetchPatients();
  }));
  document.querySelectorAll('.btn-edit').forEach(btn => btn.addEventListener('click', async (ev) => {
    const id = ev.target.dataset.id;
    const pRes = await fetch(apiBase + '/patients/' + id, { headers: authHeader() });
    const p = await pRes.json();
    const newName = prompt('Name', p.name);
    if (!newName) return;
    p.name = newName;
    await fetch(apiBase + '/patients/' + id, { method:'PUT', headers: authHeader(), body: JSON.stringify(p) });
    fetchPatients();
  }));
}

btnRefresh.addEventListener('click', fetchPatients);

btnAdd.addEventListener('click', async () => {
  const name = prompt('Patient name');
  if (!name) return;
  await fetch(apiBase + '/patients', { method:'POST', headers: authHeader(), body: JSON.stringify({ name }) });
  fetchPatients();
});

fileImport.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const f = new FormData(); f.append('file', file);
  const res = await fetch(apiBase + '/import/patients', { method: 'POST', headers: token ? { 'Authorization': 'Bearer ' + token } : {}, body: f });
  const j = await res.json();
  alert('Imported: ' + (j.imported || 0));
  fetchPatients();
});

btnGenerate.addEventListener('click', async () => {
  if (!confirm('Generate report now?')) return;
  const res = await fetch('/api/admin/generate-report', { method: 'POST', headers: { 'Authorization': 'Bearer ' + token } });
  const j = await res.json();
  alert(j.ok ? 'Report generated' : ('Error: ' + JSON.stringify(j)));
  fetchReports();
});

async function fetchReports() {
  const res = await fetch(apiBase + '/reports', { headers: authHeader() });
  if (res.status === 403 || res.status === 401) { reportsList.innerHTML = 'No permission to view reports.'; return; }
  const list = await res.json();
  reportsList.innerHTML = '';
  list.forEach(r => {
    const div = document.createElement('div');
    const date = new Date(r.date).toLocaleString();
    div.innerHTML = `${date} <a href="/api/reports/download/${r._id}">Download</a>`;
    reportsList.appendChild(div);
  });
}

renderUI();
