import React, { useEffect, useMemo, useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import {
  Activity,
  BarChart2,
  Bell,
  Camera,
  Edit,
  Eye,
  EyeOff,
  Image,
  LogOut,
  MapPin,
  Menu,
  MessageSquare,
  Plus,
  Send,
  Settings,
  Trash2,
  Truck,
  User,
  Users,
  Lock
} from 'lucide-react';

import Modal from './components/Modal';
import ConfirmDialog from './components/ConfirmDialog';
import BottomNav from './components/BottomNav';
import ToastStack from './components/ToastStack';
import { ToastProvider, useToast } from './components/useToast';
import { useLocalStorageState } from './components/useLocalStorage';
import { nowIso, sortBy, uid, formatTimeId } from './lib/storage';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

const APP_VERSION = 'V.kelompok 32';
const DEFAULT_LOCATION = 'LOK-001';

// ---------- UTIL ----------
function clampText(str, max = 120) {
  if (!str) return '';
  return str.length > max ? `${str.slice(0, max)}...` : str;
}

function roleLabel(role) {
  if (role === 'admin') return 'ADMIN';
  if (role === 'petugas') return 'PETUGAS';
  return 'PELIHAT';
}

function useTheme() {
  const [theme, setTheme] = useLocalStorageState('swms_theme', 'device'); // device | light | dark

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.setAttribute('data-theme', 'dark');
    else if (theme === 'light') root.setAttribute('data-theme', 'light');
    else {
      // device
      const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
      if (mq?.matches) root.setAttribute('data-theme', 'dark');
      else root.setAttribute('data-theme', 'light');
    }
  }, [theme]);

  return { theme, setTheme };
}

// ---------- DEFAULT DATA ----------
const defaultUsers = [
  {
    id: uid('user'),
    name: 'Admin Utama',
    email: 'admin@swms.com',
    role: 'admin',
    area: '-',
    address: '-',
    wa: '-',
    createdBy: 'System',
    createdAt: nowIso()
  },
  {
    id: uid('user'),
    name: 'Budi Santoso',
    email: 'petugas@swms.com',
    role: 'petugas',
    area: DEFAULT_LOCATION,
    address: 'Kampus',
    wa: '+62 812 0000 0000',
    createdBy: 'Admin Utama',
    createdAt: nowIso()
  },
  {
    id: uid('user'),
    name: 'Viewer Demo',
    email: 'viewer@swms.com',
    role: 'viewer',
    area: '-',
    address: '-',
    wa: '+62 812 1111 1111',
    createdBy: 'Mandiri',
    createdAt: nowIso()
  }
];

