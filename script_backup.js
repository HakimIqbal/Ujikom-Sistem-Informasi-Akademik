document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'api/'; 

    let state = {
        mahasiswa: [],
        dosen: [],
        matakuliah: [],
        ruang: [],
        golongan: [],
        jadwal: [],
        krs: [],
        presensi: [],
        pengampu: []
    };

    const currentPage = window.location.pathname.split("/").pop();

    if (currentPage === 'index.html' || currentPage === '') {
        handleLoginPage();
    } else if (currentPage === 'dashboard.html') {
        handleDashboardPage();
    }

    async function handleLoginPage() {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const username = e.target.username.value;
                const password = e.target.password.value;
                const errorMessage = document.getElementById('error-message');

                try {
                    const response = await fetch(`${API_URL}login.php`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, password })
                    });

                    const result = await response.json();

                    if (result.success) {
                        sessionStorage.setItem('userRole', result.role);
                        sessionStorage.setItem('username', result.username);
                        window.location.href = 'dashboard.html';
                    } else {
                        errorMessage.textContent = result.message || 'Username atau password salah!';
                    }
                } catch (error) {
                    errorMessage.textContent = 'Tidak dapat terhubung ke server.';
                    console.error('Login error:', error);
                }
            });
        }
    }

    async function handleDashboardPage() {
        const userRole = sessionStorage.getItem('userRole');
        if (!userRole) {
            window.location.href = 'index.html';
            return;
        }

        await setupDashboard(userRole);
        await loadPageContent('dashboard'); 

        const logoutBtn = document.getElementById('logout-btn');
        if(logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                sessionStorage.clear();
                window.location.href = 'index.html';
            });
        }
    }

    async function setupDashboard(role) {
        const sidebarNav = document.getElementById('sidebar-nav');
        const userProfile = document.getElementById('user-profile');
        let navLinks = '';

        const menus = {
            admin: [
                { title: 'Dashboard', icon: 'fa-tachometer-alt', page: 'dashboard' },
                { title: 'Mahasiswa', icon: 'fa-user-graduate', page: 'mahasiswa' },
                { title: 'Dosen', icon: 'fa-chalkboard-teacher', page: 'dosen' },
                { title: 'Matakuliah', icon: 'fa-book', page: 'matakuliah' },
                { title: 'Ruang', icon: 'fa-door-open', page: 'ruang' },
                { title: 'Golongan', icon: 'fa-users', page: 'golongan' },
                { title: 'Jadwal Kuliah', icon: 'fa-calendar-alt', page: 'jadwal' },
                { title: 'KRS', icon: 'fa-tasks', page: 'krs' },
                { title: 'Presensi', icon: 'fa-check-square', page: 'presensi' },
                { title: 'Pengampu', icon: 'fa-link', page: 'pengampu' },
            ],
            mahasiswa: [
                { title: 'Dashboard', icon: 'fa-tachometer-alt', page: 'dashboard' },
                { title: 'KRS', icon: 'fa-tasks', page: 'krs' },
                { title: 'Jadwal', icon: 'fa-calendar-alt', page: 'jadwal' },
                { title: 'Presensi', icon: 'fa-check-square', page: 'presensi' },
            ],
            dosen: [
                { title: 'Dashboard', icon: 'fa-tachometer-alt', page: 'dashboard' },
                { title: 'Jadwal Mengajar', icon: 'fa-calendar-alt', page: 'jadwal_mengajar' },
                { title: 'Input Presensi', icon: 'fa-check-square', page: 'input_presensi' },
                { title: 'Data Mahasiswa', icon: 'fa-user-graduate', page: 'data_mahasiswa' },
            ]
        };

        if (menus[role]) {
            menus[role].forEach(link => {
                navLinks += `<a href="#" data-page="${link.page}" class="flex items-center px-4 py-2 text-gray-100 hover:bg-blue-700 rounded-lg">
                                <i class="fas ${link.icon} w-6"></i>
                                <span>${link.title}</span>
                             </a>`;
            });
        }
        sidebarNav.innerHTML = navLinks;
        
        let profileName = 'User';
        let username = sessionStorage.getItem('username');

        if (role === 'admin') {
             profileName = 'Administrator';
        } else if (role === 'mahasiswa' || role === 'dosen') {

            const data = await fetchData(role === 'mahasiswa' ? 'mahasiswa' : 'dosen');
            const userData = data.find(u => u[role === 'mahasiswa' ? 'nim' : 'nip'] === username);
            if(userData) profileName = userData.nama;
            else profileName = role.charAt(0).toUpperCase() + role.slice(1);
        }

        userProfile.innerHTML = `<i class="fas fa-user-circle fa-2x text-blue-300"></i>
                                 <div class="ml-3">
                                     <p class="font-bold">${profileName}</p>
                                     <p class="text-sm">${username}</p>
                                 </div>`;

        addNavEventListeners();
    }
    
    function addNavEventListeners() {
        const navLinks = document.querySelectorAll('#sidebar-nav a');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                loadPageContent(page);

                document.querySelectorAll('#sidebar-nav a').forEach(l => l.classList.remove('bg-blue-900', 'font-bold'));
                link.classList.add('bg-blue-900', 'font-bold');
            });
        });
    }
    
    async function loadPageContent(page) {
        const mainContent = document.getElementById('main-content');
        const pageTitle = document.getElementById('page-title');
        
        const title = page.charAt(0).toUpperCase() + page.slice(1).replace(/_/g, ' ');
        pageTitle.textContent = title;

        switch(page) {
            case 'dashboard':
                await loadDashboardContent();
                break;
            case 'mahasiswa':
                mainContent.innerHTML = generateCRUDPageHTML('Mahasiswa', ['NIM', 'Nama', 'Jurusan', 'Angkatan']);
                await renderMahasiswaTable();
                setupMahasiswaEventListeners();
                break;
            case 'dosen':
                mainContent.innerHTML = generateCRUDPageHTML('Dosen', ['NIP', 'Nama', 'Alamat']);
                await renderDosenTable();
                setupDosenEventListeners();
                break;
            case 'matakuliah':
                mainContent.innerHTML = generateCRUDPageHTML('Matakuliah', ['Kode MK', 'Nama Matakuliah', 'SKS']);
                await renderMatakuliahTable();
                setupMatakuliahEventListeners();
                break;
            case 'ruang':
                mainContent.innerHTML = generateCRUDPageHTML('Ruang', ['Kode Ruang', 'Nama Ruang', 'Kapasitas']);
                await renderRuangTable();
                setupRuangEventListeners();
                break;
            case 'golongan':
                mainContent.innerHTML = generateCRUDPageHTML('Golongan', ['ID', 'Nama Golongan']);
                await renderGolonganTable();
                setupGolonganEventListeners();
                break;
            case 'jadwal':
                const jadwalRole = sessionStorage.getItem('userRole');
                if(jadwalRole === 'admin') {
                    mainContent.innerHTML = generateCRUDPageHTML('Jadwal Kuliah', ['Hari', 'Jam', 'Matakuliah', 'Dosen', 'Ruang', 'Golongan']);
                    await renderJadwalTable();
                    setupJadwalEventListeners();
                } else if (jadwalRole === 'mahasiswa') {
                    await renderMahasiswaJadwal();
                }
                break;
            case 'jadwal_mengajar':
                await renderDosenJadwal();
                break;
            case 'input_presensi':
                const presensiRole = sessionStorage.getItem('userRole');
                if(presensiRole === 'admin') {
                    await renderAdminInputPresensi();
                } else {
                    await renderInputPresensi();
                }
                break;
            case 'data_mahasiswa':
                await renderDosenMahasiswaView();
                break;
            case 'krs':
                const krsRole = sessionStorage.getItem('userRole');
                if(krsRole === 'admin') {
                    mainContent.innerHTML = generateCRUDPageHTML('KRS Mahasiswa', ['NIM', 'Nama Mahasiswa', 'Kode MK', 'Nama Matakuliah']);
                    await renderKrsTable();
                    setupKrsEventListeners();
                } else {
                    await renderMahasiswaKRS();
                }
                break;
            case 'presensi':
                const presensiRoleView = sessionStorage.getItem('userRole');
                if(presensiRoleView === 'admin'){
                    await renderAdminPresensiView();
                } else if (presensiRoleView === 'mahasiswa') {
                    await renderMahasiswaPresensi();
                }
                break;
            case 'pengampu':
                mainContent.innerHTML = generateCRUDPageHTML('Pengampu Dosen', ['Kode MK', 'Nama Matakuliah', 'NIP', 'Nama Dosen']);
                await renderPengampuTable();
                setupPengampuEventListeners();
                break;

            default:
                mainContent.innerHTML = `<div class="bg-white p-6 rounded-lg shadow-lg">Content for ${page} is under construction.</div>`;
        }
    }

    function generateCRUDPageHTML(entityName, headers) {
        return `
            <div class="bg-white p-6 rounded-lg shadow-lg">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-semibold">Data ${entityName}</h2>
                    <button id="add-btn" class="bg-blue-800 hover:bg-blue-900 text-white font-bold py-2 px-4 rounded">
                        <i class="fas fa-plus mr-2"></i>Tambah ${entityName}
                    </button>
                </div>
                <div class="mb-4">
                    <input type="text" id="search-input" class="w-full px-4 py-2 border rounded-lg" placeholder="Cari ${entityName}...">
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full bg-white">
                        <thead class="bg-blue-800 text-white">
                            <tr>
                                ${headers.map(h => `<th class="py-3 px-4 text-left">${h}</th>`).join('')}
                                <th class="py-3 px-4 text-left">Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="data-table-body">
                            <!-- Data rows will be inserted here -->
                        </tbody>
                    </table>
                </div>
                 <div id="pagination-controls" class="mt-4 flex justify-between items-center"></div>
            </div>`;
    }

    async function fetchData(entity, params = {}) {
        const isBaseRequest = Object.keys(params).length === 0;
        const cacheKey = isBaseRequest ? entity : `${entity}?${new URLSearchParams(params).toString()}`;

        if (isBaseRequest && state[cacheKey]) {
            return state[cacheKey];
        }
        
        const url = new URL(`${API_URL}${entity}.php`);
        if (!isBaseRequest) {
            url.search = new URLSearchParams(params).toString();
        }
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            if (isBaseRequest) {
                state[entity] = data;
            }

            return data;
        } catch (error) {
            console.error("Could not fetch data:", error);
            showToast(`Failed to fetch ${entity}.`, 'error');
            return []; 
        }
    }

    async function renderMahasiswaTable(searchTerm = '') {
        const data = await fetchData('mahasiswa');
        const tableBody = document.getElementById('data-table-body');
        
        const filteredData = data.filter(m => 
            m.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.nim.includes(searchTerm)
        );

        if (!tableBody) return;
        tableBody.innerHTML = filteredData.map(mhs => `
            <tr class="border-b">
                <td class="py-3 px-4">${mhs.nim}</td>
                <td class="py-3 px-4">${mhs.nama}</td>
                <td class="py-3 px-4">${mhs.jurusan}</td>
                <td class="py-3 px-4">${mhs.angkatan}</td>
                <td class="py-3 px-4">
                    <button data-nim="${mhs.nim}" class="edit-btn text-blue-600 hover:text-blue-800 mr-2"><i class="fas fa-edit"></i></button>
                    <button data-nim="${mhs.nim}" class="delete-btn text-red-600 hover:text-red-800"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    }
    
    function setupMahasiswaEventListeners() {
        document.getElementById('add-btn').addEventListener('click', () => openMahasiswaModal());
        
        document.getElementById('search-input').addEventListener('input', (e) => {
            renderMahasiswaTable(e.target.value);
        });

        document.getElementById('data-table-body').addEventListener('click', e => {
            if (e.target.closest('.edit-btn')) {
                const nim = e.target.closest('.edit-btn').dataset.nim;
                openMahasiswaModal(nim);
            }
            if (e.target.closest('.delete-btn')) {
                const nim = e.target.closest('.delete-btn').dataset.nim;
                deleteData('mahasiswa', nim, 'nim');
            }
        });
    }

    function openMahasiswaModal(nim = null) {
        const mhs = nim ? state.mahasiswa.find(m => m.nim === nim) : {};
        const isEdit = nim !== null;

        const modalContent = `
            <h3 class="text-lg font-medium leading-6 text-gray-900">${isEdit ? 'Edit' : 'Tambah'} Mahasiswa</h3>
            <form id="mahasiswa-form" class="mt-4 space-y-4">
                <input type="hidden" id="nim_edit" value="${mhs?.nim || ''}">
                <div>
                    <label for="nim" class="block text-sm font-medium text-gray-700">NIM</label>
                    <input type="text" name="nim" id="nim" value="${mhs?.nim || ''}" ${isEdit ? 'readonly' : ''} required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${isEdit ? 'bg-gray-100' : ''}">
                </div>
                <div>
                    <label for="nama" class="block text-sm font-medium text-gray-700">Nama</label>
                    <input type="text" name="nama" id="nama" value="${mhs?.nama || ''}" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                </div>
                 <div>
                    <label for="jurusan" class="block text-sm font-medium text-gray-700">Jurusan</label>
                    <input type="text" name="jurusan" id="jurusan" value="${mhs?.jurusan || ''}" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                </div>
                <div>
                    <label for="angkatan" class="block text-sm font-medium text-gray-700">Angkatan</label>
                    <input type="number" name="angkatan" id="angkatan" value="${mhs?.angkatan || new Date().getFullYear()}" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                </div>
                <div class="flex justify-end space-x-4">
                    <button type="button" id="cancel-btn" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Batal</button>
                    <button type="submit" class="px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-900">${isEdit ? 'Update' : 'Simpan'}</button>
                </div>
            </form>
        `;
        showModal(modalContent);

        document.getElementById('mahasiswa-form').addEventListener('submit', saveMahasiswa);
        document.getElementById('cancel-btn').addEventListener('click', closeModal);
    }
    
    async function saveMahasiswa(e) {
        e.preventDefault();
        const form = e.target;
        const nimEdit = document.getElementById('nim_edit').value;
        const isEdit = !!nimEdit;

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        const endpoint = `${API_URL}mahasiswa.php`;
        const options = {
            method: isEdit ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        };

        try {
            const response = await fetch(endpoint, options);
            const result = await response.json();

            if (result.success) {
                await renderMahasiswaTable();
                closeModal();
                showToast(`Data mahasiswa berhasil ${isEdit ? 'diupdate' : 'disimpan'}!`, 'success');
            } else {
                showToast(result.message || 'Terjadi kesalahan.', 'error');
            }
        } catch (error) {
            console.error('Error saving mahasiswa:', error);
            showToast('Gagal menyimpan data.', 'error');
        }
    }

    async function deleteData(entity, id, idField) {
        if (!idField) {
            console.error('Error: idField is required for deletion.');
            showToast('Terjadi kesalahan internal (idField missing).', 'error');
            return;
        }

        if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
            try {
                const response = await fetch(`${API_URL}${entity}.php?${idField}=${id}`, {
                    method: 'DELETE',
                });
                const result = await response.json();

                if (result.success) {
                    showToast(`Data ${entity} berhasil dihapus!`, 'success');
                    
                    state[entity] = null;

                    if (entity === 'mahasiswa') await renderMahasiswaTable();
                    else if (entity === 'dosen') await renderDosenTable();
                    else if (entity === 'matakuliah') await renderMatakuliahTable();
                    else if (entity === 'ruang') await renderRuangTable();
                    else if (entity === 'golongan') await renderGolonganTable();
                    else if (entity === 'jadwal_kuliah') await renderJadwalTable();
                    else if (entity === 'krs') await renderKrsTable();
                    else if (entity === 'pengampu') await renderPengampuTable();

                } else {
                    showToast(result.message || `Gagal menghapus ${entity}.`, 'error');
                }
            } catch (error) {
                console.error(`Error deleting ${entity}:`, error);
                showToast('Gagal menghapus data.', 'error');
            }
        }
    }

    function showModal(content) {
        const modal = document.getElementById('modal');
        const modalContent = document.getElementById('modal-content');
        modalContent.innerHTML = content;
        modal.classList.remove('hidden');
    }

    function closeModal() {
        const modal = document.getElementById('modal');
        modal.classList.add('hidden');
        document.getElementById('modal-content').innerHTML = '';
    }

    function showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toast-message');
        
        toast.className = 'fixed bottom-5 right-5 text-white py-2 px-4 rounded-lg shadow-lg';
        if (type === 'success') {
            toast.classList.add('bg-green-500');
        } else {
            toast.classList.add('bg-red-500');
        }
        
        toastMessage.textContent = message;
        toast.classList.remove('hidden');

        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }

    async function loadDashboardContent() {
        const mainContent = document.getElementById('main-content');
        const role = sessionStorage.getItem('userRole');
        
        let content = '';
        if (role === 'admin') {
            const mahasiswaCount = (await fetchData('mahasiswa')).length;
            const dosenCount = (await fetchData('dosen')).length;
            const matakuliahCount = (await fetchData('matakuliah')).length;

            content = `
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div class="bg-white p-6 rounded-lg shadow-lg flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-600">Total Mahasiswa</p>
                            <p class="text-3xl font-bold">${mahasiswaCount}</p>
                        </div>
                        <i class="fas fa-user-graduate fa-3x text-blue-500"></i>
                    </div>
                    <div class="bg-white p-6 rounded-lg shadow-lg flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-600">Total Dosen</p>
                            <p class="text-3xl font-bold">${dosenCount}</p>
                        </div>
                        <i class="fas fa-chalkboard-teacher fa-3x text-green-500"></i>
                    </div>
                    <div class="bg-white p-6 rounded-lg shadow-lg flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-600">Total Matakuliah</p>
                            <p class="text-3xl font-bold">${matakuliahCount}</p>
                        </div>
                        <i class="fas fa-book fa-3x text-yellow-500"></i>
                    </div>
                </div>
                <div class="mt-6 bg-white p-6 rounded-lg shadow-lg">
                    <h2 class="text-xl font-semibold mb-4">Statistik Akademik</h2>
                    <canvas id="academic-chart"></canvas>
                </div>
            `;
            mainContent.innerHTML = content;

            if (document.getElementById('academic-chart')) {
                const ctx = document.getElementById('academic-chart').getContext('2d');
                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: ['Mahasiswa', 'Dosen', 'Matakuliah'],
                        datasets: [{
                            label: 'Total',
                            data: [mahasiswaCount, dosenCount, matakuliahCount],
                            backgroundColor: [
                                'rgba(59, 130, 246, 0.5)',
                                'rgba(16, 185, 129, 0.5)',
                                'rgba(245, 158, 11, 0.5)',
                            ],
                            borderColor: [
                                'rgba(59, 130, 246, 1)',
                                'rgba(16, 185, 129, 1)',
                                'rgba(245, 158, 11, 1)',
                            ],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            }
        } else if (role === 'mahasiswa') {
            const username = sessionStorage.getItem('username');
            const allMahasiswa = await fetchData('mahasiswa');
            const userData = allMahasiswa.find(m => m.nim === username);
            
            mainContent.innerHTML = userData ? `
                <div class="bg-white p-6 rounded-lg shadow-lg">
                    <h2 class="text-2xl font-bold mb-4">Selamat Datang, ${userData.nama}!</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><strong>NIM:</strong> ${userData.nim}</div>
                        <div><strong>Jurusan:</strong> ${userData.jurusan}</div>
                        <div><strong>Angkatan:</strong> ${userData.angkatan}</div>
                    </div>
                </div>` : '<p>Data mahasiswa tidak ditemukan.</p>';
        } else if (role === 'dosen') {
            const username = sessionStorage.getItem('username');
            const allDosen = await fetchData('dosen');
            const userData = allDosen.find(d => d.nip === username);

            mainContent.innerHTML = userData ? `
                <div class="bg-white p-6 rounded-lg shadow-lg">
                    <h2 class="text-2xl font-bold mb-4">Selamat Datang, ${userData.nama}!</h2>
                     <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><strong>NIP:</strong> ${userData.nip}</div>
                        <div><strong>Alamat:</strong> ${userData.alamat}</div>
                    </div>
                </div>` : '<p>Data dosen tidak ditemukan.</p>';
        }
    }
    
    function updateTime() {
        const timeElement = document.getElementById('current-time');
        if(timeElement) {
            timeElement.textContent = new Date().toLocaleString('id-ID', {
                dateStyle: 'full',
                timeStyle: 'short'
            });
        }
    }

    if (currentPage === 'dashboard.html') {
        setInterval(updateTime, 1000);
        updateTime();
    }

    async function renderDosenTable(searchTerm = '') {
        const data = await fetchData('dosen');
        const tableBody = document.getElementById('data-table-body');
        
        const filteredData = data.filter(d => 
            d.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.nip.includes(searchTerm)
        );

        tableBody.innerHTML = filteredData.map(dosen => `
            <tr class="border-b">
                <td class="py-3 px-4">${dosen.nip}</td>
                <td class="py-3 px-4">${dosen.nama}</td>
                <td class="py-3 px-4">${dosen.alamat}</td>
                <td class="py-3 px-4">
                    <button data-nip="${dosen.nip}" class="edit-btn text-blue-600 hover:text-blue-800 mr-2"><i class="fas fa-edit"></i></button>
                    <button data-nip="${dosen.nip}" class="delete-btn text-red-600 hover:text-red-800"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    }

    function setupDosenEventListeners() {
        document.getElementById('add-btn').addEventListener('click', () => openDosenModal());
        
        document.getElementById('search-input').addEventListener('input', (e) => {
            renderDosenTable(e.target.value);
        });

        document.getElementById('data-table-body').addEventListener('click', e => {
            if (e.target.closest('.edit-btn')) {
                const nip = e.target.closest('.edit-btn').dataset.nip;
                openDosenModal(nip);
            }
            if (e.target.closest('.delete-btn')) {
                const nip = e.target.closest('.delete-btn').dataset.nip;
                deleteData('dosen', nip, 'nip');
            }
        });
    }

    async function openDosenModal(nip = null) {
        await fetchData('dosen'); 
        const dosen = nip ? state.dosen.find(d => d.nip === nip) : {};
        const isEdit = nip !== null;

        const modalContent = `
            <h3 class="text-lg font-medium leading-6 text-gray-900">${isEdit ? 'Edit' : 'Tambah'} Dosen</h3>
            <form id="dosen-form" class="mt-4 space-y-4">
                <input type="hidden" id="nip_edit" value="${dosen.nip || ''}">
                <div>
                    <label for="nip" class="block text-sm font-medium text-gray-700">NIP</label>
                    <input type="text" id="nip" value="${dosen.nip || ''}" ${isEdit ? 'readonly' : ''} class="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100">
                </div>
                <div>
                    <label for="nama" class="block text-sm font-medium text-gray-700">Nama</label>
                    <input type="text" id="nama" value="${dosen.nama || ''}" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                </div>
                <div>
                    <label for="alamat" class="block text-sm font-medium text-gray-700">Alamat</label>
                    <textarea id="alamat" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">${dosen.alamat || ''}</textarea>
                </div>
                <div class="flex justify-end space-x-4">
                    <button type="button" id="cancel-btn" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Batal</button>
                    <button type="submit" class="px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-900">${isEdit ? 'Update' : 'Simpan'}</button>
                </div>
            </form>
        `;
        showModal(modalContent);

        document.getElementById('dosen-form').addEventListener('submit', saveDosen);
        document.getElementById('cancel-btn').addEventListener('click', closeModal);
    }

    async function saveDosen(e) {
        e.preventDefault();
        const nipEdit = document.getElementById('nip_edit').value;
        const newDosen = {
            nip: document.getElementById('nip').value,
            nama: document.getElementById('nama').value,
            alamat: document.getElementById('alamat').value,
        };

        const isEdit = !!nipEdit;
        const endpoint = `${API_URL}dosen.php`;
        const options = {
            method: isEdit ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newDosen),
        };

        try {
            const response = await fetch(endpoint, options);
            const result = await response.json();
            if (result.success) {
                await renderDosenTable();
                closeModal();
                showToast(`Data dosen berhasil ${isEdit ? 'diupdate' : 'disimpan'}!`, 'success');
            } else {
                 showToast(result.message || 'Terjadi kesalahan.', 'error');
            }
        } catch (error) {
            console.error('Error saving dosen:', error);
            showToast('Gagal menyimpan data.', 'error');
        }
    }

    async function renderMatakuliahTable(searchTerm = '') {
        const data = await fetchData('matakuliah');
        const tableBody = document.getElementById('data-table-body');
        
        const filteredData = data.filter(mk => 
            mk.nama_mk.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mk.kode_mk.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (!tableBody) return;
        tableBody.innerHTML = filteredData.map(mk => `
            <tr class="border-b">
                <td class="py-3 px-4">${mk.kode_mk}</td>
                <td class="py-3 px-4">${mk.nama_mk}</td>
                <td class="py-3 px-4">${mk.sks}</td>
                <td class="py-3 px-4">
                    <button data-kode_mk="${mk.kode_mk}" class="edit-btn text-blue-600 hover:text-blue-800 mr-2"><i class="fas fa-edit"></i></button>
                    <button data-kode_mk="${mk.kode_mk}" class="delete-btn text-red-600 hover:text-red-800"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    }

    function setupMatakuliahEventListeners() {
        document.getElementById('add-btn').addEventListener('click', () => openMatakuliahModal());
        
        document.getElementById('search-input').addEventListener('input', (e) => {
            renderMatakuliahTable(e.target.value);
        });

        document.getElementById('data-table-body').addEventListener('click', e => {
            if (e.target.closest('.edit-btn')) {
                const kode_mk = e.target.closest('.edit-btn').dataset.kode_mk;
                openMatakuliahModal(kode_mk);
            }
            if (e.target.closest('.delete-btn')) {
                const kode_mk = e.target.closest('.delete-btn').dataset.kode_mk;
                deleteData('matakuliah', kode_mk, 'kode_mk');
            }
        });
    }

    async function openMatakuliahModal(kode_mk = null) {
        await fetchData('matakuliah');
        const mk = kode_mk ? state.matakuliah.find(m => m.kode_mk === kode_mk) : {};
        const isEdit = kode_mk !== null;

        const sksOptions = [1, 2, 3, 4, 6].map(s => `<option value="${s}" ${s == mk?.sks ? 'selected' : ''}>${s} SKS</option>`).join('');

        const modalContent = `
            <h3 class="text-lg font-medium leading-6 text-gray-900">${isEdit ? 'Edit' : 'Tambah'} Matakuliah</h3>
            <form id="matakuliah-form" class="mt-4 space-y-4">
                <input type="hidden" name="kode_mk_hidden" value="${mk?.kode_mk || ''}">
                <div>
                    <label for="kode_mk" class="block text-sm font-medium text-gray-700">Kode MK</label>
                    <input type="text" name="kode_mk" id="kode_mk" value="${mk?.kode_mk || ''}" ${isEdit ? 'readonly' : ''} required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm ${isEdit ? 'bg-gray-100' : ''}">
                </div>
                <div>
                    <label for="nama_mk" class="block text-sm font-medium text-gray-700">Nama Matakuliah</label>
                    <input type="text" name="nama_mk" id="nama_mk" value="${mk?.nama_mk || ''}" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                </div>
                <div>
                    <label for="sks" class="block text-sm font-medium text-gray-700">SKS</label>
                    <select name="sks" id="sks" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">${sksOptions}</select>
                </div>
                <div class="flex justify-end space-x-4">
                    <button type="button" id="cancel-btn" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Batal</button>
                    <button type="submit" class="px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-900">${isEdit ? 'Update' : 'Simpan'}</button>
                </div>
            </form>
        `;
        showModal(modalContent);

        document.getElementById('matakuliah-form').addEventListener('submit', saveMatakuliah);
        document.getElementById('cancel-btn').addEventListener('click', closeModal);
    }

    async function saveMatakuliah(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        let data = Object.fromEntries(formData.entries());
        const isEdit = !!data.kode_mk_hidden;

        if(isEdit) {
            data.kode_mk = data.kode_mk_hidden;
        }
        delete data.kode_mk_hidden;


        const endpoint = `${API_URL}matakuliah.php`;
        const options = {
            method: isEdit ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        };

        try {
            const response = await fetch(endpoint, options);
            const result = await response.json();
            if (result.success) {
                await renderMatakuliahTable();
                closeModal();
                showToast(`Data matakuliah berhasil ${isEdit ? 'diupdate' : 'disimpan'}!`, 'success');
            } else {
                 showToast(result.message || 'Terjadi kesalahan.', 'error');
            }
        } catch (error) {
            console.error('Error saving matakuliah:', error);
            showToast('Gagal menyimpan data.', 'error');
        }
    }

    async function renderRuangTable(searchTerm = '') {
        const data = await fetchData('ruang');
        const tableBody = document.getElementById('data-table-body');
        if (!tableBody) return;
        const filteredData = data.filter(r => r.nama_ruang.toLowerCase().includes(searchTerm.toLowerCase()) || r.kode_ruang.toLowerCase().includes(searchTerm.toLowerCase()));
        tableBody.innerHTML = filteredData.map(r => `
            <tr class="border-b">
                <td class="py-3 px-4">${r.kode_ruang}</td>
                <td class="py-3 px-4">${r.nama_ruang}</td>
                <td class="py-3 px-4">${r.kapasitas}</td>
                <td class="py-3 px-4">
                    <button data-kode_ruang="${r.kode_ruang}" class="edit-btn text-blue-600 hover:text-blue-800 mr-2"><i class="fas fa-edit"></i></button>
                    <button data-kode_ruang="${r.kode_ruang}" class="delete-btn text-red-600 hover:text-red-800"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`).join('');
    }

    function setupRuangEventListeners() {
        document.getElementById('add-btn').addEventListener('click', () => openRuangModal());
        document.getElementById('search-input').addEventListener('input', (e) => renderRuangTable(e.target.value));
        document.getElementById('data-table-body').addEventListener('click', e => {
            if (e.target.closest('.edit-btn')) openRuangModal(e.target.closest('.edit-btn').dataset.kode_ruang);
            if (e.target.closest('.delete-btn')) deleteData('ruang', e.target.closest('.delete-btn').dataset.kode_ruang, 'kode_ruang');
        });
    }

    async function openRuangModal(kode_ruang = null) {
        await fetchData('ruang');
        const ruang = kode_ruang ? state.ruang.find(r => r.kode_ruang === kode_ruang) : {};
        const isEdit = kode_ruang !== null;
        const modalContent = `
            <h3 class="text-lg font-medium leading-6 text-gray-900">${isEdit ? 'Edit' : 'Tambah'} Ruang</h3>
            <form id="ruang-form" class="mt-4 space-y-4">
                <input type="hidden" name="kode_ruang_hidden" value="${ruang?.kode_ruang || ''}">
                <div>
                    <label for="kode_ruang" class="block text-sm font-medium text-gray-700">Kode Ruang</label>
                    <input type="text" name="kode_ruang" id="kode_ruang" value="${ruang?.kode_ruang || ''}" ${isEdit ? 'readonly' : ''} required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm ${isEdit ? 'bg-gray-100' : ''}">
                </div>
                <div>
                    <label for="nama_ruang" class="block text-sm font-medium text-gray-700">Nama Ruang</label>
                    <input type="text" name="nama_ruang" id="nama_ruang" value="${ruang?.nama_ruang || ''}" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                </div>
                <div>
                    <label for="kapasitas" class="block text-sm font-medium text-gray-700">Kapasitas</label>
                    <input type="number" name="kapasitas" id="kapasitas" value="${ruang?.kapasitas || ''}" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                </div>
                <div class="flex justify-end space-x-4">
                    <button type="button" id="cancel-btn" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Batal</button>
                    <button type="submit" class="px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-900">${isEdit ? 'Update' : 'Simpan'}</button>
                </div>
            </form>`;
        showModal(modalContent);
        document.getElementById('ruang-form').addEventListener('submit', saveRuang);
        document.getElementById('cancel-btn').addEventListener('click', closeModal);
    }

    async function saveRuang(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        const isEdit = !!data.kode_ruang_hidden;

        if (isEdit) {
            data.kode_ruang = data.kode_ruang_hidden;
        }
        delete data.kode_ruang_hidden;

        const endpoint = `${API_URL}ruang.php`;
        const options = {
            method: isEdit ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        };
        
        try {
            const response = await fetch(endpoint, options);
            const result = await response.json();

            if(result.success) {
                await renderRuangTable();
                closeModal();
                showToast(`Data ruang berhasil ${isEdit ? 'diupdate' : 'disimpan'}!`, 'success');
            } else {
                showToast(result.message || 'Gagal menyimpan data.', 'error');
            }
        } catch (error) {
            console.error('Error saving ruang:', error);
            showToast('Gagal menyimpan data.', 'error');
        }
    }

    async function renderGolonganTable(searchTerm = '') {
        const data = await fetchData('golongan');
        const tableBody = document.getElementById('data-table-body');
        if (!tableBody) return;
        const filteredData = data.filter(g => g.nama_golongan.toLowerCase().includes(searchTerm.toLowerCase()));
        tableBody.innerHTML = filteredData.map(g => `
            <tr class="border-b">
                <td class="py-3 px-4">${g.id_golongan}</td>
                <td class="py-3 px-4">${g.nama_golongan}</td>
                <td class="py-3 px-4">
                    <button data-id_golongan="${g.id_golongan}" class="edit-btn text-blue-600 hover:text-blue-800 mr-2"><i class="fas fa-edit"></i></button>
                    <button data-id_golongan="${g.id_golongan}" class="delete-btn text-red-600 hover:text-red-800"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`).join('');
    }

    function setupGolonganEventListeners() {
        document.getElementById('add-btn').addEventListener('click', () => openGolonganModal());
        document.getElementById('search-input').addEventListener('input', (e) => renderGolonganTable(e.target.value));
        document.getElementById('data-table-body').addEventListener('click', e => {
            if (e.target.closest('.edit-btn')) openGolonganModal(e.target.closest('.edit-btn').dataset.id_golongan);
            if (e.target.closest('.delete-btn')) deleteData('golongan', e.target.closest('.delete-btn').dataset.id_golongan, 'id_golongan');
        });
    }

    async function openGolonganModal(id_golongan = null) {
        await fetchData('golongan');
        const gol = id_golongan ? state.golongan.find(g => g.id_golongan == id_golongan) : {};
        const isEdit = id_golongan !== null;
        const modalContent = `
            <h3 class="text-lg font-medium leading-6 text-gray-900">${isEdit ? 'Edit' : 'Tambah'} Golongan</h3>
            <form id="golongan-form" class="mt-4 space-y-4">
                <input type="hidden" name="id_golongan" value="${gol?.id_golongan || ''}">
                <div>
                    <label for="nama_golongan" class="block text-sm font-medium text-gray-700">Nama Golongan</label>
                    <input type="text" name="nama_golongan" id="nama_golongan" value="${gol?.nama_golongan || ''}" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                </div>
                <div class="flex justify-end space-x-4">
                    <button type="button" id="cancel-btn" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Batal</button>
                    <button type="submit" class="px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-900">${isEdit ? 'Update' : 'Simpan'}</button>
                </div>
            </form>`;
        showModal(modalContent);
        document.getElementById('golongan-form').addEventListener('submit', saveGolongan);
        document.getElementById('cancel-btn').addEventListener('click', closeModal);
    }

    async function saveGolongan(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        const isEdit = !!data.id_golongan;

        const endpoint = `${API_URL}golongan.php`;
        const options = {
            method: isEdit ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        };
        
        try {
            const response = await fetch(endpoint, options);
            const result = await response.json();

            if(result.success) {
                await renderGolonganTable();
                closeModal();
                showToast(`Data golongan berhasil ${isEdit ? 'diupdate' : 'disimpan'}!`, 'success');
            } else {
                showToast(result.message || 'Gagal menyimpan data.', 'error');
            }
        } catch (error) {
            console.error('Error saving golongan:', error);
            showToast('Gagal menyimpan data.', 'error');
        }
    }

    async function renderJadwalTable(searchTerm = '') {
        const jadwalData = await fetchData('jadwal_kuliah');
        const tableBody = document.getElementById('data-table-body');
        if (!tableBody) return;
        
        const filteredData = jadwalData.filter(j => 
            j.nama_mk.toLowerCase().includes(searchTerm.toLowerCase()) || 
            j.nama_dosen.toLowerCase().includes(searchTerm.toLowerCase()) ||
            j.hari.toLowerCase().includes(searchTerm.toLowerCase())
        );

        tableBody.innerHTML = filteredData.map(jadwal => `
            <tr class="border-b">
                <td class="py-3 px-4">${jadwal.hari}</td>
                <td class="py-3 px-4">${jadwal.jam_mulai.substring(0,5)} - ${jadwal.jam_selesai.substring(0,5)}</td>
                <td class="py-3 px-4">${jadwal.nama_mk}</td>
                <td class="py-3 px-4">${jadwal.nama_dosen}</td>
                <td class="py-3 px-4">${jadwal.nama_ruang}</td>
                <td class="py-3 px-4">${jadwal.nama_golongan}</td>
                <td class="py-3 px-4">
                    <button data-id_jadwal="${jadwal.id_jadwal}" class="edit-btn text-blue-600 hover:text-blue-800 mr-2"><i class="fas fa-edit"></i></button>
                    <button data-id_jadwal="${jadwal.id_jadwal}" class="delete-btn text-red-600 hover:text-red-800"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    }

    function setupJadwalEventListeners() {
        document.getElementById('add-btn').addEventListener('click', () => openJadwalModal());
        document.getElementById('search-input').addEventListener('input', (e) => renderJadwalTable(e.target.value));
        document.getElementById('data-table-body').addEventListener('click', e => {
            const target = e.target.closest('button');
            if (target) {
                const id = target.dataset.id_jadwal;
                if (target.classList.contains('edit-btn')) openJadwalModal(id);
                if (target.classList.contains('delete-btn')) deleteData('jadwal_kuliah', id, 'id_jadwal');
            }
        });
    }

    async function openJadwalModal(id_jadwal = null) {
        await Promise.all([
            fetchData('matakuliah'),
            fetchData('dosen'),
            fetchData('ruang'),
            fetchData('golongan'),
            fetchData('jadwal_kuliah')
        ]);
        
        const jadwal = id_jadwal ? state.jadwal_kuliah.find(j => j.id_jadwal == id_jadwal) : {};
        const isEdit = id_jadwal !== null;

        const matakuliahOptions = state.matakuliah.map(m => `<option value="${m.kode_mk}" ${jadwal?.kode_mk === m.kode_mk ? 'selected' : ''}>${m.nama_mk}</option>`).join('');
        const dosenOptions = state.dosen.map(d => `<option value="${d.nip}" ${jadwal?.nip_dosen === d.nip ? 'selected' : ''}>${d.nama}</option>`).join('');
        const ruangOptions = state.ruang.map(r => `<option value="${r.kode_ruang}" ${jadwal?.kode_ruang === r.kode_ruang ? 'selected' : ''}>${r.nama_ruang}</option>`).join('');
        const golonganOptions = state.golongan.map(g => `<option value="${g.id_golongan}" ${jadwal?.id_golongan == g.id_golongan ? 'selected' : ''}>${g.nama_golongan}</option>`).join('');
        const hariOptions = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map(h => `<option value="${h}" ${jadwal?.hari === h ? 'selected' : ''}>${h}</option>`).join('');

        const modalContent = `
            <h3 class="text-lg font-medium leading-6 text-gray-900">${isEdit ? 'Edit' : 'Tambah'} Jadwal Kuliah</h3>
            <form id="jadwal-form" class="mt-4 space-y-4">
                <input type="hidden" name="id_jadwal" value="${jadwal?.id_jadwal || ''}">
                <div><label for="hari">Hari</label><select name="hari" id="hari" class="mt-1 w-full rounded-md shadow-sm">${hariOptions}</select></div>
                <div><label for="jam_mulai">Jam Mulai</label><input type="time" name="jam_mulai" id="jam_mulai" value="${jadwal?.jam_mulai || ''}" class="mt-1 w-full rounded-md shadow-sm"></div>
                <div><label for="jam_selesai">Jam Selesai</label><input type="time" name="jam_selesai" id="jam_selesai" value="${jadwal?.jam_selesai || ''}" class="mt-1 w-full rounded-md shadow-sm"></div>
                <div><label for="kode_mk">Matakuliah</label><select name="kode_mk" id="kode_mk" class="mt-1 w-full rounded-md shadow-sm">${matakuliahOptions}</select></div>
                <div><label for="nip_dosen">Dosen</label><select name="nip_dosen" id="nip_dosen" class="mt-1 w-full rounded-md shadow-sm">${dosenOptions}</select></div>
                <div><label for="kode_ruang">Ruang</label><select name="kode_ruang" id="kode_ruang" class="mt-1 w-full rounded-md shadow-sm">${ruangOptions}</select></div>
                <div><label for="id_golongan">Golongan</label><select name="id_golongan" id="id_golongan" class="mt-1 w-full rounded-md shadow-sm">${golonganOptions}</select></div>
                <div class="flex justify-end space-x-4">
                    <button type="button" id="cancel-btn" class="px-4 py-2 bg-gray-200 rounded-md">Batal</button>
                    <button type="submit" class="px-4 py-2 bg-blue-800 text-white rounded-md">${isEdit ? 'Update' : 'Simpan'}</button>
                </div>
            </form>`;
        showModal(modalContent);
        document.getElementById('jadwal-form').addEventListener('submit', saveJadwal);
        document.getElementById('cancel-btn').addEventListener('click', closeModal);
    }

    async function saveJadwal(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        const isEdit = !!data.id_jadwal;

        const endpoint = `${API_URL}jadwal_kuliah.php`;
        const options = {
            method: isEdit ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        };
        
        try {
            const response = await fetch(endpoint, options);
            const result = await response.json();

            if(result.success) {
                await renderJadwalTable();
                closeModal();
                showToast(`Jadwal berhasil ${isEdit ? 'diupdate' : 'disimpan'}!`, 'success');
            } else {
                showToast(result.message || 'Gagal menyimpan data.', 'error');
            }
        } catch (error) {
            console.error('Error saving jadwal:', error);
            showToast('Gagal menyimpan data.', 'error');
        }
    }

    async function renderKrsTable(searchTerm = '') {
        const krsData = await fetchData('krs');
        const tableBody = document.getElementById('data-table-body');
        if (!tableBody) return;
        
        const filteredData = krsData.filter(k => 
            k.nama_mahasiswa.toLowerCase().includes(searchTerm.toLowerCase()) || 
            k.nama_mk.toLowerCase().includes(searchTerm.toLowerCase()) ||
            k.nim.includes(searchTerm)
        );

        tableBody.innerHTML = filteredData.map(k => `
            <tr class="border-b">
                <td class="py-3 px-4">${k.nim}</td>
                <td class="py-3 px-4">${k.nama_mahasiswa}</td>
                <td class="py-3 px-4">${k.kode_mk}</td>
                <td class="py-3 px-4">${k.nama_mk}</td>
                <td class="py-3 px-4">
                    <button data-id_krs="${k.id_krs}" class="delete-btn text-red-600 hover:text-red-800"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    }

    function setupKrsEventListeners() {
        document.getElementById('add-btn').addEventListener('click', () => openKrsModal());
        document.getElementById('search-input').addEventListener('input', (e) => renderKrsTable(e.target.value));
        document.getElementById('data-table-body').addEventListener('click', e => {
            if (e.target.closest('.delete-btn')) {
                deleteData('krs', e.target.closest('.delete-btn').dataset.id_krs, 'id_krs');
            }
        });
    }

    async function openKrsModal() {
        await Promise.all([
            fetchData('mahasiswa'),
            fetchData('jadwal_kuliah')
        ]);

        const mahasiswaOptions = state.mahasiswa.map(m => `<option value="${m.nim}">${m.nim} - ${m.nama}</option>`).join('');
        const jadwalOptions = state.jadwal_kuliah.map(j => `<option value="${j.id_jadwal}">${j.nama_mk} (${j.hari}, ${j.jam_mulai.substring(0,5)}) - ${j.nama_golongan}</option>`).join('');

        const modalContent = `
            <h3 class="text-lg font-medium leading-6 text-gray-900">Tambah KRS</h3>
            <form id="krs-form" class="mt-4 space-y-4">
                <div>
                    <label for="nim" class="block text-sm font-medium text-gray-700">Mahasiswa</label>
                    <select name="nim" id="nim" class="mt-1 w-full rounded-md shadow-sm">${mahasiswaOptions}</select>
                </div>
                <div>
                    <label for="id_jadwal" class="block text-sm font-medium text-gray-700">Jadwal Matakuliah</label>
                    <select name="id_jadwal" id="id_jadwal" class="mt-1 w-full rounded-md shadow-sm">${jadwalOptions}</select>
                </div>
                <div>
                    <label for="semester" class="block text-sm font-medium text-gray-700">Semester</label>
                    <input type="number" name="semester" id="semester" required class="mt-1 w-full rounded-md shadow-sm" placeholder="Contoh: 3">
                </div>
                <div class="flex justify-end space-x-4">
                    <button type="button" id="cancel-btn" class="px-4 py-2 bg-gray-200 rounded-md">Batal</button>
                    <button type="submit" class="px-4 py-2 bg-blue-800 text-white rounded-md">Simpan</button>
                </div>
            </form>`;
        showModal(modalContent);
        document.getElementById('krs-form').addEventListener('submit', saveKrs);
        document.getElementById('cancel-btn').addEventListener('click', closeModal);
    }

    async function saveKrs(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        if (!data.nim || !data.id_jadwal || !data.semester) {
            showToast('Semua field harus diisi!', 'error');
            return;
        }
        
        const endpoint = `${API_URL}krs.php`;
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        };
        
        try {
            const response = await fetch(endpoint, options);
            const result = await response.json();

            if(result.success) {
                await renderKrsTable();
                closeModal();
                showToast('KRS berhasil ditambahkan!', 'success');
            } else {
                showToast(result.message || 'Gagal menyimpan data. Mungkin mahasiswa sudah mengambil jadwal ini.', 'error');
            }
        } catch (error) {
            console.error('Error saving KRS:', error);
            showToast('Gagal menyimpan data.', 'error');
        }
    }

    async function renderPengampuTable(searchTerm = '') {
        const pengampuData = await fetchData('pengampu');
        const tableBody = document.getElementById('data-table-body');
        if (!tableBody) return;
        
        const filteredData = pengampuData.filter(p => 
            p.nama_dosen.toLowerCase().includes(searchTerm.toLowerCase()) || 
            p.nama_mk.toLowerCase().includes(searchTerm.toLowerCase())
        );

        tableBody.innerHTML = filteredData.map(p => `
            <tr class="border-b">
                <td class="py-3 px-4">${p.kode_mk}</td>
                <td class="py-3 px-4">${p.nama_mk}</td>
                <td class="py-3 px-4">${p.nip_dosen}</td>
                <td class="py-3 px-4">${p.nama_dosen}</td>
                <td class="py-3 px-4">
                    <button data-id_pengampu="${p.id_pengampu}" class="delete-btn text-red-600 hover:text-red-800"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    }

    function setupPengampuEventListeners() {
        document.getElementById('add-btn').addEventListener('click', () => openPengampuModal());
        document.getElementById('search-input').addEventListener('input', (e) => renderPengampuTable(e.target.value));
        document.getElementById('data-table-body').addEventListener('click', e => {
            if (e.target.closest('.delete-btn')) {
                deleteData('pengampu', e.target.closest('.delete-btn').dataset.id_pengampu, 'id_pengampu');
            }
        });
    }

    async function openPengampuModal() {
        await Promise.all([
            fetchData('dosen'),
            fetchData('matakuliah'),
            fetchData('pengampu')
        ]);

        const assignedMk = state.pengampu.map(p => p.kode_mk);
        
        const dosenOptions = state.dosen.map(d => `<option value="${d.nip}">${d.nip} - ${d.nama}</option>`).join('');
        const matakuliahOptions = state.matakuliah
            .filter(m => !assignedMk.includes(m.kode_mk))
            .map(m => `<option value="${m.kode_mk}">${m.kode_mk} - ${m.nama_mk}</option>`).join('');

        const modalContent = `
            <h3 class="text-lg font-medium leading-6 text-gray-900">Tambah Pengampu</h3>
            <form id="pengampu-form" class="mt-4 space-y-4">
                <div>
                    <label for="kode_mk" class="block text-sm font-medium text-gray-700">Matakuliah</label>
                    <select name="kode_mk" id="kode_mk" class="mt-1 w-full rounded-md shadow-sm">${matakuliahOptions}</select>
                </div>
                <div>
                    <label for="nip_dosen" class="block text-sm font-medium text-gray-700">Dosen</label>
                    <select name="nip_dosen" id="nip_dosen" class="mt-1 w-full rounded-md shadow-sm">${dosenOptions}</select>
                </div>
                <div class="flex justify-end space-x-4">
                    <button type="button" id="cancel-btn" class="px-4 py-2 bg-gray-200 rounded-md">Batal</button>
                    <button type="submit" class="px-4 py-2 bg-blue-800 text-white rounded-md">Simpan</button>
                </div>
            </form>`;
        showModal(modalContent);
        document.getElementById('pengampu-form').addEventListener('submit', savePengampu);
        document.getElementById('cancel-btn').addEventListener('click', closeModal);
    }

    async function savePengampu(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        if(!data.kode_mk) {
            showToast('Tidak ada matakuliah yang bisa dipilih!', 'error');
            return;
        }
        
        const endpoint = `${API_URL}pengampu.php`;
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        };
        
        try {
            const response = await fetch(endpoint, options);
            const result = await response.json();

            if(result.success) {
                await renderPengampuTable();
                closeModal();
                showToast('Pengampu berhasil ditambahkan!', 'success');
            } else {
                showToast(result.message || 'Gagal menyimpan data.', 'error');
            }
        } catch (error) {
            console.error('Error saving pengampu:', error);
            showToast('Gagal menyimpan data.', 'error');
        }
    }

    async function renderMahasiswaJadwal() {
        const nim = sessionStorage.getItem('username');
        const mainContent = document.getElementById('main-content');
        
        mainContent.innerHTML = `
            <div class="p-8">
                <h1 class="text-3xl font-bold mb-6 text-gray-800">Jadwal Kuliah Anda</h1>
                <div id="jadwal-mahasiswa-container" class="bg-white p-6 rounded-lg shadow-lg">
                    <p>Memuat jadwal...</p>
                </div>
            </div>
        `;
    
        try {
            const jadwalData = await fetchData('jadwal_kuliah', { nim: nim });
            const container = document.getElementById('jadwal-mahasiswa-container');
    
            if (jadwalData.length > 0) {
                container.innerHTML = `
                    <table class="w-full text-left">
                        <thead>
                            <tr class="bg-gray-200">
                                <th class="py-3 px-4">Hari</th>
                                <th class="py-3 px-4">Jam</th>
                                <th class="py-3 px-4">Matakuliah</th>
                                <th class="py-3 px-4">Dosen</th>
                                <th class="py-3 px-4">Ruang</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${jadwalData.map(j => `
                                <tr class="border-b">
                                    <td class="py-3 px-4">${j.hari}</td>
                                    <td class="py-3 px-4">${j.jam_mulai.substring(0,5)} - ${j.jam_selesai.substring(0,5)}</td>
                                    <td class="py-3 px-4">${j.nama_mk}</td>
                                    <td class="py-3 px-4">${j.nama_dosen}</td>
                                    <td class="py-3 px-4">${j.nama_ruang}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            } else {
                container.innerHTML = '<p class="text-gray-600">Anda tidak memiliki jadwal kuliah.</p>';
            }
        } catch (error) {
            console.error('Error fetching mahasiswa jadwal:', error);
            document.getElementById('jadwal-mahasiswa-container').innerHTML = '<p class="text-red-500">Gagal memuat jadwal kuliah.</p>';
        }
    }

    async function renderMahasiswaPresensi() {
        const nim = sessionStorage.getItem('username');
        const mainContent = document.getElementById('main-content');
        
        mainContent.innerHTML = `
            <div class="p-8">
                <h1 class="text-3xl font-bold mb-6 text-gray-800">Rekap Presensi Anda</h1>
                <div id="presensi-mahasiswa-container" class="bg-white p-6 rounded-lg shadow-lg">
                    <p>Memuat data presensi...</p>
                </div>
            </div>
        `;
    
        try {
            const presensiData = await fetchData('presensi', { nim: nim });
            const container = document.getElementById('presensi-mahasiswa-container');
    
            if (presensiData.length > 0) {
                container.innerHTML = `
                    <table class="w-full text-left">
                        <thead>
                            <tr class="bg-gray-200">
                                <th class="py-3 px-4">Tanggal</th>
                                <th class="py-3 px-4">Matakuliah</th>
                                <th class="py-3 px-4">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${presensiData.map(p => `
                                <tr class="border-b">
                                    <td class="py-3 px-4">${new Date(p.tanggal).toLocaleDateString('id-ID')}</td>
                                    <td class="py-3 px-4">${p.nama_mk}</td>
                                    <td class="py-3 px-4">${p.status}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            } else {
                container.innerHTML = '<p class="text-gray-600">Anda belum memiliki data presensi.</p>';
            }
        } catch (error) {
            console.error('Error fetching mahasiswa presensi:', error);
            document.getElementById('presensi-mahasiswa-container').innerHTML = '<p class="text-red-500">Gagal memuat data presensi.</p>';
        }
    }

    async function renderDosenJadwal() {
        const nip = sessionStorage.getItem('username');
        const mainContent = document.getElementById('main-content');
        
        mainContent.innerHTML = `
            <div class="p-8">
                <h1 class="text-3xl font-bold mb-6 text-gray-800">Jadwal Mengajar Anda</h1>
                <div id="jadwal-dosen-container" class="bg-white p-6 rounded-lg shadow-lg">
                    <p>Memuat jadwal...</p>
                </div>
            </div>
        `;
    
        try {
            const jadwalData = await fetchData('jadwal_kuliah', { nip: nip });
            const container = document.getElementById('jadwal-dosen-container');
    
            if (jadwalData.length > 0) {
                container.innerHTML = `
                    <table class="w-full text-left">
                        <thead>
                            <tr class="bg-gray-200">
                                <th class="py-3 px-4">Hari</th>
                                <th class="py-3 px-4">Jam</th>
                                <th class="py-3 px-4">Matakuliah</th>
                                <th class="py-3 px-4">Ruang</th>
                                <th class="py-3 px-4">Golongan</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${jadwalData.map(j => `
                                <tr class="border-b">
                                    <td class="py-3 px-4">${j.hari}</td>
                                    <td class="py-3 px-4">${j.jam_mulai.substring(0,5)} - ${j.jam_selesai.substring(0,5)}</td>
                                    <td class="py-3 px-4">${j.nama_mk}</td>
                                    <td class="py-3 px-4">${j.nama_ruang}</td>
                                    <td class="py-3 px-4">${j.nama_golongan}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            } else {
                container.innerHTML = '<p class="text-gray-600">Anda tidak memiliki jadwal mengajar.</p>';
            }
        } catch (error) {
            console.error('Error fetching dosen jadwal:', error);
            document.getElementById('jadwal-dosen-container').innerHTML = '<p class="text-red-500">Gagal memuat jadwal mengajar.</p>';
        }
    }

    function renderDosenInputPresensi() {
        const userData = JSON.parse(sessionStorage.getItem('userData'));
        const pengampuData = JSON.parse(localStorage.getItem('pengampu') || '[]').filter(p => p.nip === userData.nip);
        const mkCodes = pengampuData.map(p => p.kode_mk);
        const matakuliahData = JSON.parse(localStorage.getItem('matakuliah') || '[]');
        
        const matakuliahOptions = matakuliahData
            .filter(m => mkCodes.includes(m.kode_mk))
            .map(m => `<option value="${m.kode_mk}">${m.nama_mk}</option>`).join('');

        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
            <div class="bg-white p-6 rounded-lg shadow-lg">
                <h2 class="text-xl font-semibold mb-4">Input Presensi</h2>
                <div class="space-y-4">
                    <div><label for="presensi-tanggal">Tanggal</label><input type="date" id="presensi-tanggal" value="${new Date().toISOString().substring(0, 10)}" class="mt-1 w-full rounded-md shadow-sm"></div>
                    <div><label for="presensi-mk">Matakuliah</label><select id="presensi-mk" class="mt-1 w-full rounded-md shadow-sm">${matakuliahOptions}</select></div>
                    <button id="load-mahasiswa-btn" class="w-full px-4 py-2 bg-blue-600 text-white rounded-md">Load Mahasiswa</button>
                </div>
                <form id="presensi-form" class="mt-4 hidden"></form>
            </div>
        `;
        document.getElementById('load-mahasiswa-btn').addEventListener('click', loadMahasiswaForPresensi);
    }
    
    function renderDosenMahasiswa() {
        const userData = JSON.parse(sessionStorage.getItem('userData'));
        const pengampuData = JSON.parse(localStorage.getItem('pengampu') || '[]').filter(p => p.nip === userData.nip);
        const mkCodes = pengampuData.map(p => p.kode_mk);
        
        const krsData = JSON.parse(localStorage.getItem('krs') || '[]').filter(k => mkCodes.includes(k.kode_mk));
        const nimList = [...new Set(krsData.map(k => k.nim))];
        
        const mahasiswaData = JSON.parse(localStorage.getItem('mahasiswa') || '[]').filter(m => nimList.includes(m.nim));
        const mainContent = document.getElementById('main-content');

        const tableRows = mahasiswaData.map(mhs => {
            return `<tr class="border-b">
                <td class="py-3 px-4">${mhs.nim}</td>
                <td class="py-3 px-4">${mhs.nama}</td>
                <td class="py-3 px-4">${mhs.semester}</td>
                <td class="py-3 px-4">${mhs.nohp}</td>
            </tr>`;
        }).join('');

         mainContent.innerHTML = `
            <div class="bg-white p-6 rounded-lg shadow-lg">
                <h2 class="text-xl font-semibold mb-4">Data Mahasiswa Bimbingan</h2>
                <table class="min-w-full bg-white">
                     <thead class="bg-blue-800 text-white">
                        <tr>
                            <th class="py-3 px-4 text-left">NIM</th>
                            <th class="py-3 px-4 text-left">Nama</th>
                            <th class="py-3 px-4 text-left">Semester</th>
                            <th class="py-3 px-4 text-left">No HP</th>
                        </tr>
                    </thead>
                    <tbody>${tableRows}</tbody>
                </table>
            </div>`;
    }


    async function setupPresensiPage() {

        await fetchData('matakuliah');
        const mkFilter = document.getElementById('filter-mk');
        state.matakuliah.forEach(mk => {
            mkFilter.innerHTML += `<option value="${mk.kode_mk}">${mk.nama_mk}</option>`;
        });


        document.getElementById('add-btn').addEventListener('click', renderAdminInputPresensi); 
        mkFilter.addEventListener('change', renderAdminPresensiTable);
        document.getElementById('filter-tanggal').addEventListener('change', renderAdminPresensiTable);

        await renderAdminPresensiTable();
    }

    async function renderAdminPresensiTable() {
        const tanggal = document.getElementById('filter-tanggal').value;
        const kode_mk = document.getElementById('filter-mk').value;
        
        let url = `${API_URL}presensi.php?`;
        if (tanggal) url += `tanggal=${tanggal}&`;
        if (kode_mk) url += `kode_mk=${kode_mk}&`;

        const presensiData = await fetch(url).then(res => res.json());
        const tableBody = document.getElementById('data-table-body');
        
        if (!tableBody) return;
        tableBody.innerHTML = presensiData.map(p => `
            <tr class="border-b">
                <td class="py-3 px-4">${new Date(p.tanggal).toLocaleDateString('id-ID')}</td>
                <td class="py-3 px-4">${p.nim}</td>
                <td class="py-3 px-4">${p.nama_mahasiswa}</td>
                <td class="py-3 px-4">${p.nama_mk}</td>
                <td class="py-3 px-4">${p.status}</td>
            </tr>
        `).join('');
    }

    async function renderMahasiswaKRS() {
        const nim = sessionStorage.getItem('username');
        const krsData = await fetch(`${API_URL}krs.php?nim=${nim}`).then(res => res.json());
        const matakuliahData = await fetch(`${API_URL}matakuliah.php`).then(res => res.json());
        const mainContent = document.getElementById('main-content');

        const tableRows = krsData.map(k => {
            const mk = matakuliahData.find(m => m.kode_mk === k.kode_mk) || {};
            return `<tr class="border-b"><td class="py-3 px-4">${mk.kode_mk}</td><td class="py-3 px-4">${mk.nama_mk}</td><td class="py-3 px-4">${mk.sks}</td></tr>`;
        }).join('');
        
        mainContent.innerHTML = `
            <div class="bg-white p-6 rounded-lg shadow-lg">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-semibold">Kartu Rencana Studi (KRS)</h2>
                    <button onclick="window.print()" class="bg-blue-800 text-white font-bold py-2 px-4 rounded"><i class="fas fa-print mr-2"></i>Cetak</button>
                </div>
                <table class="min-w-full bg-white">
                    <thead class="bg-blue-800 text-white">
                        <tr>
                            <th class="py-3 px-4 text-left">Kode MK</th>
                            <th class="py-3 px-4 text-left">Nama Matakuliah</th>
                            <th class="py-3 px-4 text-left">SKS</th>
                        </tr>
                    </thead>
                    <tbody>${tableRows}</tbody>
                </table>
            </div>`;
    }

    async function renderMahasiswaPresensi() {
        const nim = sessionStorage.getItem('username');
        const presensiData = await fetch(`${API_URL}presensi.php?nim=${nim}`).then(res => res.json());
        const mainContent = document.getElementById('main-content');
        
        const tableRows = presensiData.map(p => `
            <tr class="border-b">
                <td class="py-3 px-4">${new Date(p.tanggal).toLocaleDateString('id-ID')}</td>
                <td class="py-3 px-4">${p.nama_mk}</td>
                <td class="py-3 px-4">${p.status}</td>
            </tr>`).join('');

        mainContent.innerHTML = `
            <div class="bg-white p-6 rounded-lg shadow-lg">
                <h2 class="text-xl font-semibold mb-4">Rekap Presensi</h2>
                <table class="min-w-full bg-white">
                     <thead class="bg-blue-800 text-white">
                        <tr>
                            <th class="py-3 px-4 text-left">Tanggal</th>
                            <th class="py-3 px-4 text-left">Matakuliah</th>
                            <th class="py-3 px-4 text-left">Status</th>
                        </tr>
                    </thead>
                    <tbody>${tableRows}</tbody>
                </table>
            </div>`;
    } 

    async function renderInputPresensi() {
        const nip = sessionStorage.getItem('username');
        const mainContent = document.getElementById('main-content');
        
        mainContent.innerHTML = `
            <div class="p-8">
                <h1 class="text-3xl font-bold mb-6 text-gray-800">Input Presensi</h1>
                <div class="bg-white p-6 rounded-lg shadow-lg">
                    <div class="mb-4">
                        <label for="jadwal-select" class="block text-sm font-medium text-gray-700 mb-2">Pilih Jadwal:</label>
                        <select id="jadwal-select" class="w-full p-2 border rounded-md"></select>
                    </div>
                    <div class="mb-4">
                        <label for="tanggal-presensi" class="block text-sm font-medium text-gray-700 mb-2">Tanggal:</label>
                        <input type="date" id="tanggal-presensi" value="${new Date().toISOString().substring(0, 10)}" class="w-full p-2 border rounded-md">
                    </div>
                    <div id="mahasiswa-presensi-list"></div>
                    <button id="simpan-presensi-btn" class="mt-4 px-6 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-900 hidden">Simpan Presensi</button>
                </div>
            </div>
        `;

        try {
            const jadwalData = await fetchData('jadwal_kuliah', { nip: nip });
            const jadwalSelect = document.getElementById('jadwal-select');
            
            if(jadwalData.length > 0) {
                jadwalSelect.innerHTML = '<option value="">-- Pilih Matakuliah --</option>' + jadwalData.map(j => 
                    `<option value="${j.id_jadwal}">${j.nama_mk} (${j.hari}, ${j.jam_mulai.substring(0,5)}) - Gol. ${j.nama_golongan}</option>`
                ).join('');

                jadwalSelect.addEventListener('change', async (e) => {
                    const id_jadwal = e.target.value;
                    const mhsListContainer = document.getElementById('mahasiswa-presensi-list');
                    const saveBtn = document.getElementById('simpan-presensi-btn');
                    if (!id_jadwal) {
                        mhsListContainer.innerHTML = '';
                        saveBtn.classList.add('hidden');
                        return;
                    }

                    const mahasiswaData = await fetchData('krs', { id_jadwal: id_jadwal });
                    if (mahasiswaData.length > 0) {
                        mhsListContainer.innerHTML = `
                            <table class="w-full text-left mt-4">
                                <thead><tr class="bg-gray-200"><th class="py-3 px-4">NIM</th><th class="py-3 px-4">Nama</th><th class="py-3 px-4">Status</th></tr></thead>
                                <tbody>
                                    ${mahasiswaData.map(mhs => `
                                        <tr class="border-b" data-nim="${mhs.nim}">
                                            <td class="py-3 px-4">${mhs.nim}</td>
                                            <td class="py-3 px-4">${mhs.nama_mahasiswa}</td>
                                            <td class="py-3 px-4">
                                                <select class="status-presensi w-full p-1 border rounded-md">
                                                    <option value="Hadir">Hadir</option><option value="Sakit">Sakit</option><option value="Izin">Izin</option><option value="Alpa">Alpa</option>
                                                </select>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        `;
                        saveBtn.classList.remove('hidden');
                    } else {
                        mhsListContainer.innerHTML = '<p class="text-gray-600 mt-4">Tidak ada mahasiswa yang mengambil jadwal ini.</p>';
                        saveBtn.classList.add('hidden');
                    }
                });

                document.getElementById('simpan-presensi-btn').addEventListener('click', savePresensi);
            } else {
                jadwalSelect.innerHTML = '<option>Tidak ada jadwal mengajar</option>';
            }
        } catch (error) {
            console.error('Error setting up presensi:', error);
            document.getElementById('mahasiswa-presensi-list').innerHTML = '<p class="text-red-500">Gagal memuat data.</p>';
        }
    }

    async function savePresensi() {
        const id_jadwal = document.getElementById('jadwal-select').value;
        const tanggal = document.getElementById('tanggal-presensi').value;
        if (!id_jadwal || !tanggal) {
            showToast('Jadwal dan tanggal harus dipilih!', 'error');
            return;
        }

        const presensiData = [];
        document.querySelectorAll('#mahasiswa-presensi-list tbody tr').forEach(row => {
            presensiData.push({
                nim: row.dataset.nim,
                status: row.querySelector('.status-presensi').value
            });
        });

        if (presensiData.length === 0) {
            showToast('Tidak ada data mahasiswa untuk disimpan.', 'info');
            return;
        }

        const payload = {
            id_jadwal: id_jadwal,
            tanggal: tanggal,
            presensi: presensiData
        };
        
        try {
            const response = await fetch(`${API_URL}presensi.php`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if(result.success) {
                showToast('Data presensi berhasil disimpan!', 'success');
                document.getElementById('mahasiswa-presensi-list').innerHTML = '';
                document.getElementById('simpan-presensi-btn').classList.add('hidden');
                document.getElementById('jadwal-select').value = '';
            } else {
                showToast(result.message || 'Gagal menyimpan presensi.', 'error');
            }
        } catch(error) {
            console.error('Error saving presensi:', error);
            showToast('Terjadi kesalahan saat menyimpan.', 'error');
        }
    }

    async function renderDosenMahasiswaView() {
        const nip = sessionStorage.getItem('username');
        const mainContent = document.getElementById('main-content');
        
        mainContent.innerHTML = `
            <div class="p-8">
                <h1 class="text-3xl font-bold mb-6 text-gray-800">Mahasiswa Anda</h1>
                <div id="dosen-mahasiswa-container" class="bg-white p-6 rounded-lg shadow-lg">
                    <p>Memuat data mahasiswa...</p>
                </div>
            </div>
        `;

        try {
            const mahasiswaData = await fetchData('dosen', { action: 'get_mahasiswa', nip: nip });
            const container = document.getElementById('dosen-mahasiswa-container');

            if (mahasiswaData.length > 0) {
                container.innerHTML = `
                    <table class="w-full text-left">
                        <thead>
                            <tr class="bg-gray-200">
                                <th class="py-3 px-4">NIM</th>
                                <th class="py-3 px-4">Nama</th>
                                <th class="py-3 px-4">Jurusan</th>
                                <th class="py-3 px-4">Angkatan</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${mahasiswaData.map(mhs => `
                                <tr class="border-b">
                                    <td class="py-3 px-4">${mhs.nim}</td>
                                    <td class="py-3 px-4">${mhs.nama}</td>
                                    <td class="py-3 px-4">${mhs.jurusan}</td>
                                    <td class="py-3 px-4">${mhs.angkatan}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            } else {
                container.innerHTML = '<p class="text-gray-600">Tidak ada mahasiswa yang mengambil mata kuliah Anda.</p>';
            }
        } catch (error) {
            console.error('Error fetching dosen mahasiswa:', error);
            document.getElementById('dosen-mahasiswa-container').innerHTML = '<p class="text-red-500">Gagal memuat data mahasiswa.</p>';
        }
    }

    async function renderAdminInputPresensi() {
        const mainContent = document.getElementById('main-content');
        
        mainContent.innerHTML = `
            <div class="p-8">
                <h1 class="text-3xl font-bold mb-6 text-gray-800">Input Presensi (Admin)</h1>
                <div class="bg-white p-6 rounded-lg shadow-lg">
                    <div class="mb-4">
                        <label for="jadwal-select-admin" class="block text-sm font-medium text-gray-700 mb-2">Pilih Jadwal:</label>
                        <select id="jadwal-select-admin" class="w-full p-2 border rounded-md"></select>
                    </div>
                    <div class="mb-4">
                        <label for="tanggal-presensi-admin" class="block text-sm font-medium text-gray-700 mb-2">Tanggal:</label>
                        <input type="date" id="tanggal-presensi-admin" value="${new Date().toISOString().substring(0, 10)}" class="w-full p-2 border rounded-md">
                    </div>
                    <div id="mahasiswa-presensi-list-admin"></div>
                    <button id="simpan-presensi-btn-admin" class="mt-4 px-6 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-900 hidden">Simpan Presensi</button>
                </div>
            </div>
        `;

        try {
            const jadwalData = await fetchData('jadwal_kuliah');
            const jadwalSelect = document.getElementById('jadwal-select-admin');
            
            if(jadwalData.length > 0) {
                jadwalSelect.innerHTML = '<option value="">-- Pilih Matakuliah --</option>' + jadwalData.map(j => 
                    `<option value="${j.id_jadwal}">${j.nama_mk} (${j.hari}, ${j.jam_mulai.substring(0,5)}) - ${j.nama_dosen} - Gol. ${j.nama_golongan}</option>`
                ).join('');

                jadwalSelect.addEventListener('change', async (e) => {
                    const id_jadwal = e.target.value;
                    const mhsListContainer = document.getElementById('mahasiswa-presensi-list-admin');
                    const saveBtn = document.getElementById('simpan-presensi-btn-admin');
                    if (!id_jadwal) {
                        mhsListContainer.innerHTML = '';
                        saveBtn.classList.add('hidden');
                        return;
                    }

                    const mahasiswaData = await fetchData('krs', { id_jadwal: id_jadwal });
                    if (mahasiswaData.length > 0) {
                        mhsListContainer.innerHTML = `
                            <table class="w-full text-left mt-4">
                                <thead><tr class="bg-gray-200"><th class="py-3 px-4">NIM</th><th class="py-3 px-4">Nama</th><th class="py-3 px-4">Status</th></tr></thead>
                                <tbody>
                                    ${mahasiswaData.map(mhs => `
                                        <tr class="border-b" data-nim="${mhs.nim}">
                                            <td class="py-3 px-4">${mhs.nim}</td>
                                            <td class="py-3 px-4">${mhs.nama_mahasiswa}</td>
                                            <td class="py-3 px-4">
                                                <select class="status-presensi-admin w-full p-1 border rounded-md">
                                                    <option value="Hadir">Hadir</option><option value="Sakit">Sakit</option><option value="Izin">Izin</option><option value="Alpa">Alpa</option>
                                                </select>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        `;
                        saveBtn.classList.remove('hidden');
                    } else {
                        mhsListContainer.innerHTML = '<p class="text-gray-600 mt-4">Tidak ada mahasiswa yang mengambil jadwal ini.</p>';
                        saveBtn.classList.add('hidden');
                    }
                });

                document.getElementById('simpan-presensi-btn-admin').addEventListener('click', saveAdminPresensi);
            } else {
                jadwalSelect.innerHTML = '<option>Tidak ada jadwal tersedia</option>';
            }
        } catch (error) {
            console.error('Error setting up admin presensi:', error);
            document.getElementById('mahasiswa-presensi-list-admin').innerHTML = '<p class="text-red-500">Gagal memuat data.</p>';
        }
    }

    async function saveAdminPresensi() {
        const id_jadwal = document.getElementById('jadwal-select-admin').value;
        const tanggal = document.getElementById('tanggal-presensi-admin').value;
        if (!id_jadwal || !tanggal) {
            showToast('Jadwal dan tanggal harus dipilih!', 'error');
            return;
        }

        const presensiData = [];
        document.querySelectorAll('#mahasiswa-presensi-list-admin tbody tr').forEach(row => {
            presensiData.push({
                nim: row.dataset.nim,
                status: row.querySelector('.status-presensi-admin').value
            });
        });

        if (presensiData.length === 0) {
            showToast('Tidak ada data mahasiswa untuk disimpan.', 'info');
            return;
        }

        const payload = {
            id_jadwal: id_jadwal,
            tanggal: tanggal,
            presensi: presensiData
        };
        
        try {
            const response = await fetch(`${API_URL}presensi.php`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if(result.success) {
                showToast('Data presensi berhasil disimpan!', 'success');
                document.getElementById('mahasiswa-presensi-list-admin').innerHTML = '';
                document.getElementById('simpan-presensi-btn-admin').classList.add('hidden');
                document.getElementById('jadwal-select-admin').value = '';
            } else {
                showToast(result.message || 'Gagal menyimpan presensi.', 'error');
            }
        } catch(error) {
            console.error('Error saving admin presensi:', error);
            showToast('Terjadi kesalahan saat menyimpan.', 'error');
        }
    }

    async function renderMahasiswaDashboard() {
        const nim = sessionStorage.getItem('username');
        const allMahasiswa = await fetchData('mahasiswa');
        const userData = allMahasiswa.find(m => m.nim === nim);
        
        if (userData) {
            const mainContent = document.getElementById('main-content');
            mainContent.innerHTML = `
                <div class="bg-white p-6 rounded-lg shadow-lg">
                    <h2 class="text-2xl font-bold mb-4">Selamat Datang, ${userData.nama}!</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><strong>NIM:</strong> ${userData.nim}</div>
                        <div><strong>Jurusan:</strong> ${userData.jurusan}</div>
                        <div><strong>Angkatan:</strong> ${userData.angkatan}</div>
                    </div>
                </div>`;
        } else {
            document.getElementById('main-content').innerHTML = '<p>Data mahasiswa tidak ditemukan.</p>';
        }
    }

    async function loadMahasiswaForPresensi() {
        const id_jadwal = document.getElementById('presensi-jadwal').value;
        if (!id_jadwal) return;

        const mahasiswaList = await fetch(`${API_URL}presensi.php?id_jadwal=${id_jadwal}`).then(res => res.json());
        const container = document.getElementById('mahasiswa-list-container');
        const form = document.getElementById('presensi-form');
        
        if (mahasiswaList.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-500">Tidak ada mahasiswa yang mengambil jadwal ini.</p>';
            form.classList.add('hidden');
            return;
        }

        container.innerHTML = mahasiswaList.map(mhs => `
            <div class="flex items-center justify-between p-2 border rounded-md" data-nim="${mhs.nim}">
                <span>${mhs.nim} - ${mhs.nama}</span>
                <select name="status" class="rounded-md border-gray-300 shadow-sm">
                    <option value="Hadir">Hadir</option>
                    <option value="Sakit">Sakit</option>
                    <option value="Izin">Izin</option>
                    <option value="Alpa">Alpa</option>
                </select>
            </div>
        `).join('');

        form.classList.remove('hidden');
        form.addEventListener('submit', savePresensi);
    }

    async function savePresensi(e) {
        e.preventDefault();
        const id_jadwal = document.getElementById('presensi-jadwal').value;
        const tanggal = document.getElementById('presensi-tanggal').value;
        const mhsRows = document.querySelectorAll('#mahasiswa-list-container > div');

        const presensi_data = Array.from(mhsRows).map(row => ({
            nim: row.dataset.nim,
            status: row.querySelector('select[name="status"]').value
        }));

        const payload = { id_jadwal, tanggal, presensi: presensi_data };

        const response = await fetch(`${API_URL}presensi.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (result.success) {
            showToast('Presensi berhasil disimpan!', 'success');
            document.getElementById('presensi-form').classList.add('hidden');
        } else {
            showToast(result.message || 'Gagal menyimpan presensi.', 'error');
        }
    }

    async function renderAdminPresensiView() {
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
        <div class="p-8">
            <div class="flex justify-between items-center mb-6">
                <h1 class="text-3xl font-bold text-gray-800">Data Presensi</h1>
                <button id="input-presensi-btn" class="px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-900 flex items-center">
                    <i class="fas fa-plus-circle mr-2"></i>Input Presensi
                </button>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-lg">
                <div id="presensi-view-container">
                    <p>Memuat data presensi...</p>
                </div>
            </div>
        </div>
        `;

        document.getElementById('input-presensi-btn').addEventListener('click', () => showPage('input_presensi'));

        try {
            const presensiData = await fetchData('presensi');
            const container = document.getElementById('presensi-view-container');

            if (presensiData.length > 0) {
                container.innerHTML = `
                    <table class="w-full text-left">
                        <thead>
                            <tr class="bg-gray-200">
                                <th class="py-3 px-4">Tanggal</th>
                                <th class="py-3 px-4">NIM</th>
                                <th class="py-3 px-4">Nama Mahasiswa</th>
                                <th class="py-3 px-4">Matakuliah</th>
                                <th class="py-3 px-4">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${presensiData.map(p => `
                                <tr class="border-b">
                                    <td class="py-3 px-4">${new Date(p.tanggal).toLocaleDateString('id-ID', {day: '2-digit', month: '2-digit', year: 'numeric'})}</td>
                                    <td class="py-3 px-4">${p.nim}</td>
                                    <td class="py-3 px-4">${p.nama_mahasiswa}</td>
                                    <td class="py-3 px-4">${p.nama_mk}</td>
                                    <td class="py-3 px-4">
                                        <span class="px-2 py-1 text-sm rounded-full ${
                                            p.status === 'Hadir' ? 'bg-green-200 text-green-800' : 
                                            p.status === 'Sakit' ? 'bg-yellow-200 text-yellow-800' :
                                            p.status === 'Izin' ? 'bg-blue-200 text-blue-800' : 
                                            'bg-red-200 text-red-800'
                                        }">${p.status}</span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            } else {
                container.innerHTML = '<p class="text-gray-600">Belum ada data presensi yang tercatat.</p>';
            }
        } catch (error) {
            console.error('Error fetching presensi view:', error);
            container.innerHTML = '<p class="text-red-500">Gagal memuat data presensi.</p>';
        }
    }
}); 