const defaultLoginCms = [
  {
    id: uid('cms'),
    title: 'Selamat Datang di SWMS',
    desc: 'SWMS adalah sistem pengelolaan sampah cerdas berbasis IoT dan AI. Anda bisa memantau kondisi tong secara realtime dan menerima notifikasi.',
    links: [
      { label: 'YouTube Demo', url: 'https://youtube.com' },
      { label: 'Instagram', url: 'https://instagram.com' }
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1528323273322-d81458248d40?auto=format&fit=crop&w=900&q=80' },
      { url: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=900&q=80' }
    ],
    videos: [{ url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }],
    status: 'tayang',
    showFrom: '',
    showUntil: '',
    createdAt: nowIso()
  }
];

const defaultTeam = [
  {
    id: uid('team'),
    name: 'Rif Dmz',
    nim: '—',
    kelas: 'CD 32',
    motivasi: 'Tetap semangat, jaga lingkungan!',
    ig: 'https://instagram.com',
    wa: 'https://wa.me/6281234567890',
    email: 'mailto:kuwagataohger27@gmail.com?subject=Halo%20SWMS&body=Perkenalkan%20saya%20...',
    photoUrl: '',
    hidden: false
  },
  {
    id: uid('team'),
    name: 'Anggota 2',
    nim: '123456',
    kelas: 'CD 32',
    motivasi: 'Bersih itu keren.',
    ig: 'https://instagram.com',
    wa: 'https://wa.me/6280000000000',
    email: 'mailto:contoh@email.com',
    photoUrl: '',
    hidden: false
  },
  {
    id: uid('team'),
    name: 'Anggota 3',
    nim: '123457',
    kelas: 'CD 32',
    motivasi: 'Sampah terpilah, bumi sehat.',
    ig: 'https://instagram.com',
    wa: 'https://wa.me/6280000000001',
    email: 'mailto:contoh@email.com',
    photoUrl: '',
    hidden: false
  }
];

const defaultBroadcastTemplates = [
  { id: uid('tpl'), label: '[ALERT] Sampah Penuh', text: 'Tong {tong} di {lokasi} penuh. Mohon segera ditangani.', createdBy: 'Admin Utama', createdAt: nowIso() },
  { id: uid('tpl'), label: '[INFO] Maintenance', text: 'Jadwal maintenance alat di {lokasi} pukul {jam}.', createdBy: 'Admin Utama', createdAt: nowIso() }
];

const defaultReviews = [
  { id: uid('rev'), rating: 4, text: 'Alatnya membantu, tapi kadang sensor lambat.', photoUrl: '', createdAt: nowIso(), hidden: false, replies: [{ id: uid('rep'), text: 'Terima kasih, kami cek kalibrasi sensornya.', createdAt: nowIso(), hidden: false }] }
];

const defaultHwConfig = {
  location: DEFAULT_LOCATION,
  servo1: 90,
  servo2: 90,
  lcdLine1: 'SWMS READY',
  lcdLine2: 'LOK-001',
  ultrasonic: {
    plastik: { empty: 50, full: 10 },
    kertas: { empty: 50, full: 10 },
    kaleng: { empty: 50, full: 10 }
  }
};

// ---------- LOGIN PAGE ----------
function LoginPage({ onLogin, cmsLogin, team, users, setUsers }) {
  const { push } = useToast();
  const [isRegister, setIsRegister] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [form, setForm] = useState({
    name: '',
    address: '',
    wa: '',
    email: '',
    password: '',
    password2: ''
  });

  const activeCms = useMemo(() => {
    const tayang = cmsLogin.filter((x) => x.status === 'tayang');
    return tayang.slice(0, 2);
  }, [cmsLogin]);

  const handleLogin = (e) => {
    e.preventDefault();
    const email = form.email.trim().toLowerCase();
    const pass = form.password;

    const found = users.find((u) => u.email.toLowerCase() === email);
    if (!found) {
      push('Akun tidak ditemukan. Jika pelihat, silakan daftar.', 'error');
      return;
    }

    // Demo password (simple). Untuk produksi: pakai backend + hash.
    const ok = pass === 'SWMS1234' || pass === 'demo' || pass === '';
    if (!ok) {
      push('Password salah. Demo: pakai SWMS1234', 'error');
      return;
    }

    onLogin({ id: found.id, name: found.name, email: found.email, role: found.role, area: found.area });
    push('Berhasil login', 'success');
  };

  const handleRegister = (e) => {
    e.preventDefault();
    const email = form.email.trim().toLowerCase();
    if (!form.name || !form.address || !form.wa || !email) {
      push('Mohon lengkapi semua data pendaftaran.', 'error');
      return;
    }
    if (form.password.length < 4) {
      push('Password minimal 4 karakter (demo).', 'error');
      return;
    }
    if (form.password !== form.password2) {
      push('Konfirmasi password tidak sama.', 'error');
      return;
    }
    if (users.some((u) => u.email.toLowerCase() === email)) {
      push('Email sudah terdaftar.', 'error');
      return;
    }

    const newUser = {
      id: uid('user'),
      name: form.name,
      email,
      role: 'viewer',
      area: '-',
      address: form.address,
      wa: form.wa,
      createdBy: 'Mandiri',
      createdAt: nowIso()
    };
    setUsers((prev) => [newUser, ...prev]);
    push('Pendaftaran berhasil. Silakan login (password demo: SWMS1234 untuk admin/petugas).', 'success');
    setIsRegister(false);
  };

  return (
    <div className="min-h-screen w-full bg-emerald-50 flex flex-col md:flex-row">
      {/* Left / Info */}
      <div className="w-full md:w-1/2 bg-emerald-600 p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-8">
            <div className="bg-white p-2 rounded-full text-emerald-600 font-extrabold text-xl shadow-lg">♻️</div>
            <div>
              <h1 className="text-2xl font-bold tracking-wide">SWMS</h1>
              <p className="text-xs opacity-90">Smart Waste Management System • {APP_VERSION}</p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-4xl font-extrabold leading-tight">Kelola sampah secara realtime</h2>
            <p className="text-lg opacity-90 max-w-md">Monitoring, analisis data, konfigurasi hardware, dan broadcast notifikasi dalam satu dashboard.</p>

            {/* up to 2 cms items */}
            <div className="space-y-4">
              {activeCms.map((c) => (
                <div key={c.id} className="bg-white/10 border border-white/20 rounded-2xl p-4 backdrop-blur">
                  <p className="font-bold">{c.title}</p>
                  <p className="text-sm opacity-90 mt-1">{clampText(c.desc, 160)}</p>
                  {!!c.links?.length && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {c.links.slice(0,3).map((l, idx) => (
                        <a key={idx} href={l.url} target="_blank" rel="noreferrer" className="text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full">
                          {l.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-white/20">
              <h3 className="font-bold mb-4 flex items-center gap-2"><Users size={18}/> Tim Kelompok CD 32</h3>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {team.filter(t=>!t.hidden).slice(0,3).map((p) => (
                  <div key={p.id} className="min-w-[160px] bg-white/10 p-4 rounded-2xl backdrop-blur text-center border border-white/10 hover:scale-[1.02] transition">
                    <div className="w-14 h-14 bg-white/20 rounded-full mx-auto mb-2 flex items-center justify-center text-lg font-bold">
                      {p.name?.charAt(0) || 'A'}
                    </div>
                    <p className="font-bold text-sm">{p.name}</p>
                    <p className="text-[10px] opacity-80">{p.nim} • {p.kelas}</p>
                    <p className="text-[11px] opacity-90 mt-2">{clampText(p.motivasi, 44)}</p>
                    <div className="flex justify-center gap-2 mt-3">
                      {p.ig && <a href={p.ig} target="_blank" rel="noreferrer" className="w-7 h-7 bg-pink-500 rounded-full flex items-center justify-center text-[10px] font-bold">IG</a>}
                      {p.wa && <a href={p.wa} target="_blank" rel="noreferrer" className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center text-[10px] font-bold">WA</a>}
                      {p.email && <a href={p.email} className="w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold">@</a>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        <div className="absolute top-[-10%] right-[-10%] w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      </div>

      {/* Right / Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white relative">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-emerald-800">{isRegister ? 'Daftar Akun Pelihat' : 'Masuk ke Akun'}</h2>
            <p className="text-gray-500 mt-2 text-sm">Demo login: admin@swms.com / SWMS1234</p>
          </div>

          <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-4">
            {isRegister && (
              <>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
                  <input value={form.name} onChange={(e)=>setForm(f=>({...f,name:e.target.value}))} className="w-full pl-10 p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Nama Lengkap" />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 text-gray-400" size={18} />
                  <input value={form.address} onChange={(e)=>setForm(f=>({...f,address:e.target.value}))} className="w-full pl-10 p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Alamat" />
                </div>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3.5 text-gray-400" size={18} />
                  <input value={form.wa} onChange={(e)=>setForm(f=>({...f,wa:e.target.value}))} className="w-full pl-10 p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Nomor WhatsApp" />
                </div>
              </>
            )}

            <div className="relative">
              <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input value={form.email} onChange={(e)=>setForm(f=>({...f,email:e.target.value}))} className="w-full pl-10 p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Email" />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={(e)=>setForm(f=>({...f,password:e.target.value}))}
                className="w-full pl-10 pr-10 p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="Password"
              />
              <button type="button" onClick={()=>setShowPass(s=>!s)} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
                {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
              </button>
            </div>

            {isRegister && (
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input
                  type={showPass2 ? 'text' : 'password'}
                  value={form.password2}
                  onChange={(e)=>setForm(f=>({...f,password2:e.target.value}))}
                  className="w-full pl-10 pr-10 p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="Konfirmasi Password"
                />
                <button type="button" onClick={()=>setShowPass2(s=>!s)} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
                  {showPass2 ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
            )}

            <button type="submit" className="w-full btn-primary py-3 rounded-xl font-bold shadow-lg active:scale-[0.99] transition">
              {isRegister ? 'Daftar Sekarang' : 'Masuk'}
            </button>

            <p className="text-center text-sm text-gray-600 cursor-pointer hover:underline" onClick={()=>setIsRegister(v=>!v)}>
              {isRegister ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Daftar sebagai Pelihat'}
            </p>
          </form>

          <div className="text-center text-xs text-gray-400">© 2026 SWMS {APP_VERSION}</div>
        </div>
      </div>
    </div>
  );
}

// ---------- APP LAYOUT ----------
function AppLayout({ user, onLogout, state }) {
  const { theme, setTheme } = useTheme();
  const { push } = useToast();

  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [iotStatus, setIotStatus] = useState('online');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // demo status toggle
  useEffect(() => {
    const t = setInterval(() => {
      setIotStatus((s) => (s === 'online' ? 'online' : 'online'));
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const menus = useMemo(() => ([
    { id: 'dashboard', label: 'Dashboard', short: 'Home', icon: <Activity size={20} />, roles: ['admin','petugas','viewer'] },
    { id: 'pengangkutan', label: 'Pengangkutan', short: 'Ambil', icon: <Truck size={20} />, roles: ['admin','petugas'] },
    { id: 'analisis', label: 'Analisis Data', short: 'Data', icon: <BarChart2 size={20} />, roles: ['admin','petugas','viewer'] },
    { id: 'ulasan', label: 'Ulasan & Rating', short: 'Ulasan', icon: <MessageSquare size={20} />, roles: ['admin','petugas','viewer'] },
    { id: 'config', label: 'Config Hardware', short: 'Config', icon: <Settings size={20} />, roles: ['admin'] },
    { id: 'logs', label: 'ESP32 Logs', short: 'Logs', icon: <Image size={20} />, roles: ['admin'] },
    { id: 'users', label: 'User Management', short: 'User', icon: <Users size={20} />, roles: ['admin'] },
    { id: 'cms', label: 'CMS Editor', short: 'CMS', icon: <Menu size={20} />, roles: ['admin'] },
    { id: 'broadcast', label: 'Broadcast', short: 'Notif', icon: <Bell size={20} />, roles: ['admin'] },
    { id: 'profile', label: 'Profil Saya', short: 'Profil', icon: <User size={20} />, roles: ['admin','petugas','viewer'] }
  ]), []);

  const filteredMenus = useMemo(() => menus.filter((m) => m.roles.includes(user.role)), [menus, user.role]);

  const title = useMemo(() => {
    const m = menus.find(x=>x.id===activeMenu);
    return m?.label || activeMenu;
  }, [menus, activeMenu]);

  const contentProps = { user, setActiveMenu, push, ...state };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--swms-bg)' }}>
      {/* Sidebar (desktop) */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} hidden sm:flex bg-white shadow-xl transition-all duration-300 flex-col z-20`}
           style={{ background: 'var(--swms-card)' }}>
        <div className="p-4 flex items-center justify-center border-b h-16">
          {sidebarOpen ? (
            <div className="flex items-center gap-2 font-bold text-xl text-emerald-600">
              <span>♻️</span> SWMS
            </div>
          ) : (
            <span className="text-emerald-600 text-xl">♻️</span>
          )}
        </div>
        <nav className="flex-1 overflow-y-auto py-2">
          {filteredMenus.map((menu) => (
            <button
              key={menu.id}
              onClick={() => setActiveMenu(menu.id)}
              className={`w-full flex items-center p-4 transition-all duration-200 group ${
                activeMenu === menu.id
                  ? 'bg-emerald-50 text-emerald-600 border-r-4 border-emerald-600'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              {menu.icon}
              {sidebarOpen ? <span className="ml-3 font-medium text-sm">{menu.label}</span> : null}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t text-xs text-gray-400">{APP_VERSION}</div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white h-16 shadow-sm flex items-center justify-between px-4 sm:px-6 z-10" style={{ background: 'var(--swms-card)' }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen((s) => !s)} className="hidden sm:inline-flex p-2 hover:bg-gray-100 rounded-full">
              <Menu size={20} className="text-gray-600" />
            </button>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">{title}</h2>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-bold text-gray-700">
                {currentTime.toLocaleString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
              </span>
              <div className="flex items-center gap-2 text-xs">
                <span className={`w-2 h-2 rounded-full ${iotStatus === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-gray-500 font-medium">{iotStatus === 'online' ? 'Device Online' : 'Device Offline'}</span>
              </div>
            </div>

            {/* Theme */}
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="hidden sm:block text-sm border rounded-xl px-3 py-2 bg-white"
              title="Theme"
            >
              <option value="device">Tema: Device</option>
              <option value="light">Tema: Terang</option>
              <option value="dark">Tema: Gelap</option>
            </select>

            {/* Profile */}
            <div className="flex items-center gap-3 border-l pl-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-800 leading-tight">{user.name}</p>
                <p className={`text-[10px] uppercase font-bold tracking-wide ${user.role==='admin' ? 'text-purple-600' : user.role==='petugas' ? 'text-blue-600' : 'text-gray-500'}`}
                >{roleLabel(user.role)}</p>
              </div>
              <button
                onClick={() => setActiveMenu('profile')}
                className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold shadow-inner"
                title="Profil"
              >
                {user.name?.charAt(0) || 'U'}
              </button>
              <button
                onClick={() => { onLogout(); push('Logout berhasil', 'success'); }}
                className="p-2 hover:bg-red-50 text-red-500 rounded-full"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 pb-24 sm:pb-6">
          {activeMenu === 'dashboard' && <Dashboard {...contentProps} />}
          {activeMenu === 'pengangkutan' && <Collection {...contentProps} />}
          {activeMenu === 'analisis' && <Analysis {...contentProps} />}
          {activeMenu === 'ulasan' && <Ulasan {...contentProps} />}
          {activeMenu === 'config' && <HardwareConfig {...contentProps} />}
          {activeMenu === 'logs' && <ESP32Logs {...contentProps} />}
          {activeMenu === 'users' && <UserManagement {...contentProps} />}
          {activeMenu === 'cms' && <CMSEditor {...contentProps} />}
          {activeMenu === 'broadcast' && <Broadcast {...contentProps} />}
          {activeMenu === 'profile' && <UserProfile {...contentProps} />}
        </main>

        {/* Bottom nav (mobile) */}
        <BottomNav menus={filteredMenus} activeMenu={activeMenu} onSelect={setActiveMenu} />
      </div>
    </div>
  );
}

// ---------- DASHBOARD ----------
function Dashboard({ user, locations, logs, setLogs }) {
  const { push } = useToast();
  const [selectedLoc, setSelectedLoc] = useState(user.role === 'petugas' ? (user.area || DEFAULT_LOCATION) : DEFAULT_LOCATION);

  const perRoleLogs = useMemo(() => {
    if (user.role === 'admin') return logs;
    if (user.role === 'petugas') return logs.filter(l => l.location === user.area || l.location === selectedLoc);
    return logs.filter(l => l.type === 'status' || l.type === 'info');
  }, [logs, user.role, user.area, selectedLoc]);

  const bins = useMemo(() => {
    // demo random fill
    const rand = () => Math.floor(10 + Math.random() * 80);
    return {
      plastik: rand(),
      kertas: rand(),
      kaleng: rand()
    };
  }, [selectedLoc]);

  function addDemoLog() {
    const item = {
      id: uid('log'),
      at: formatTimeId(new Date()),
      location: selectedLoc,
      type: 'event',
      message: `Sensor mendeteksi sampah di ${selectedLoc}. Servo bergerak.`
    };
    setLogs(prev => [item, ...prev].slice(0, 200));
    push('Log ditambahkan (demo).', 'success');
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg flex justify-between items-center">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">Halo, {user.name}! 👋</h2>
          <p className="opacity-90 mt-1">Anda login sebagai <span className="font-bold uppercase bg-white/20 px-2 py-0.5 rounded text-sm">{roleLabel(user.role)}</span></p>
        </div>
        <button onClick={addDemoLog} className="bg-white/20 hover:bg-white/25 px-4 py-2 rounded-xl text-sm font-bold">
          + Tambah Log Demo
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="font-bold text-gray-700 flex items-center gap-2"><MapPin size={18}/> Lokasi</div>
        <select value={selectedLoc} onChange={(e)=>setSelectedLoc(e.target.value)} className="border rounded-xl px-3 py-2 bg-white">
          {locations.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { key: 'plastik', label: 'Tong Plastik', color: 'bg-yellow-500' },
          { key: 'kertas', label: 'Tong Kertas', color: 'bg-blue-500' },
          { key: 'kaleng', label: 'Tong Kaleng', color: 'bg-red-500' }
        ].map((t) => (
          <div key={t.key} className="card p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-700 flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${t.color}`} />
                {t.label}
              </h3>
              <span className="badge bg-green-100 text-green-700">Normal</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-gray-900">{bins[t.key]}%</span>
              <span className="text-gray-400 mb-1 text-sm">Terisi</span>
            </div>
            <div className="w-full bg-gray-100 h-3 rounded-full mt-4 overflow-hidden">
              <div className={`h-full rounded-full ${t.color}`} style={{ width: `${bins[t.key]}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6 border border-gray-100">
          <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><Activity size={18}/> Log Aktivitas</h3>
          <div className="space-y-0">
            {perRoleLogs.slice(0, 18).map((l) => (
              <div key={l.id} className="flex items-center gap-3 text-sm p-3 hover:bg-gray-50 rounded-xl border-b last:border-0 border-gray-50">
                <span className="text-gray-400 font-mono text-xs">{l.at}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-gray-700">{l.message}</span>
              </div>
            ))}
            {perRoleLogs.length === 0 ? <div className="text-sm text-gray-500">Belum ada log.</div> : null}
          </div>
        </div>
        <AIHelpCard />
      </div>
    </div>
  );
}

function AIHelpCard() {
  const { push } = useToast();
  const [q, setQ] = useState('');
  const [msgs, setMsgs] = useState([
    { from: 'ai', text: 'Halo! Saya asisten AI SWMS (demo). Tanyakan seputar penggunaan menu.' }
  ]);

  function send() {
    const text = q.trim();
    if (!text) return;
    setMsgs((m) => [...m, { from: 'user', text }, { from: 'ai', text: 'Demo: fitur AI akan dihubungkan ke backend nanti.' }]);
    setQ('');
    push('Pesan terkirim (demo).', 'success');
  }

  return (
    <div className="card p-6 border border-gray-100 flex flex-col">
      <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">🤖 AI Assistant</h3>
      <div className="flex-1 bg-gray-50 rounded-xl p-4 mb-3 text-sm text-gray-700 overflow-y-auto max-h-56 border">
        {msgs.map((m, idx) => (
          <div key={idx} className={`mb-2 ${m.from==='user'?'text-right':''}`}>
            <span className={`inline-block rounded-xl px-3 py-2 shadow-sm ${m.from==='user'?'bg-emerald-600 text-white':'bg-white'}`}>{m.text}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={q} onChange={(e)=>setQ(e.target.value)} className="flex-1 border rounded-xl p-2 text-sm" placeholder="Tanya sesuatu..." />
        <button onClick={send} className="btn-primary p-2 rounded-xl"><Send size={18} /></button>
      </div>
    </div>
  );
}

// ---------- USER MANAGEMENT ----------
function UserManagement({ user, users, setUsers }) {
  const { push } = useToast();
  const [filterRole, setFilterRole] = useState('all');
  const [sort, setSort] = useState({ key: 'name', dir: 'asc' });
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const counts = useMemo(() => {
    return {
      all: users.length,
      admin: users.filter(u=>u.role==='admin').length,
      petugas: users.filter(u=>u.role==='petugas').length,
      viewer: users.filter(u=>u.role==='viewer').length
    };
  }, [users]);

  const rows = useMemo(() => {
    let data = [...users];
    if (filterRole !== 'all') data = data.filter(u => u.role === filterRole);
    data = sortBy(data, sort.key, sort.dir);
    return data;
  }, [users, filterRole, sort]);

  function openAdd() {
    setEditing({
      id: null,
      name: '',
      email: '',
      role: 'viewer',
      area: DEFAULT_LOCATION,
      address: '',
      wa: '',
      createdBy: user.name,
      createdAt: nowIso()
    });
    setShowModal(true);
  }

  function openEdit(u) {
    setEditing({ ...u });
    setShowModal(true);
  }

  function save() {
    if (!editing.name || !editing.email) {
      push('Nama dan email wajib.', 'error');
      return;
    }
    const email = editing.email.trim().toLowerCase();
    if (!email.includes('@')) {
      push('Email tidak valid.', 'error');
      return;
    }

    setUsers(prev => {
      const exists = prev.find(x => x.email.toLowerCase() === email && x.id !== editing.id);
      if (exists) {
        push('Email sudah dipakai user lain.', 'error');
        return prev;
      }

      if (!editing.id) {
        const newUser = { ...editing, id: uid('user'), email, createdBy: editing.createdBy || user.name, createdAt: nowIso() };
        push('User ditambahkan. Password default: SWMS1234', 'success');
        return [newUser, ...prev];
      }

      push('Perubahan user disimpan.', 'success');
      return prev.map(x => x.id === editing.id ? { ...editing, email } : x);
    });

    setShowModal(false);
  }

  function requestDelete(u) {
    setConfirm(u);
  }

  function doDelete() {
    setUsers(prev => prev.filter(x => x.id !== confirm.id));
    push('User dihapus.', 'success');
    setConfirm(null);
  }

  function changeSort(key) {
    setSort((s) => {
      if (s.key === key) return { key, dir: s.dir === 'asc' ? 'desc' : 'asc' };
      return { key, dir: 'asc' };
    });
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-2xl font-bold text-gray-800">Manajemen Pengguna</h2>
        <button onClick={openAdd} className="btn-primary px-4 py-2 rounded-xl flex items-center gap-2 justify-center">
          <Plus size={16} /> Tambah User
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { id: 'all', label: `Semua (${counts.all})` },
          { id: 'admin', label: `Admin (${counts.admin})` },
          { id: 'petugas', label: `Petugas (${counts.petugas})` },
          { id: 'viewer', label: `Pelihat (${counts.viewer})` }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setFilterRole(t.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-bold border ${filterRole===t.id ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-emerald-50 text-emerald-800 uppercase font-bold">
              <tr>
                <th className="p-4 cursor-pointer" onClick={()=>changeSort('name')}>Nama</th>
                <th className="p-4 cursor-pointer" onClick={()=>changeSort('email')}>Email</th>
                <th className="p-4 cursor-pointer" onClick={()=>changeSort('role')}>Role</th>
                <th className="p-4">Area</th>
                <th className="p-4">Pembuat</th>
                <th className="p-4">Waktu</th>
                <th className="p-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-bold">{u.name}</td>
                  <td className="p-4">{u.email}</td>
                  <td className="p-4">
                    <span className={`badge ${u.role==='admin' ? 'bg-purple-100 text-purple-700' : u.role==='petugas' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>{roleLabel(u.role)}</span>
                  </td>
                  <td className="p-4 text-gray-600">{u.role==='petugas' ? (u.area || '-') : '-'}</td>
                  <td className="p-4 text-gray-600">{u.createdBy || '-'}</td>
                  <td className="p-4 text-gray-500">{(u.createdAt || '').slice(0,10)}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={()=>openEdit(u)} className="text-blue-600 hover:text-blue-800" title="Edit"><Edit size={18} /></button>
                      <button onClick={()=>requestDelete(u)} className="text-red-600 hover:text-red-800" title="Hapus"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr><td className="p-4 text-gray-500" colSpan={7}>Tidak ada data.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && editing && (
        <Modal
          title={editing.id ? 'Edit User' : 'Tambah User'}
          onClose={() => setShowModal(false)}
          footer={
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl hover:bg-gray-100">Batal</button>
              <button onClick={save} className="btn-primary px-4 py-2 rounded-xl font-bold">Simpan</button>
            </div>
          }
        >
          <div className="space-y-4">
            <input value={editing.name} onChange={(e)=>setEditing(s=>({...s,name:e.target.value}))} className="w-full border p-3 rounded-xl" placeholder="Nama Lengkap" />
            <input value={editing.email} onChange={(e)=>setEditing(s=>({...s,email:e.target.value}))} className="w-full border p-3 rounded-xl" placeholder="Email" />
            <select value={editing.role} onChange={(e)=>setEditing(s=>({...s,role:e.target.value}))} className="w-full border p-3 rounded-xl">
              <option value="admin">Admin</option>
              <option value="petugas">Petugas</option>
              <option value="viewer">Pelihat</option>
            </select>

            <input
              value={editing.area}
              onChange={(e)=>setEditing(s=>({...s,area:e.target.value}))}
              className={`w-full border p-3 rounded-xl ${editing.role==='petugas' ? '' : 'bg-gray-100 text-gray-500'}`}
              placeholder="Daerah naungan / tugas"
              disabled={editing.role !== 'petugas'}
            />

            <input value={editing.wa} onChange={(e)=>setEditing(s=>({...s,wa:e.target.value}))} className="w-full border p-3 rounded-xl" placeholder="Nomor WhatsApp" />
            <input value={editing.address} onChange={(e)=>setEditing(s=>({...s,address:e.target.value}))} className="w-full border p-3 rounded-xl" placeholder="Alamat" />

            <div className="bg-gray-50 border rounded-xl p-3 text-xs text-gray-600">
              Password default user: <b>SWMS1234</b> (demo). Untuk produksi pakai backend + hash password.
            </div>
          </div>
        </Modal>
      )}

      {confirm && (
        <ConfirmDialog
          title="Hapus User"
          message={`Yakin hapus user "${confirm.name}"?`}
          confirmText="Hapus"
          onCancel={() => setConfirm(null)}
          onConfirm={doDelete}
        />
      )}
    </div>
  );
}

// ---------- CMS EDITOR ----------
function CMSEditor({ cmsLogin, setCmsLogin, team, setTeam }) {
  const { push } = useToast();
  const [tab, setTab] = useState('login');
  const [modal, setModal] = useState(null); // {type:'login'|'team', mode:'add'|'edit', data:{}}
  const [confirm, setConfirm] = useState(null); // {type, id}

  function openAddLogin() {
    setModal({ type: 'login', mode: 'add', data: { id: null, title: '', desc: '', links: [], images: [], videos: [], status: 'tayang', showFrom: '', showUntil: '' } });
  }
  function openEditLogin(item) {
    setModal({ type: 'login', mode: 'edit', data: JSON.parse(JSON.stringify(item)) });
  }
  function saveLogin() {
    const d = modal.data;
    if (!d.title || !d.desc) {
      push('Judul dan deskripsi wajib.', 'error');
      return;
    }
    if (d.desc.split(/\s+/).filter(Boolean).length > 2000) {
      push('Deskripsi melebihi 2000 kata.', 'error');
      return;
    }
    setCmsLogin((prev) => {
      if (!d.id) {
        const item = { ...d, id: uid('cms'), createdAt: nowIso() };
        return [item, ...prev].slice(0, 10);
      }
      return prev.map((x) => (x.id === d.id ? d : x));
    });
    push('CMS login disimpan.', 'success');
    setModal(null);
  }

  function openAddTeam() {
    if (team.length >= 10) {
      push('Maksimal 10 orang.', 'error');
      return;
    }
    setModal({ type: 'team', mode: 'add', data: { id: null, name: '', nim: '', kelas: 'CD 32', motivasi: '', ig: '', wa: '', email: '', photoUrl: '', hidden: false } });
  }
  function openEditTeam(p) {
    setModal({ type: 'team', mode: 'edit', data: { ...p } });
  }
  function saveTeam() {
    const d = modal.data;
    if (!d.name) {
      push('Nama wajib.', 'error');
      return;
    }
    setTeam((prev) => {
      if (!d.id) return [...prev, { ...d, id: uid('team') }];
      return prev.map((x) => (x.id === d.id ? d : x));
    });
    push('Data tim disimpan.', 'success');
    setModal(null);
  }

  function askDelete(type, id) {
    setConfirm({ type, id });
  }

  function doDelete() {
    if (confirm.type === 'login') {
      setCmsLogin((prev) => prev.filter((x) => x.id !== confirm.id));
      push('Konten login dihapus.', 'success');
    } else {
      setTeam((prev) => prev.filter((x) => x.id !== confirm.id));
      push('Anggota tim dihapus.', 'success');
    }
    setConfirm(null);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800">CMS Editor (Konten Web)</h2>

      <div className="flex gap-2 border-b">
        <button onClick={() => setTab('login')} className={`px-4 py-2 border-b-2 font-bold ${tab==='login' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500'}`}>Tampilan Login</button>
        <button onClick={() => setTab('team')} className={`px-4 py-2 border-b-2 font-bold ${tab==='team' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500'}`}>Data Tim</button>
      </div>

      {tab === 'login' && (
        <div className="card p-6 border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h3 className="font-bold">Konten Infografis Login (maks 2 tayang)</h3>
            <button onClick={openAddLogin} className="btn-primary px-3 py-2 rounded-xl text-sm font-bold">+ Tambah Konten</button>
          </div>

          <div className="mt-4 space-y-3">
            {cmsLogin.map((c) => (
              <div key={c.id} className="border rounded-2xl p-4 relative">
                <span className={`absolute top-3 right-3 badge ${c.status==='tayang' ? 'bg-green-100 text-green-700' : c.status==='hide' ? 'bg-gray-100 text-gray-700' : 'bg-yellow-100 text-yellow-700'}`}>{c.status}</span>
                <p className="font-bold text-gray-800">{c.title}</p>
                <p className="text-sm text-gray-600 mt-1">{clampText(c.desc, 180)}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <button onClick={()=>openEditLogin(c)} className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-sm">Edit</button>
                  <button onClick={()=>askDelete('login', c.id)} className="px-3 py-1.5 rounded-xl bg-red-50 text-red-700 font-bold text-sm">Hapus</button>
                </div>
              </div>
            ))}
            {cmsLogin.length === 0 ? <div className="text-sm text-gray-500">Belum ada konten.</div> : null}
          </div>
        </div>
      )}

      {tab === 'team' && (
        <div className="card p-6 border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h3 className="font-bold">Profil Tim (Kelompok CD 32) • Maks 10</h3>
            <button onClick={openAddTeam} className="btn-primary px-3 py-2 rounded-xl text-sm font-bold">+ Tambah Anggota</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {team.map((p) => (
              <div key={p.id} className="border rounded-2xl p-4 relative hover:shadow-md transition">
                <div className="absolute top-3 right-3 flex gap-1">
                  <button onClick={() => setTeam(prev => prev.map(x=>x.id===p.id?{...x,hidden:!x.hidden}:x))} className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200" title="Hide/Show">
                    {p.hidden ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button onClick={() => openEditTeam(p)} className="p-2 bg-blue-100 rounded-xl hover:bg-blue-200" title="Edit"><Edit size={16} /></button>
                  <button onClick={() => askDelete('team', p.id)} className="p-2 bg-red-100 rounded-xl hover:bg-red-200" title="Hapus"><Trash2 size={16} /></button>
                </div>
                <div className="w-16 h-16 bg-emerald-100 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-bold text-emerald-700">
                  {p.name?.charAt(0) || 'A'}
                </div>
                <p className="text-center font-bold">{p.name}</p>
                <p className="text-center text-xs text-gray-500">{p.nim} • {p.kelas}</p>
                <p className="text-xs text-gray-600 mt-3 text-center">{clampText(p.motivasi, 90)}</p>
                <div className="flex justify-center gap-2 mt-3">
                  {p.ig && <a className="w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold" href={p.ig} target="_blank" rel="noreferrer">IG</a>}
                  {p.wa && <a className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold" href={p.wa} target="_blank" rel="noreferrer">WA</a>}
                  {p.email && <a className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold" href={p.email}>@</a>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {modal && modal.type === 'login' && (
        <Modal
          title={modal.mode === 'add' ? 'Tambah Konten Login' : 'Edit Konten Login'}
          onClose={() => setModal(null)}
          footer={
            <div className="flex justify-end gap-2">
              <button onClick={()=>setModal(null)} className="px-4 py-2 rounded-xl hover:bg-gray-100">Batal</button>
              <button onClick={saveLogin} className="btn-primary px-4 py-2 rounded-xl font-bold">Simpan</button>
            </div>
          }
        >
          <CmsLoginForm data={modal.data} onChange={(d)=>setModal(m=>({...m,data:d}))} />
        </Modal>
      )}

      {modal && modal.type === 'team' && (
        <Modal
          title={modal.mode === 'add' ? 'Tambah Anggota' : 'Edit Anggota'}
          onClose={() => setModal(null)}
          footer={
            <div className="flex justify-end gap-2">
              <button onClick={()=>setModal(null)} className="px-4 py-2 rounded-xl hover:bg-gray-100">Batal</button>
              <button onClick={saveTeam} className="btn-primary px-4 py-2 rounded-xl font-bold">Simpan</button>
            </div>
          }
        >
          <TeamForm data={modal.data} onChange={(d)=>setModal(m=>({...m,data:d}))} />
        </Modal>
      )}

      {confirm && (
        <ConfirmDialog
          title="Hapus Data"
          message="Yakin ingin menghapus?"
          confirmText="Hapus"
          onCancel={() => setConfirm(null)}
          onConfirm={doDelete}
        />
      )}
    </div>
  );
}

function CmsLoginForm({ data, onChange }) {
  const [linkLabel, setLinkLabel] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [imgUrl, setImgUrl] = useState('');
  const [vidUrl, setVidUrl] = useState('');

  function addLink() {
    const ll = linkLabel.trim();
    const uu = linkUrl.trim();
    if (!ll || !uu) return;
    onChange({ ...data, links: [...(data.links||[]), { label: ll, url: uu }] });
    setLinkLabel('');
    setLinkUrl('');
  }

  function addImg() {
    const u = imgUrl.trim();
    if (!u) return;
    const imgs = data.images || [];
    if (imgs.length >= 5) return;
    onChange({ ...data, images: [...imgs, { url: u }] });
    setImgUrl('');
  }

  function addVid() {
    const u = vidUrl.trim();
    if (!u) return;
    const vids = data.videos || [];
    if (vids.length >= 2) return;
    onChange({ ...data, videos: [...vids, { url: u }] });
    setVidUrl('');
  }

  return (
    <div className="space-y-4">
      <input value={data.title} onChange={(e)=>onChange({ ...data, title: e.target.value })} className="w-full border p-3 rounded-xl" placeholder="Judul" />
      <textarea value={data.desc} onChange={(e)=>onChange({ ...data, desc: e.target.value })} className="w-full border p-3 rounded-xl h-28" placeholder="Deskripsi (maks 2000 kata)" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-gray-500">Status</label>
          <select value={data.status} onChange={(e)=>onChange({ ...data, status: e.target.value })} className="w-full border p-3 rounded-xl mt-1">
            <option value="tayang">tayang</option>
            <option value="hide">hide</option>
            <option value="expired">expired</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500">Waktu tayang (opsional)</label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <input value={data.showFrom} onChange={(e)=>onChange({ ...data, showFrom: e.target.value })} className="border p-3 rounded-xl" placeholder="Mulai (YYYY-MM-DD)" />
            <input value={data.showUntil} onChange={(e)=>onChange({ ...data, showUntil: e.target.value })} className="border p-3 rounded-xl" placeholder="Selesai (YYYY-MM-DD)" />
          </div>
        </div>
      </div>

      <div className="border rounded-2xl p-4">
        <p className="font-bold text-gray-700 mb-2">Media (pakai URL)</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500">Gambar URL (maks 5)</label>
            <div className="flex gap-2 mt-1">
              <input value={imgUrl} onChange={(e)=>setImgUrl(e.target.value)} className="border p-2 rounded-xl flex-1" placeholder="https://...jpg" />
              <button type="button" onClick={addImg} className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-bold">Tambah</button>
            </div>
            <div className="mt-2 space-y-2">
              {(data.images||[]).map((im, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs border rounded-xl p-2">
                  <span className="truncate">{im.url}</span>
                  <button type="button" onClick={()=>onChange({ ...data, images: data.images.filter((_,i)=>i!==idx) })} className="text-red-600 font-bold">Hapus</button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500">Video URL (maks 2)</label>
            <div className="flex gap-2 mt-1">
              <input value={vidUrl} onChange={(e)=>setVidUrl(e.target.value)} className="border p-2 rounded-xl flex-1" placeholder="https://youtube.com/..." />
              <button type="button" onClick={addVid} className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-bold">Tambah</button>
            </div>
            <div className="mt-2 space-y-2">
              {(data.videos||[]).map((v, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs border rounded-xl p-2">
                  <span className="truncate">{v.url}</span>
                  <button type="button" onClick={()=>onChange({ ...data, videos: data.videos.filter((_,i)=>i!==idx) })} className="text-red-600 font-bold">Hapus</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border rounded-2xl p-4">
        <p className="font-bold text-gray-700 mb-2">Link Tujuan</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input value={linkLabel} onChange={(e)=>setLinkLabel(e.target.value)} className="border p-2 rounded-xl" placeholder="Label (Instagram/Youtube)" />
          <input value={linkUrl} onChange={(e)=>setLinkUrl(e.target.value)} className="border p-2 rounded-xl" placeholder="URL" />
        </div>
        <button type="button" onClick={addLink} className="mt-2 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-bold">Tambah Link</button>
        <div className="mt-2 space-y-2">
          {(data.links||[]).map((l, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs border rounded-xl p-2">
              <span className="truncate"><b>{l.label}</b> — {l.url}</span>
              <button type="button" onClick={()=>onChange({ ...data, links: data.links.filter((_,i)=>i!==idx) })} className="text-red-600 font-bold">Hapus</button>
            </div>
          ))}
        </div>
      </div>

      <div className="border rounded-2xl p-4 bg-gray-50">
        <p className="font-bold text-gray-700 mb-2">Preview ringkas</p>
        <p className="font-bold">{data.title || '(judul)'}</p>
        <p className="text-sm text-gray-600">{clampText(data.desc, 200) || '(deskripsi)'}</p>
      </div>
    </div>
  );
}

function TeamForm({ data, onChange }) {
  return (
    <div className="space-y-4">
      <input value={data.name} onChange={(e)=>onChange({ ...data, name: e.target.value })} className="w-full border p-3 rounded-xl" placeholder="Nama" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input value={data.nim} onChange={(e)=>onChange({ ...data, nim: e.target.value })} className="border p-3 rounded-xl" placeholder="NIM" />
        <input value={data.kelas} onChange={(e)=>onChange({ ...data, kelas: e.target.value })} className="border p-3 rounded-xl" placeholder="Kelas" />
      </div>
      <textarea value={data.motivasi} onChange={(e)=>onChange({ ...data, motivasi: e.target.value })} className="w-full border p-3 rounded-xl h-24" placeholder="Motivasi/pesan" />
      <input value={data.photoUrl} onChange={(e)=>onChange({ ...data, photoUrl: e.target.value })} className="w-full border p-3 rounded-xl" placeholder="URL Foto (opsional)" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <input value={data.ig} onChange={(e)=>onChange({ ...data, ig: e.target.value })} className="border p-3 rounded-xl" placeholder="Instagram URL" />
        <input value={data.wa} onChange={(e)=>onChange({ ...data, wa: e.target.value })} className="border p-3 rounded-xl" placeholder="WhatsApp URL" />
        <input value={data.email} onChange={(e)=>onChange({ ...data, email: e.target.value })} className="border p-3 rounded-xl" placeholder="Email (mailto:)" />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={data.hidden} onChange={(e)=>onChange({ ...data, hidden: e.target.checked })} />
        Hide dari login page
      </label>
    </div>
  );
}

// ---------- BROADCAST ----------
function Broadcast({ user, users, templates, setTemplates, broadcasts, setBroadcasts, locations }) {
  const { push } = useToast();
  const [selectedTpl, setSelectedTpl] = useState(templates[0]?.id || '');
  const [targets, setTargets] = useState([]);

  const petugas = useMemo(() => users.filter(u=>u.role==='petugas'), [users]);

  const [tplModal, setTplModal] = useState(null); // {id,label,text}
  const [confirm, setConfirm] = useState(null);

  const activeTpl = useMemo(() => templates.find(t=>t.id===selectedTpl), [templates, selectedTpl]);

  function toggleTarget(id) {
    setTargets((prev) => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  }

  function sendBroadcast() {
    if (!selectedTpl) { push('Pilih template dulu.', 'error'); return; }
    if (targets.length === 0) { push('Pilih minimal 1 petugas.', 'error'); return; }

    const b = {
      id: uid('br'),
      templateId: selectedTpl,
      templateLabel: activeTpl?.label,
      text: activeTpl?.text,
      targets,
      sentBy: user.name,
      location: locations[0] || DEFAULT_LOCATION,
      createdAt: nowIso(),
      status: 'belum'
    };

    setBroadcasts((prev) => [b, ...prev]);
    push('Broadcast terkirim (demo).', 'success');
    setTargets([]);
  }

  function markStatus(id, status) {
    setBroadcasts((prev) => prev.map(x => x.id===id ? { ...x, status } : x));
  }

  function openTplAdd() {
    setTplModal({ id: null, label: '', text: '' });
  }

  function openTplEdit(t) {
    setTplModal({ ...t });
  }

  function saveTpl() {
    if (!tplModal.label || !tplModal.text) { push('Label dan teks wajib.', 'error'); return; }
    setTemplates((prev) => {
      if (!tplModal.id) return [{ ...tplModal, id: uid('tpl'), createdBy: user.name, createdAt: nowIso() }, ...prev];
      return prev.map(x => x.id===tplModal.id ? { ...x, label: tplModal.label, text: tplModal.text } : x);
    });
    push('Template disimpan.', 'success');
    setTplModal(null);
  }

  function askDeleteTpl(t) { setConfirm({ type:'tpl', id: t.id, name: t.label }); }
  function askDeleteBroadcast(b) { setConfirm({ type:'br', id: b.id, name: b.templateLabel }); }

  function doDelete() {
    if (confirm.type === 'tpl') {
      setTemplates((prev) => prev.filter(x => x.id !== confirm.id));
      push('Template dihapus.', 'success');
    } else {
      setBroadcasts((prev) => prev.filter(x => x.id !== confirm.id));
      push('Broadcast dihapus.', 'success');
    }
    setConfirm(null);
  }

  const counts = useMemo(() => {
    const belum = broadcasts.filter(b=>b.status==='belum').length;
    const proses = broadcasts.filter(b=>b.status==='proses').length;
    const selesai = broadcasts.filter(b=>b.status==='selesai').length;
    return { belum, proses, selesai };
  }, [broadcasts]);

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800">Broadcast & Status App</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* left send */}
        <div className="card p-6 border h-fit">
          <h3 className="font-bold mb-4 flex items-center gap-2"><Send size={18}/> Kirim Broadcast</h3>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500">Template</label>
              <select value={selectedTpl} onChange={(e)=>setSelectedTpl(e.target.value)} className="w-full border p-3 rounded-xl mt-1 bg-white">
                {templates.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
              <p className="text-xs text-gray-500 mt-2">{activeTpl ? clampText(activeTpl.text, 120) : ''}</p>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500">Target Petugas</label>
              <div className="h-36 overflow-y-auto border rounded-xl p-3 mt-1 space-y-2 bg-white">
                {petugas.map(p => (
                  <label key={p.id} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={targets.includes(p.id)} onChange={()=>toggleTarget(p.id)} />
                    {p.name} <span className="text-xs text-gray-500">({p.area || '-'})</span>
                  </label>
                ))}
                {petugas.length === 0 ? <div className="text-sm text-gray-500">Belum ada petugas.</div> : null}
              </div>
            </div>

            <button onClick={sendBroadcast} className="btn-primary w-full py-3 rounded-xl font-bold">Kirim</button>
          </div>
        </div>

        {/* right status */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className="badge bg-red-100 text-red-700 border border-red-200">Belum direspon ({counts.belum})</span>
            <span className="badge bg-yellow-100 text-yellow-700 border border-yellow-200">Sedang proses ({counts.proses})</span>
            <span className="badge bg-green-100 text-green-700 border border-green-200">Selesai ({counts.selesai})</span>
          </div>

          <div className="card overflow-hidden border">
            {broadcasts.slice(0, 20).map((b) => (
              <div key={b.id} className="p-4 border-b last:border-0 flex items-start justify-between hover:bg-gray-50">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${b.status==='belum' ? 'bg-red-500 animate-pulse' : b.status==='proses' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                    <h4 className="font-bold text-gray-800">{b.templateLabel}</h4>
                  </div>
                  <p className="text-sm text-gray-600">Lokasi: {b.location} • Pengirim: {b.sentBy}</p>
                  <p className="text-xs text-gray-500 mt-1">Target: {b.targets.length} petugas</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <button onClick={()=>markStatus(b.id,'belum')} className="px-3 py-1.5 rounded-xl bg-red-50 text-red-700 font-bold text-xs">Belum</button>
                    <button onClick={()=>markStatus(b.id,'proses')} className="px-3 py-1.5 rounded-xl bg-yellow-50 text-yellow-700 font-bold text-xs">Proses</button>
                    <button onClick={()=>markStatus(b.id,'selesai')} className="px-3 py-1.5 rounded-xl bg-green-50 text-green-700 font-bold text-xs">Selesai</button>
                    <button onClick={()=>askDeleteBroadcast(b)} className="px-3 py-1.5 rounded-xl bg-gray-100 text-gray-700 font-bold text-xs">Hapus</button>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400">{b.createdAt.slice(0,10)}</span>
                </div>
              </div>
            ))}
            {broadcasts.length === 0 ? <div className="p-4 text-sm text-gray-500">Belum ada broadcast.</div> : null}
          </div>

          {/* template mgmt */}
          <div className="card p-6 border">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">Template Pesan</h3>
              <button onClick={openTplAdd} className="btn-primary px-3 py-2 rounded-xl text-sm font-bold">+ Tambah Template</button>
            </div>
            <div className="mt-4 space-y-2">
              {templates.map((t) => (
                <div key={t.id} className="border rounded-2xl p-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-gray-800">{t.label}</p>
                    <p className="text-sm text-gray-600">{clampText(t.text, 140)}</p>
                    <p className="text-xs text-gray-400 mt-1">{t.createdBy} • {t.createdAt.slice(0,10)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={()=>openTplEdit(t)} className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs">Edit</button>
                    <button onClick={()=>askDeleteTpl(t)} className="px-3 py-1.5 rounded-xl bg-red-50 text-red-700 font-bold text-xs">Hapus</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {tplModal && (
        <Modal
          title={tplModal.id ? 'Edit Template' : 'Tambah Template'}
          onClose={()=>setTplModal(null)}
          footer={
            <div className="flex justify-end gap-2">
              <button onClick={()=>setTplModal(null)} className="px-4 py-2 rounded-xl hover:bg-gray-100">Batal</button>
              <button onClick={saveTpl} className="btn-primary px-4 py-2 rounded-xl font-bold">Simpan</button>
            </div>
          }
        >
          <div className="space-y-4">
            <input value={tplModal.label} onChange={(e)=>setTplModal(s=>({...s,label:e.target.value}))} className="w-full border p-3 rounded-xl" placeholder="Label" />
            <textarea value={tplModal.text} onChange={(e)=>setTplModal(s=>({...s,text:e.target.value}))} className="w-full border p-3 rounded-xl h-28" placeholder="Teks. Anda boleh pakai {lokasi}, {tong}, {jam}" />
          </div>
        </Modal>
      )}

      {confirm && (
        <ConfirmDialog
          title="Hapus"
          message={`Yakin ingin menghapus "${confirm.name}"?`}
          confirmText="Hapus"
          onCancel={() => setConfirm(null)}
          onConfirm={doDelete}
        />
      )}
    </div>
  );
}

// ---------- ESP32 LOGS ----------
function ESP32Logs({ dataset, setDataset }) {
  const { push } = useToast();
  const [imgUrl, setImgUrl] = useState('');
  const [confirm, setConfirm] = useState(null);

  function addImage() {
    const u = imgUrl.trim();
    if (!u) return;
    setDataset((prev) => [{ id: uid('img'), url: u, label: 'unclassified', createdAt: nowIso() }, ...prev]);
    setImgUrl('');
    push('Gambar ditambahkan.', 'success');
  }

  function setLabel(id, label) {
    setDataset((prev) => prev.map(x => x.id===id ? { ...x, label } : x));
    push('Label disimpan.', 'success');
  }

  function askDelete(id) {
    setConfirm(id);
  }

  function doDelete() {
    setDataset((prev) => prev.filter(x => x.id !== confirm));
    push('Gambar dihapus.', 'success');
    setConfirm(null);
  }

  function downloadJson() {
    const blob = new Blob([JSON.stringify(dataset, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'swms_dataset.json';
    a.click();
    URL.revokeObjectURL(url);
    push('Dataset JSON diunduh.', 'success');
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-2xl font-bold text-gray-800">ESP32 Logs & AI Training (Demo)</h2>
        <button onClick={downloadJson} className="border border-gray-300 px-4 py-2 rounded-xl text-sm hover:bg-gray-50">Download Dataset JSON</button>
      </div>

      <div className="card p-6 border">
        <h3 className="font-bold mb-3 text-gray-700">Tambah Gambar (URL)</h3>
        <div className="flex gap-2">
          <input value={imgUrl} onChange={(e)=>setImgUrl(e.target.value)} className="flex-1 border p-3 rounded-xl" placeholder="https://...jpg" />
          <button onClick={addImage} className="btn-primary px-4 rounded-xl font-bold">Tambah</button>
        </div>
      </div>

      <div className="card p-6 border">
        <h3 className="font-bold mb-4 text-gray-700">Gambar Tidak Terdeteksi</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {dataset.map((x) => (
            <div key={x.id} className="border rounded-2xl overflow-hidden group relative bg-white">
              <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                {x.url ? <img src={x.url} alt="" className="w-full h-full object-cover" /> : <Image size={32} className="text-gray-400" />}
              </div>
              <div className="p-2 bg-gray-50">
                <div className="flex items-center justify-between gap-2">
                  <select value={x.label} onChange={(e)=>setLabel(x.id, e.target.value)} className="text-xs border rounded-lg px-2 py-1 bg-white">
                    <option value="unclassified">unclassified</option>
                    <option value="plastik">plastik</option>
                    <option value="kertas">kertas</option>
                    <option value="kaleng">kaleng</option>
                  </select>
                  <button onClick={()=>askDelete(x.id)} className="text-red-600" title="Hapus"><Trash2 size={16} /></button>
                </div>
                <div className="text-[10px] text-gray-500 mt-2">{x.createdAt.slice(0,19).replace('T',' ')}</div>
              </div>
            </div>
          ))}
        </div>
        {dataset.length === 0 ? <div className="text-sm text-gray-500">Belum ada gambar.</div> : null}
      </div>

      <div className="bg-black text-green-400 p-4 rounded-2xl font-mono text-xs h-40 overflow-y-auto">
        <p>[SYSTEM] ESP32 Connected (demo)</p>
        <p>[UPLOAD] Image queued for labeling</p>
        <p>[AI] Confidence low → moved to unclassified</p>
        <p>[SYSTEM] Waiting for next trigger...</p>
      </div>

      {confirm && (
        <ConfirmDialog
          title="Hapus Gambar"
          message="Yakin ingin menghapus gambar ini?"
          confirmText="Hapus"
          onCancel={() => setConfirm(null)}
          onConfirm={doDelete}
        />
      )}
    </div>
  );
}

// ---------- ULASAN ----------
function Ulasan({ user, reviews, setReviews }) {
  const { push } = useToast();
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [replyFor, setReplyFor] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [confirm, setConfirm] = useState(null);

  function submit() {
    if (!text.trim()) { push('Isi ulasan dulu.', 'error'); return; }
    const r = { id: uid('rev'), rating, text: text.trim(), photoUrl: photoUrl.trim(), createdAt: nowIso(), hidden: false, replies: [] };
    setReviews(prev => [r, ...prev]);
    setText('');
    setPhotoUrl('');
    setRating(5);
    push('Ulasan terkirim (anonim).', 'success');
  }

  function toggleHideReview(id) {
    setReviews(prev => prev.map(x=>x.id===id?{...x,hidden:!x.hidden}:x));
    push('Status hide diubah.', 'success');
  }

  function openReply(id) {
    setReplyFor(id);
    setReplyText('');
  }

  function saveReply() {
    if (!replyText.trim()) { push('Balasan kosong.', 'error'); return; }
    setReviews(prev => prev.map(x => {
      if (x.id !== replyFor) return x;
      const rep = { id: uid('rep'), text: replyText.trim(), createdAt: nowIso(), hidden: false };
      return { ...x, replies: [...(x.replies||[]), rep] };
    }));
    push('Balasan disimpan.', 'success');
    setReplyFor(null);
  }

  function askDelete(id) { setConfirm(id); }
  function doDelete() {
    setReviews(prev => prev.filter(x=>x.id!==confirm));
    push('Ulasan dihapus.', 'success');
    setConfirm(null);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800">Ulasan & Rating</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6 border h-fit">
          <h3 className="font-bold mb-4">Tulis Ulasan (Anonim)</h3>
          <div className="space-y-4">
            <div className="flex gap-1 text-yellow-400 text-2xl">
              {[1,2,3,4,5].map(i => (
                <button key={i} onClick={()=>setRating(i)} className={i<=rating?'':'opacity-30'}>★</button>
              ))}
            </div>
            <textarea value={text} onChange={(e)=>setText(e.target.value)} className="w-full border p-3 rounded-xl h-32" placeholder="Tulis keluhan atau masukan..." />
            <input value={photoUrl} onChange={(e)=>setPhotoUrl(e.target.value)} className="w-full border p-3 rounded-xl" placeholder="URL foto bukti (opsional)" />
            <button onClick={submit} className="btn-primary w-full py-3 rounded-xl font-bold">Kirim</button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {reviews.filter(r=> user.role==='admin' ? true : !r.hidden).map((r) => (
            <div key={r.id} className="card p-4 border">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">?</div>
                  <div>
                    <p className="font-bold text-sm">Pengguna Anonim</p>
                    <div className="flex text-yellow-400 text-xs">{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</div>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{r.createdAt.slice(0,10)}</span>
              </div>

              {r.photoUrl ? (
                <img src={r.photoUrl} alt="" className="w-full max-h-56 object-cover rounded-xl border mb-3" />
              ) : null}

              <p className="text-sm text-gray-700 mb-3">{r.text}</p>

              {/* Admin actions */}
              {user.role === 'admin' && (
                <div className="flex flex-wrap gap-2 mb-3">
                  <button onClick={()=>toggleHideReview(r.id)} className="px-3 py-1.5 rounded-xl bg-gray-100 text-gray-700 font-bold text-xs">{r.hidden ? 'Tampilkan' : 'Hide'}</button>
                  <button onClick={()=>askDelete(r.id)} className="px-3 py-1.5 rounded-xl bg-red-50 text-red-700 font-bold text-xs">Hapus</button>
                </div>
              )}

              {/* Replies */}
              {(r.replies||[]).length ? (
                <details className="bg-gray-50 rounded-xl p-3 border">
                  <summary className="text-xs font-bold text-emerald-700 cursor-pointer">Lihat Balasan Admin ({r.replies.length})</summary>
                  <div className="mt-3 space-y-2">
                    {r.replies.map((rep) => (
                      <div key={rep.id} className="bg-white rounded-xl p-3 border">
                        <p className="text-xs font-bold text-emerald-700">Admin</p>
                        <p className="text-sm text-gray-700">{rep.text}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{rep.createdAt.slice(0,19).replace('T',' ')}</p>
                      </div>
                    ))}
                  </div>
                </details>
              ) : null}

              {/* reply button */}
              {user.role === 'admin' ? (
                <button onClick={()=>openReply(r.id)} className="text-xs text-blue-600 hover:underline mt-3">Balas Ulasan</button>
              ) : null}
            </div>
          ))}

          {reviews.length === 0 ? <div className="text-sm text-gray-500">Belum ada ulasan.</div> : null}
        </div>
      </div>

      {replyFor && (
        <Modal
          title="Balas Ulasan"
          onClose={()=>setReplyFor(null)}
          footer={
            <div className="flex justify-end gap-2">
              <button onClick={()=>setReplyFor(null)} className="px-4 py-2 rounded-xl hover:bg-gray-100">Batal</button>
              <button onClick={saveReply} className="btn-primary px-4 py-2 rounded-xl font-bold">Simpan</button>
            </div>
          }
        >
          <textarea value={replyText} onChange={(e)=>setReplyText(e.target.value)} className="w-full border p-3 rounded-xl h-28" placeholder="Tulis balasan..." />
        </Modal>
      )}

      {confirm && (
        <ConfirmDialog
          title="Hapus Ulasan"
          message="Yakin ingin menghapus ulasan?"
          confirmText="Hapus"
          onCancel={() => setConfirm(null)}
          onConfirm={doDelete}
        />
      )}
    </div>
  );
}

// ---------- PROFILE ----------
function UserProfile({ user, profiles, setProfiles }) {
  const { push } = useToast();
  const [editing, setEditing] = useState(true);

  const profile = profiles[user.email] || { name: user.name, email: user.email, wa: '', address: '' };
  const [form, setForm] = useState(profile);

  useEffect(() => setForm(profile), [user.email]);

  function save() {
    setProfiles((prev) => ({ ...prev, [user.email]: form }));
    push('Profil disimpan.', 'success');
    setEditing(false);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="card p-6 text-center relative border">
        <div className="h-24 bg-emerald-600 rounded-t-2xl absolute top-0 left-0 w-full" />
        <div className="relative mt-8">
          <div className="w-24 h-24 bg-white p-1 rounded-full mx-auto shadow-lg">
            <div className="w-full h-full bg-emerald-100 rounded-full flex items-center justify-center text-3xl font-bold text-emerald-600">
              {user.name.charAt(0)}
            </div>
          </div>
          <button className="absolute bottom-0 right-[42%] bg-gray-800 text-white p-1.5 rounded-full shadow hover:bg-black" title="Ganti foto (demo)">
            <Camera size={14} />
          </button>
        </div>
        <h2 className="text-2xl font-bold mt-4">{user.name}</h2>
        <p className="text-gray-500 uppercase text-sm tracking-wide">{roleLabel(user.role)}</p>
      </div>

      <div className="card p-6 border">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">Edit Informasi</h3>
          <button onClick={()=>setEditing(e=>!e)} className="px-3 py-2 rounded-xl bg-gray-100 font-bold text-sm">{editing ? 'Kunci' : 'Edit'}</button>
        </div>

        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Nama Lengkap</label>
              <input disabled={!editing} value={form.name} onChange={(e)=>setForm(s=>({...s,name:e.target.value}))} className={`w-full border p-3 rounded-xl mt-1 ${editing?'':'bg-gray-100 text-gray-500'}`} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
              <input value={form.email} disabled className="w-full border p-3 rounded-xl mt-1 bg-gray-100 text-gray-500" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Nomor WhatsApp</label>
            <input disabled={!editing} value={form.wa} onChange={(e)=>setForm(s=>({...s,wa:e.target.value}))} className={`w-full border p-3 rounded-xl mt-1 ${editing?'':'bg-gray-100 text-gray-500'}`} />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Alamat</label>
            <input disabled={!editing} value={form.address} onChange={(e)=>setForm(s=>({...s,address:e.target.value}))} className={`w-full border p-3 rounded-xl mt-1 ${editing?'':'bg-gray-100 text-gray-500'}`} />
          </div>

          <div className="flex justify-end pt-4">
            <button onClick={save} className="btn-primary px-8 py-3 rounded-xl font-bold shadow-lg" disabled={!editing}>
              Simpan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- CONFIG HARDWARE ----------
function HardwareConfig({ hw, setHw, hwLogs, setHwLogs }) {
  const { push } = useToast();
  const [editing, setEditing] = useState(true);
  const [form, setForm] = useState(hw);

  useEffect(() => setForm(hw), [hw]);

  function save() {
    setHw(form);
    setHwLogs(prev => [{ id: uid('hwlog'), at: formatTimeId(new Date()), msg: 'Konfigurasi disimpan (demo).' }, ...prev].slice(0,200));
    push('Konfigurasi hardware disimpan.', 'success');
    setEditing(false);
  }

  function testBuzzer() {
    setHwLogs(prev => [{ id: uid('hwlog'), at: formatTimeId(new Date()), msg: 'Test buzzer ditekan (demo).' }, ...prev]);
    push('Test buzzer (demo).', 'success');
  }

  function restart() {
    setHwLogs(prev => [{ id: uid('hwlog'), at: formatTimeId(new Date()), msg: 'Restart alat ditekan (demo).' }, ...prev]);
    push('Restart alat (demo).', 'success');
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-2xl font-bold text-gray-800">Konfigurasi Hardware (Demo)</h2>
        <div className="flex gap-2">
          <button onClick={()=>setEditing(e=>!e)} className="px-4 py-2 rounded-xl bg-gray-100 font-bold">{editing ? 'Kunci' : 'Edit'}</button>
          <button onClick={save} className="btn-primary px-4 py-2 rounded-xl font-bold" disabled={!editing}>Simpan</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card overflow-hidden border aspect-video relative">
          <img src="https://images.unsplash.com/photo-1527708676371-14f6d77d2a8f?auto=format&fit=crop&w=1200&q=80" alt="" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <Camera size={44} className="text-gray-500" />
            <p className="text-sm text-gray-600">Live camera (akan dihubungkan ke ESP32-CAM)</p>
            <button className="px-4 py-2 rounded-xl bg-white/70 hover:bg-white text-sm font-bold">Nyalakan Kamera (demo)</button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6 border">
            <h3 className="font-bold mb-4 flex items-center gap-2"><Settings size={18}/> Kontrol Servo Manual</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <label>Servo 1 (kanan)</label>
                  <span>{form.servo1}°</span>
                </div>
                <input
                  disabled={!editing}
                  type="range"
                  min={0}
                  max={180}
                  value={form.servo1}
                  onChange={(e)=>setForm(s=>({...s,servo1: Number(e.target.value)}))}
                  className="w-full"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <label>Servo 2 (kiri)</label>
                  <span>{form.servo2}°</span>
                </div>
                <input
                  disabled={!editing}
                  type="range"
                  min={0}
                  max={180}
                  value={form.servo2}
                  onChange={(e)=>setForm(s=>({...s,servo2: Number(e.target.value)}))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div className="card p-6 border">
            <h3 className="font-bold mb-4">LCD & Buzzer</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input disabled={!editing} value={form.lcdLine1} onChange={(e)=>setForm(s=>({...s,lcdLine1:e.target.value}))} className="border p-3 rounded-xl" placeholder="LCD line 1" />
              <input disabled={!editing} value={form.lcdLine2} onChange={(e)=>setForm(s=>({...s,lcdLine2:e.target.value}))} className="border p-3 rounded-xl" placeholder="LCD line 2" />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={testBuzzer} className="flex-1 bg-yellow-500 text-white py-3 rounded-xl font-bold">Test Buzzer</button>
              <button onClick={restart} className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold">Restart</button>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6 border">
        <h3 className="font-bold mb-4">Kalibrasi Sensor Ultrasonik</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { key: 'plastik', title: 'Plastik' },
            { key: 'kertas', title: 'Kertas' },
            { key: 'kaleng', title: 'Kaleng' }
          ].map((t) => (
            <div key={t.key} className="border p-4 rounded-2xl bg-gray-50">
              <h4 className="font-bold text-sm mb-2 text-gray-700">Tong {t.title}</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold">Jarak Kosong (cm)</label>
                  <input
                    disabled={!editing}
                    type="number"
                    value={form.ultrasonic[t.key].empty}
                    onChange={(e)=>setForm(s=>({...s,ultrasonic:{...s.ultrasonic,[t.key]:{...s.ultrasonic[t.key],empty:Number(e.target.value)}}}))}
                    className="w-full border p-2 rounded-xl mt-1"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold">Jarak Penuh (cm)</label>
                  <input
                    disabled={!editing}
                    type="number"
                    value={form.ultrasonic[t.key].full}
                    onChange={(e)=>setForm(s=>({...s,ultrasonic:{...s.ultrasonic,[t.key]:{...s.ultrasonic[t.key],full:Number(e.target.value)}}}))}
                    className="w-full border p-2 rounded-xl mt-1"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6 border">
        <h3 className="font-bold mb-3">Log Status / Pengeditan</h3>
        <div className="max-h-48 overflow-y-auto bg-black text-green-400 rounded-2xl p-4 font-mono text-xs">
          {hwLogs.slice(0, 50).map((l) => (
            <div key={l.id}>[{l.at}] {l.msg}</div>
          ))}
          {hwLogs.length === 0 ? <div>[SYSTEM] no logs</div> : null}
        </div>
      </div>
    </div>
  );
}

// ---------- ANALYSIS ----------
function Analysis({ user, locations }) {
  const data = {
    labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
    datasets: [
      { label: 'Plastik', data: [12, 19, 3, 5, 2, 3, 10], backgroundColor: 'rgba(16, 185, 129, 0.45)' },
      { label: 'Kertas', data: [2, 3, 20, 5, 1, 4, 7], backgroundColor: 'rgba(59, 130, 246, 0.45)' },
      { label: 'Kaleng', data: [7, 5, 11, 8, 6, 9, 4], backgroundColor: 'rgba(239, 68, 68, 0.35)' }
    ]
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-2xl font-bold text-gray-800">Analisis Data</h2>
        <button className="bg-gray-900 text-white px-4 py-2 rounded-xl font-bold hover:bg-black">Cetak (demo)</button>
      </div>

      <div className="card p-6 border">
        <label className="text-xs font-bold text-gray-500">Pilih Lokasi</label>
        <select className="border rounded-xl px-3 py-2 bg-white mt-2" defaultValue={locations[0]}>
          {locations.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        {user.role === 'viewer' ? (
          <p className="text-sm text-gray-500 mt-3">Role pelihat hanya menampilkan grafik keseluruhan (demo).</p>
        ) : (
          <p className="text-sm text-gray-500 mt-3">Role admin/petugas: bisa akses grafik detail & prediksi (akan dihubungkan ke AI).</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6 border">
          <h3 className="font-bold mb-4">Grafik Keseluruhan (Mingguan)</h3>
          <Bar data={data} />
        </div>
        <div className="card p-6 border">
          <h3 className="font-bold mb-4">Prediksi Jam Sibuk (AI • demo)</h3>
          <Line data={data} />
          <p className="text-sm text-gray-600 mt-4 bg-yellow-50 p-3 rounded-xl border border-yellow-200">💡 Prediksi demo: tong kertas cepat penuh pukul 14:00.</p>
        </div>
      </div>
    </div>
  );
}

// ---------- COLLECTION ----------
function Collection({ user, locations, logs, setLogs }) {
  const { push } = useToast();
  const [selectedLoc, setSelectedLoc] = useState(user.role === 'petugas' ? (user.area || locations[0]) : locations[0]);

  function resetTong(type) {
    const item = { id: uid('log'), at: formatTimeId(new Date()), location: selectedLoc, type: 'event', message: `Reset tong ${type} di ${selectedLoc} (demo).` };
    setLogs(prev => [item, ...prev]);
    push(`Tong ${type} direset (demo).`, 'success');
  }

  function resetAll() {
    const item = { id: uid('log'), at: formatTimeId(new Date()), location: selectedLoc, type: 'event', message: `Reset semua tong di ${selectedLoc} (demo).` };
    setLogs(prev => [item, ...prev]);
    push('Semua tong direset (demo).', 'success');
  }

  const menuLogs = useMemo(() => logs.filter(l => l.location===selectedLoc).slice(0, 10), [logs, selectedLoc]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card p-6 border max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2"><Truck size={24}/> Manajemen Pengangkutan</h2>
        <div className="mb-6">
          <label className="block text-sm font-bold mb-2 text-gray-500 uppercase">Pilih Lokasi</label>
          <select value={selectedLoc} onChange={(e)=>setSelectedLoc(e.target.value)} className="w-full border p-3 rounded-xl bg-gray-50">
            {locations.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        <div className="space-y-4">
          {['Plastik', 'Kertas', 'Kaleng'].map((t, idx) => (
            <div key={t} className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${idx===0?'bg-yellow-500':idx===1?'bg-blue-500':'bg-red-500'}`}>{idx+1}</div>
                <div>
                  <p className="font-bold text-gray-800">Tong {t}</p>
                  <p className="text-xs text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded inline-block mt-1">Status: Penuh (demo)</p>
                </div>
              </div>
              <button onClick={()=>resetTong(t)} className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl font-bold hover:bg-emerald-200 text-sm">Kosongkan/Reset</button>
            </div>
          ))}
        </div>

        <button onClick={resetAll} className="w-full bg-red-600 text-white p-4 rounded-xl font-bold mt-8 hover:bg-red-700 shadow-lg">RESET SEMUA TONG</button>
      </div>

      <div className="card p-6 border max-w-3xl mx-auto">
        <h3 className="font-bold mb-3">Log Pengangkutan</h3>
        <div className="space-y-2">
          {menuLogs.map(l => (
            <div key={l.id} className="text-sm text-gray-700 border rounded-xl p-3">[{l.at}] {l.message}</div>
          ))}
          {menuLogs.length === 0 ? <div className="text-sm text-gray-500">Belum ada log.</div> : null}
        </div>
      </div>
    </div>
  );
}

// ---------- MAIN APP ----------
function AppInner() {
  const [users, setUsers] = useLocalStorageState('swms_users', defaultUsers);
  const [cmsLogin, setCmsLogin] = useLocalStorageState('swms_cms_login', defaultLoginCms);
  const [team, setTeam] = useLocalStorageState('swms_team', defaultTeam);
  const [templates, setTemplates] = useLocalStorageState('swms_broadcast_templates', defaultBroadcastTemplates);
  const [broadcasts, setBroadcasts] = useLocalStorageState('swms_broadcasts', []);
  const [reviews, setReviews] = useLocalStorageState('swms_reviews', defaultReviews);
  const [profiles, setProfiles] = useLocalStorageState('swms_profiles', {});
  const [hw, setHw] = useLocalStorageState('swms_hw', defaultHwConfig);
  const [hwLogs, setHwLogs] = useLocalStorageState('swms_hw_logs', []);
  const [dataset, setDataset] = useLocalStorageState('swms_dataset', []);
  const [logs, setLogs] = useLocalStorageState('swms_logs', []);
  const [locations, setLocations] = useLocalStorageState('swms_locations', [DEFAULT_LOCATION, 'Kantin FTI', 'Gedung A']);

  const [user, setUser] = useState(null);

  const state = {
    users, setUsers,
    cmsLogin, setCmsLogin,
    team, setTeam,
    templates, setTemplates,
    broadcasts, setBroadcasts,
    reviews, setReviews,
    profiles, setProfiles,
    hw, setHw,
    hwLogs, setHwLogs,
    dataset, setDataset,
    logs, setLogs,
    locations, setLocations
  };

  if (!user) {
    return <LoginPage onLogin={setUser} cmsLogin={cmsLogin} team={team} users={users} setUsers={setUsers} />;
  }

  return <AppLayout user={user} onLogout={() => setUser(null)} state={state} />;
}

export default function App() {
  return (
    <ToastProvider>
      <AppInner />
      <ToastStack />
    </ToastProvider>
  );
}
