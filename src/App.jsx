import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Crosshair, Eye, Cpu, Monitor, ChevronRight, CheckCircle2, Zap, Target, Lock, X, Users, KeyRound, Plus, Trash2 } from 'lucide-react';

const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    const handleMouseOver = (e) => {
      if (e.target.closest('button') || e.target.closest('a') || e.target.closest('.cursor-pointer')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-white rounded-full pointer-events-none z-[10000] shadow-[0_0_5px_rgba(255,255,255,0.8)] hidden md:block"
        animate={{
          x: mousePosition.x - 3,
          y: mousePosition.y - 3,
          opacity: isHovering ? 0 : 1,
        }}
        transition={{ type: "tween", ease: "linear", duration: 0 }}
      />
      <motion.div
        className="fixed top-0 left-0 w-6 h-6 border rounded-full pointer-events-none z-[9999] hidden md:block"
        animate={{
          x: mousePosition.x - 12,
          y: mousePosition.y - 12,
          scale: isHovering ? 1.5 : 1,
          backgroundColor: isHovering ? "rgba(99, 102, 241, 0.15)" : "transparent",
          borderColor: isHovering ? "rgba(99, 102, 241, 0.5)" : "rgba(255, 255, 255, 0.15)",
        }}
        transition={{ type: "spring", stiffness: 600, damping: 30, mass: 0.1 }}
      />
    </>
  );
};

const PremiumGamingLanding = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [activeTab, setActiveTab] = useState('aimbot');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login', 'register', 'forgot'
  const [user, setUser] = useState(null); // Giriş yapan kullanıcı bilgisi
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  // --- API State ---
  const API_URL = 'http://localhost:5000/api';
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  const [adminUsers, setAdminUsers] = useState([]);
  const [adminLicenses, setAdminLicenses] = useState([]);
  const [adminTab, setAdminTab] = useState('licenses'); // 'users', 'licenses'
  const [isGenerating, setIsGenerating] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState(null);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [newKeyPlan, setNewKeyPlan] = useState('');
  const [notification, setNotification] = useState(null); // { type: 'success' | 'error', message: '' }

  // Notification Auto-hide
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // --- Check Auth on Mount ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user);
      })
      .catch(err => console.error(err));
    }
  }, []);

  // --- Admin Data Fetch ---
  const fetchAdminData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const [usersRes, licensesRes] = await Promise.all([
        fetch(`${API_URL}/admin/users`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/admin/licenses`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setAdminUsers(usersData.users || []);
      }
      if (licensesRes.ok) {
        const licensesData = await licensesRes.json();
        setAdminLicenses(licensesData.licenses || []);
      }
    } catch (err) {
      console.error('Admin verileri alınamadı', err);
    }
  };

  useEffect(() => {
    if (isAdminPanelOpen && user?.role === 'admin') {
      fetchAdminData();
    }
  }, [isAdminPanelOpen, user]);

  // --- Auth Handlers ---
  const handleLogin = async () => {
    setAuthError('');
    setAuthSuccess('');
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput, password: passwordInput })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        setIsLoginOpen(false);
        setUsernameInput('');
        setPasswordInput('');
      } else {
        setAuthError(data.error || 'Giriş başarısız.');
      }
    } catch (err) {
      setAuthError('Sunucuya bağlanılamadı.');
    }
  };

  const handleRegister = async () => {
    setAuthError('');
    setAuthSuccess('');
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput, email: emailInput, password: passwordInput })
      });
      const data = await res.json();
      if (res.ok) {
        setAuthSuccess('Kayıt başarılı. Lütfen giriş yapın.');
        setAuthMode('login');
        setPasswordInput('');
      } else {
        setAuthError(data.error || 'Kayıt başarısız.');
      }
    } catch (err) {
      setAuthError('Sunucuya bağlanılamadı.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // --- Admin Handlers ---
  const handleGenerateKey = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setIsGenerating(true);
    try {
      const res = await fetch(`${API_URL}/admin/generate-key`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ plan_type: newKeyPlan, expires_at: null })
      });
      const data = await res.json();
      if (res.ok) {
        setIsGenerateModalOpen(false);
        fetchAdminData();
        setNotification({ type: 'success', message: `Yeni ${newKeyPlan === 'monthly' ? 'Aylık' : newKeyPlan === 'lifetime' ? 'Ömür Boyu' : 'Haftalık'} lisans başarıyla üretildi!` });
      } else {
        setNotification({ type: 'error', message: data.error || 'Lisans üretilemedi!' });
      }
    } catch (err) {
      console.error(err);
      setNotification({ type: 'error', message: 'Sunucuya bağlanılamadı!' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteKey = async () => {
    if (!keyToDelete) return;
    
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      const res = await fetch(`${API_URL}/admin/licenses/${keyToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setKeyToDelete(null);
        fetchAdminData();
        setNotification({ type: 'success', message: 'Lisans kalıcı olarak silindi!' });
      } else {
        setNotification({ type: 'error', message: 'Lisans silinirken bir hata oluştu.' });
      }
    } catch (err) {
      console.error('Silme hatası:', err);
      setNotification({ type: 'error', message: 'Sunucuya bağlanılamadı!' });
    }
  };

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  const featureTabs = {
    aimbot: {
      title: 'Özellik Başlığı 1',
      icon: <Target className="w-8 h-8 text-indigo-500 mb-4" />,
      description: 'Features bölümünü site sahibi dolduracak.',
      points: [
        'Özellik detayı buraya eklenecek',
        'Özellik detayı buraya eklenecek',
        'Özellik detayı buraya eklenecek',
        'Özellik detayı buraya eklenecek'
      ]
    },
    visuals: {
      title: 'Özellik Başlığı 2',
      icon: <Eye className="w-8 h-8 text-indigo-500 mb-4" />,
      description: 'Features bölümünü site sahibi dolduracak.',
      points: [
        'Özellik detayı buraya eklenecek',
        'Özellik detayı buraya eklenecek',
        'Özellik detayı buraya eklenecek',
        'Özellik detayı buraya eklenecek'
      ]
    },
    protection: {
      title: 'Özellik Başlığı 3',
      icon: <Lock className="w-8 h-8 text-indigo-500 mb-4" />,
      description: 'Features bölümünü site sahibi dolduracak.',
      points: [
        'Özellik detayı buraya eklenecek',
        'Özellik detayı buraya eklenecek',
        'Özellik detayı buraya eklenecek',
        'Özellik detayı buraya eklenecek'
      ]
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0C10] text-gray-300 font-sans selection:bg-indigo-500/30 overflow-x-hidden relative">
      <CustomCursor />
      
      {/* Subtle Premium Background */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a1829] via-[#0B0C10] to-[#0B0C10] opacity-40" />
      
      {/* Navbar */}
      {!isAdminPanelOpen && (
        <nav className="fixed top-0 w-full z-50 bg-[#0B0C10]/90 backdrop-blur-md border-b border-white/[0.04]">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold tracking-tight text-white">XXXX</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
              <button onClick={scrollToFeatures} className="hover:text-white transition-colors">Özellikler</button>
              <a href="#compatibility" className="hover:text-white transition-colors">Uyumluluk</a>
              <a href="#pricing" className="hover:text-white transition-colors">Fiyatlandırma</a>
            </div>

            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <span className="hidden sm:block text-sm font-medium text-gray-400">
                    Hoş geldin, <span className="text-white">{user.username}</span>
                  </span>
                  {user.role === 'admin' && (
                    <button 
                      onClick={() => setIsAdminPanelOpen(true)}
                      className="text-sm font-semibold text-white bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/50 px-4 py-2 rounded-lg transition-all shadow-[0_0_15px_rgba(79,70,229,0.2)]"
                    >
                      Admin Panel
                    </button>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
                  >
                    Çıkış
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => {
                      setAuthMode('login');
                      setIsLoginOpen(true);
                    }}
                    className="hidden sm:block text-sm font-medium text-gray-400 hover:text-white transition-colors"
                  >
                    Giriş Yap
                  </button>
                  <button 
                    onClick={() => setIsPopupOpen(true)}
                    className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 rounded-lg transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]"
                  >
                    Hemen Başla
                  </button>
                </>
              )}
            </div>
          </div>
        </nav>
      )}

      {/* Hero Section */}
      <main className="relative z-10 pt-40 pb-24 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center">
          
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span className="text-xs font-semibold text-emerald-400 tracking-wide uppercase">Durumu: Tespit Edilmiyor</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 max-w-4xl leading-[1.1]"
          >
            FiveM<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400"></span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl"
          >
            Bu Web Sitesi Motion Js kütüphanesi kullanılarak Sely Tarafından yapılmıştır
             </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <button 
              onClick={() => setIsPopupOpen(true)}
              className="px-8 py-4 bg-white text-[#0B0C10] font-bold rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
            >
              Lisans Satın Al <ChevronRight className="w-4 h-4" />
            </button>
            <button 
              onClick={scrollToFeatures}
              className="px-8 py-4 bg-[#1A1C23] text-white font-semibold rounded-xl hover:bg-[#252830] transition-colors border border-white/5"
            >
              Demo
            </button>
          </motion.div>
        </div>

        {/* Real-world UI Mockup */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-20 relative mx-auto max-w-5xl hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C10] via-transparent to-transparent z-20 h-full w-full pointer-events-none" />
          
          <div className={`relative bg-[#12131A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden transition-transform duration-700 ease-out ${isHovered ? 'scale-[1.02]' : 'scale-100'}`}>
            
            {/* Windows App Title Bar */}
            <div className="h-10 bg-[#0D0E12] border-b border-white/5 flex items-center px-4 justify-between">
              <div className="text-xs font-semibold text-gray-500">XXXX Client v2.4</div>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-[#2A2D3A]" />
                <div className="w-3 h-3 rounded-full bg-[#2A2D3A]" />
                <div className="w-3 h-3 rounded-full bg-[#2A2D3A]" />
              </div>
            </div>

            {/* App Layout */}
            <div className="flex h-[400px]">
              {/* Sidebar */}
              <div className="w-48 bg-[#0F1015] border-r border-white/5 p-4 flex flex-col gap-2">
                {['Panel', 'Hedefleme', 'Görseller', 'Ekstralar', 'Renkler', 'Ayarlar'].map((item, i) => (
                  <div key={item} className={`px-3 py-2 rounded-lg text-sm font-medium cursor-pointer ${i === 2 ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                    {item}
                  </div>
                ))}
              </div>
              
              {/* Main Content Area */}
              <div className="flex-1 p-8 bg-[#12131A]">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-bold text-white">Görsel Yapılandırma</h3>
                  <div className="px-3 py-1 bg-[#1A1C23] rounded-md text-xs text-gray-400 border border-white/5">Profil: Gizli (Legit)</div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300 font-medium">ESP Aktif Et</span>
                      <div className="w-12 h-6 bg-indigo-600 rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow" /></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300 font-medium">İskelet Çiz (Skeleton)</span>
                      <div className="w-12 h-6 bg-indigo-600 rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow" /></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300 font-medium">Can Barı Göster</span>
                      <div className="w-12 h-6 bg-[#252830] rounded-full relative cursor-pointer"><div className="absolute left-1 top-1 w-4 h-4 bg-gray-400 rounded-full shadow" /></div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="text-sm text-gray-300 font-medium mb-2">Görüş Mesafesi: 450m</div>
                    <div className="h-2 bg-[#252830] rounded-full overflow-hidden">
                      <div className="h-full w-[75%] bg-indigo-500" />
                    </div>
                    <div className="mt-8 p-4 bg-[#1A1C23] border border-white/5 rounded-lg">
                      <div className="text-xs text-gray-400 mb-2">Kutu Rengi Önizleme</div>
                      <div className="flex gap-2">
                        <div className="w-6 h-6 rounded bg-red-500 cursor-pointer ring-2 ring-white/20" />
                        <div className="w-6 h-6 rounded bg-indigo-500 cursor-pointer" />
                        <div className="w-6 h-6 rounded bg-emerald-500 cursor-pointer" />
                        <div className="w-6 h-6 rounded bg-white cursor-pointer" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Interactive Features Section */}
      <section id="features" className="py-32 bg-[#0B0C10] relative z-10 border-t border-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Kapsamlı Araç Seti</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              XXXX'ı piyasadaki en güçlü altyapı yapan modülleri keşfedin.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Feature Sidebar */}
            <div className="w-full lg:w-1/3 flex flex-col gap-2">
              <button 
                onClick={() => setActiveTab('aimbot')}
                className={`p-6 text-left rounded-2xl transition-all border ${activeTab === 'aimbot' ? 'bg-[#12131A] border-indigo-500/30 shadow-lg' : 'bg-transparent border-transparent hover:bg-white/5'}`}
              >
                <div className="flex items-center gap-3 mb-1">
                  <Crosshair className={`w-5 h-5 ${activeTab === 'aimbot' ? 'text-indigo-400' : 'text-gray-500'}`} />
                  <h3 className={`font-bold ${activeTab === 'aimbot' ? 'text-white' : 'text-gray-400'}`}>Özellik Bölümü 1</h3>
                </div>
                <p className="text-sm text-gray-500 pl-8">Kısa açıklama buraya gelecek.</p>
              </button>

              <button 
                onClick={() => setActiveTab('visuals')}
                className={`p-6 text-left rounded-2xl transition-all border ${activeTab === 'visuals' ? 'bg-[#12131A] border-indigo-500/30 shadow-lg' : 'bg-transparent border-transparent hover:bg-white/5'}`}
              >
                <div className="flex items-center gap-3 mb-1">
                  <Eye className={`w-5 h-5 ${activeTab === 'visuals' ? 'text-indigo-400' : 'text-gray-500'}`} />
                  <h3 className={`font-bold ${activeTab === 'visuals' ? 'text-white' : 'text-gray-400'}`}>Özellik Bölümü 2</h3>
                </div>
                <p className="text-sm text-gray-500 pl-8">Kısa açıklama buraya gelecek.</p>
              </button>

              <button 
                onClick={() => setActiveTab('protection')}
                className={`p-6 text-left rounded-2xl transition-all border ${activeTab === 'protection' ? 'bg-[#12131A] border-indigo-500/30 shadow-lg' : 'bg-transparent border-transparent hover:bg-white/5'}`}
              >
                <div className="flex items-center gap-3 mb-1">
                  <ShieldCheck className={`w-5 h-5 ${activeTab === 'protection' ? 'text-indigo-400' : 'text-gray-500'}`} />
                  <h3 className={`font-bold ${activeTab === 'protection' ? 'text-white' : 'text-gray-400'}`}>Özellik Bölümü 3</h3>
                </div>
                <p className="text-sm text-gray-500 pl-8">Kısa açıklama buraya gelecek.</p>
              </button>
            </div>

            {/* Feature Content Display */}
            <div className="w-full lg:w-2/3 bg-[#12131A] border border-white/5 rounded-3xl p-8 md:p-12 relative overflow-hidden min-h-[400px] flex flex-col justify-center">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[100px] rounded-full pointer-events-none" />
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="relative z-10"
                >
                  {featureTabs[activeTab].icon}
                  <h3 className="text-3xl font-bold text-white mb-4">{featureTabs[activeTab].title}</h3>
                  <p className="text-gray-400 text-lg leading-relaxed mb-8 max-w-xl">
                    {featureTabs[activeTab].description}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {featureTabs[activeTab].points.map((point, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-300">{point}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Clean Compatibility Specs */}
      <section id="compatibility" className="py-24 px-6 relative z-10 bg-[#0F1015]">
        <div className="max-w-5xl mx-auto bg-[#12131A] rounded-3xl border border-white/5 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-white mb-6">Sistem Gereksinimleri</h2>
            <p className="text-gray-400 mb-8">XXXX üst düzeyde optimize edilmiştir, ancak güvenlik önlemlerimizin doğru çalışması için belirli sistem yapılandırmaları gerektirir.</p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Sistem gereksinimi buraya eklenecek
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Sistem gereksinimi buraya eklenecek
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Sistem gereksinimi buraya eklenecek
              </div>
            </div>
          </div>
          
          <div className="flex-1 w-full grid grid-cols-2 gap-4">
            <div className="bg-[#1A1C23] p-6 rounded-2xl flex flex-col items-center justify-center text-center border border-white/5">
              <Monitor className="w-8 h-8 text-gray-400 mb-3" />
              <div className="text-white font-semibold">Öne Çıkan Bilgi 1</div>
              <div className="text-xs text-gray-500 mt-1">Site sahibi dolduracak</div>
            </div>
            <div className="bg-[#1A1C23] p-6 rounded-2xl flex flex-col items-center justify-center text-center border border-white/5">
              <Cpu className="w-8 h-8 text-gray-400 mb-3" />
              <div className="text-white font-semibold">Öne Çıkan Bilgi 2</div>
              <div className="text-xs text-gray-500 mt-1">Site sahibi dolduracak</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing - Real SaaS Look */}
      <section id="pricing" className="py-24 bg-[#0B0C10] border-t border-white/[0.02]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Planınızı Seçin</h2>
            <p className="text-gray-400">Anında teslimat. Kripto ile tamamen güvenli ödeme.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#12131A] p-8 rounded-3xl border border-white/5 flex flex-col hover:border-white/10 transition-colors">
              <h3 className="text-lg font-medium text-gray-400 mb-2">Aylık Lisans</h3>
              <div className="flex items-end gap-1 mb-6">
                <span className="text-4xl font-bold text-white">$29</span>
                <span className="text-gray-500 mb-1">/aylık</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-center gap-3 text-sm text-gray-300"><CheckCircle2 className="w-4 h-4 text-indigo-500" /> Tüm Özelliklere Erişim</li>
                <li className="flex items-center gap-3 text-sm text-gray-300"><CheckCircle2 className="w-4 h-4 text-indigo-500" /> HWID Spoofer Dahil</li>
                <li className="flex items-center gap-3 text-sm text-gray-300"><CheckCircle2 className="w-4 h-4 text-indigo-500" /> 7/24 Destek Talebi (Ticket)</li>
              </ul>
              <button 
                onClick={() => setIsPopupOpen(true)}
                className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold transition-colors border border-white/5"
              >
                Satın al
              </button>
            </div>

            <div className="bg-[#151622] p-8 rounded-3xl border border-indigo-500/30 flex flex-col relative shadow-[0_0_30px_rgba(79,70,229,0.05)]">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg shadow-indigo-500/20">
                EN POPÜLER
              </div>
              <h3 className="text-lg font-medium text-indigo-300 mb-2">Ömür Boyu (Lifetime) Lisans</h3>
              <div className="flex items-end gap-1 mb-6">
                <span className="text-4xl font-bold text-white">$149</span>
                <span className="text-gray-500 mb-1">/tek seferlik</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-center gap-3 text-sm text-gray-300"><CheckCircle2 className="w-4 h-4 text-indigo-500" /> Aylık paketteki her şey</li>
              </ul>
              <button 
                onClick={() => setIsPopupOpen(true)}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)]"
              >
                Satın al
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-white/5 bg-[#0B0C10] text-center relative z-10">
        <div className="text-gray-500 text-sm">
          &copy; 2026 XXXX SOFTWARE Tüm hakları saklıdır <br />
        </div>
      </footer>

      {/* Admin Panel Full Screen */}
      <AnimatePresence>
        {isAdminPanelOpen && user?.role === 'admin' && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-[#0B0C10] flex flex-col"
          >
            <div className="h-16 bg-[#0D0E12] border-b border-white/5 flex items-center justify-between px-6">
              <div className="flex items-center gap-3">
                {/* <ShieldCheck className="w-6 h-6 text-indigo-400" /> */}
                <div>
                  <h3 className="text-xl font-bold text-white tracking-wide">Yönetim Paneli</h3>
                  <p className="text-xs text-indigo-400 font-medium">Sistem Yöneticisi</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAdminPanelOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              >
                Paneli Kapat <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 flex overflow-hidden">
              {/* Admin Sidebar */}
              <div className="w-72 bg-[#0B0C10] border-r border-white/5 p-6 flex flex-col gap-2">
                <button 
                  onClick={() => setAdminTab('users')}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-colors ${adminTab === 'users' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'hover:bg-white/5 text-gray-400 hover:text-white border border-transparent'}`}
                >
                  <Users className="w-5 h-5" />
                  Kullanıcılar
                </button>
                <button 
                  onClick={() => setAdminTab('licenses')}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-colors ${adminTab === 'licenses' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'hover:bg-white/5 text-gray-400 hover:text-white border border-transparent'}`}
                >
                  <KeyRound className="w-5 h-5" />
                  Lisans Anahtarları
                </button>
                <button className="flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white font-medium transition-colors border border-transparent">
                  <Monitor className="w-5 h-5" />
                  Sistem Durumu
                </button>
              </div>
              
              {/* Admin Content */}
              <div className="flex-1 p-10 overflow-y-auto bg-[#12131A] relative">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="max-w-6xl mx-auto relative z-10">
                  {adminTab === 'licenses' && (
                    <>
                      <div className="flex justify-between items-center mb-10">
                        <div>
                          <h4 className="text-3xl font-bold text-white mb-2">Lisans Yönetimi</h4>
                          <p className="text-gray-400">Platformdaki tüm aktif ve pasif lisansları görüntüleyin ve yönetin.</p>
                        </div>
                        <button 
                          onClick={() => setIsGenerateModalOpen(true)}
                          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]"
                        >
                          <Plus className="w-5 h-5" />
                          Yeni Key Üret
                        </button>
                      </div>
                      
                      {/* Stats Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        <div className="p-8 rounded-3xl bg-[#0F1015] border border-white/5 shadow-xl relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Users className="w-16 h-16 text-white" />
                          </div>
                          <div className="text-gray-400 text-sm font-medium mb-3">Toplam Kullanıcı</div>
                          <div className="text-4xl font-bold text-white">{adminUsers.length || 0}</div>
                        </div>
                        <div className="p-8 rounded-3xl bg-[#0F1015] border border-indigo-500/20 shadow-[0_0_30px_rgba(79,70,229,0.05)] relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 opacity-10">
                            <KeyRound className="w-16 h-16 text-indigo-400" />
                          </div>
                          <div className="text-indigo-400 text-sm font-medium mb-3">Toplam Lisans</div>
                          <div className="text-4xl font-bold text-white">{adminLicenses.length || 0}</div>
                        </div>
                        <div className="p-8 rounded-3xl bg-[#0F1015] border border-white/5 shadow-xl relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Monitor className="w-16 h-16 text-emerald-400" />
                          </div>
                          <div className="text-gray-400 text-sm font-medium mb-3">Aktif (Kullanılan) Lisanslar</div>
                          <div className="text-4xl font-bold text-emerald-400">{adminLicenses.filter(l => l.user_id).length || 0}</div>
                        </div>
                      </div>

                      {/* Mock Table */}
                      <div className="bg-[#0F1015] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
                          <h5 className="font-bold text-white text-lg">Tüm Lisanslar</h5>
                        </div>
                        <div className="p-0 overflow-x-auto">
                          <table className="w-full text-left text-sm text-gray-400">
                            <thead className="bg-[#12131A] text-gray-500">
                              <tr>
                                <th className="px-8 py-4 font-semibold uppercase tracking-wider text-xs">Lisans Anahtarı</th>
                                <th className="px-8 py-4 font-semibold uppercase tracking-wider text-xs">Tür</th>
                                <th className="px-8 py-4 font-semibold uppercase tracking-wider text-xs">Durum</th>
                                <th className="px-8 py-4 font-semibold uppercase tracking-wider text-xs text-right">Oluşturulma Tarihi</th>
                                <th className="px-8 py-4 font-semibold uppercase tracking-wider text-xs text-center">İşlem</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {adminLicenses.length > 0 ? adminLicenses.map((license) => (
                                <tr key={license.id} className="hover:bg-white/[0.02] transition-colors group">
                                  <td className="px-8 py-5 font-mono text-gray-300 font-medium">{license.license_key}</td>
                                  <td className="px-8 py-5 capitalize">
                                    <span className="bg-white/5 text-gray-300 px-3 py-1 rounded-lg text-xs font-medium border border-white/10">
                                      {license.plan_type}
                                    </span>
                                  </td>
                                  <td className="px-8 py-5">
                                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${license.user_id ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                                      {license.user_id ? `Kullanımda (ID: ${license.user_id})` : 'Boşta (Aktif)'}
                                    </span>
                                  </td>
                                  <td className="px-8 py-5 text-right">{new Date(license.created_at).toLocaleDateString('tr-TR')}</td>
                                  <td className="px-8 py-5 text-center">
                                    <button 
                                      onClick={() => setKeyToDelete(license)}
                                      className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                      title="Lisansı Sil"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                              )) : (
                                <tr>
                                  <td colSpan="5" className="px-8 py-12 text-center text-gray-500">Henüz hiç lisans üretilmedi.</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  )}

                  {adminTab === 'users' && (
                    <>
                      <div className="flex justify-between items-center mb-10">
                        <div>
                          <h4 className="text-3xl font-bold text-white mb-2">Kullanıcı Yönetimi</h4>
                          <p className="text-gray-400">Platforma kayıtlı tüm kullanıcıları görüntüleyin.</p>
                        </div>
                      </div>
                      
                      <div className="bg-[#0F1015] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                        <div className="px-8 py-6 border-b border-white/5">
                          <h5 className="font-bold text-white text-lg">Tüm Kullanıcılar</h5>
                        </div>
                        <div className="p-0 overflow-x-auto">
                          <table className="w-full text-left text-sm text-gray-400">
                            <thead className="bg-[#12131A] text-gray-500">
                              <tr>
                                <th className="px-8 py-4 font-semibold uppercase tracking-wider text-xs">ID</th>
                                <th className="px-8 py-4 font-semibold uppercase tracking-wider text-xs">Kullanıcı Adı</th>
                                <th className="px-8 py-4 font-semibold uppercase tracking-wider text-xs">E-posta</th>
                                <th className="px-8 py-4 font-semibold uppercase tracking-wider text-xs">Rol</th>
                                <th className="px-8 py-4 font-semibold uppercase tracking-wider text-xs text-right">Kayıt Tarihi</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {adminUsers.length > 0 ? adminUsers.map((u) => (
                                <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                                  <td className="px-8 py-5 text-gray-500 font-medium">#{u.id}</td>
                                  <td className="px-8 py-5 font-bold text-white">{u.username}</td>
                                  <td className="px-8 py-5 text-gray-400">{u.email}</td>
                                  <td className="px-8 py-5">
                                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${u.role === 'admin' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                                      {u.role.toUpperCase()}
                                    </span>
                                  </td>
                                  <td className="px-8 py-5 text-right text-gray-500">{new Date(u.created_at).toLocaleDateString('tr-TR')}</td>
                                </tr>
                              )) : (
                                <tr>
                                  <td colSpan="5" className="px-8 py-12 text-center text-gray-500">Sistemde hiç kullanıcı yok.</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generate Key Modal */}
      <AnimatePresence>
        {isGenerateModalOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsGenerateModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#12131A] border border-indigo-500/20 rounded-2xl shadow-2xl z-[301] overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-white/5 bg-[#0F1015]">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-indigo-400" /> Yeni Lisans Oluştur
                </h3>
                <button 
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-3">Abonelik Süresi / Tipi</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setNewKeyPlan('weekly')}
                      className={`py-3 px-4 rounded-xl border font-medium text-sm transition-all ${
                        newKeyPlan === 'weekly' 
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]' 
                          : 'bg-[#0B0C10] border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      Haftalık
                    </button>
                    <button
                      onClick={() => setNewKeyPlan('monthly')}
                      className={`py-3 px-4 rounded-xl border font-medium text-sm transition-all ${
                        newKeyPlan === 'monthly' 
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]' 
                          : 'bg-[#0B0C10] border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      Aylık
                    </button>
                    <button
                      onClick={() => setNewKeyPlan('lifetime')}
                      className={`py-3 px-4 rounded-xl border font-medium text-sm transition-all ${
                        newKeyPlan === 'lifetime' 
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]' 
                          : 'bg-[#0B0C10] border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      Sınırsız
                    </button>
                  </div>
                </div>

                <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl">
                  <p className="text-sm text-indigo-300 font-medium flex items-start gap-2">
                    <Monitor className="w-5 h-5 shrink-0" /> 
                    Müşteri, bu key'i kendi hesabında onayladığında HWID kaydı yapılacak ve aboneliği başlatılacaktır.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setIsGenerateModalOpen(false)}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-gray-300 font-semibold rounded-xl transition-colors"
                  >
                    İptal Et
                  </button>
                  <button 
                    onClick={handleGenerateKey}
                    disabled={isGenerating || !newKeyPlan}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors shadow-[0_0_15px_rgba(79,70,229,0.3)] flex justify-center items-center gap-2 disabled:opacity-50"
                  >
                    {isGenerating ? <Zap className="w-5 h-5 animate-pulse" /> : <Plus className="w-5 h-5" />}
                    {isGenerating ? 'Üretiliyor...' : 'Oluştur'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Key Confirmation Modal */}
      <AnimatePresence>
        {keyToDelete && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setKeyToDelete(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-[#12131A] border border-red-500/20 rounded-2xl shadow-2xl z-[301] p-6 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Lisansı Sil</h3>
              <p className="text-gray-400 text-sm mb-6">
                <span className="font-mono text-gray-300 block mb-2">{keyToDelete.license_key}</span>
                Bu lisans anahtarını kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setKeyToDelete(null)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-gray-300 font-semibold rounded-xl transition-colors"
                >
                  İptal Et
                </button>
                <button 
                  onClick={handleDeleteKey}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-colors shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                >
                  Evet, Sil
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Popup / Modal */}
      <AnimatePresence>
        {(isPopupOpen || isLoginOpen) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsPopupOpen(false);
                setIsLoginOpen(false);
              }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#12131A] border border-white/10 rounded-2xl shadow-2xl z-[101] overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-white/5 bg-[#0F1015]">
                <h3 className="text-xl font-bold text-white">
                  {isLoginOpen 
                    ? (authMode === 'forgot' ? "Şifremi Unuttum" : authMode === 'register' ? "Hesap Oluştur" : "Oturum Aç") 
                    : "Lisans Satın Al"}
                </h3>
                <button 
                  onClick={() => {
                    setIsPopupOpen(false);
                    setIsLoginOpen(false);
                    setTimeout(() => setAuthMode('login'), 300); // Reset after animation
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                {isLoginOpen ? (
                  <AnimatePresence mode="wait">
                    {authMode === "login" ? (
                      <motion.div 
                        key="login"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                      >
                        {authError && (
                          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">
                            {authError}
                          </div>
                        )}
                        {authSuccess && (
                          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-xl mb-4">
                            {authSuccess}
                          </div>
                        )}
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1.5">Kullanıcı Adı</label>
                          <input 
                            type="text" 
                            value={usernameInput}
                            onChange={(e) => setUsernameInput(e.target.value)}
                            placeholder="Kullanıcı adınızı girin" 
                            className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1.5">Şifre</label>
                          <input 
                            type="password" 
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            placeholder="••••••••" 
                            className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono tracking-widest"
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs mt-2">
                          <label className="flex items-center gap-2 cursor-pointer group">
                            <div className="relative flex items-center justify-center">
                              <input type="checkbox" className="appearance-none w-4 h-4 border border-white/20 rounded bg-[#0B0C10] checked:bg-indigo-600 checked:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all cursor-pointer peer" />
                              <svg className="absolute w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </div>
                            <span className="text-gray-400 group-hover:text-gray-300 transition-colors">Beni hatırla</span>
                          </label>
                          <button 
                            onClick={() => setAuthMode("forgot")}
                            className="text-indigo-400 hover:text-indigo-300 transition-colors"
                          >
                            Şifremi Unuttum
                          </button>
                        </div>
                        <button 
                          onClick={handleLogin}
                          className="w-full py-3 mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                        >
                          Giriş Yap
                        </button>
                        <div className="text-center mt-4">
                          <span className="text-gray-400 text-sm">Hesabınız yok mu? </span>
                          <button 
                            onClick={() => setAuthMode("register")}
                            className="text-indigo-400 hover:text-indigo-300 transition-colors text-sm font-medium"
                          >
                            Kayıt Ol
                          </button>
                        </div>
                      </motion.div>
                    ) : authMode === "register" ? (
                      <motion.div 
                        key="register"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                      >
                        {authError && (
                          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">
                            {authError}
                          </div>
                        )}
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1.5">Kullanıcı Adı</label>
                          <input 
                            type="text" 
                            value={usernameInput}
                            onChange={(e) => setUsernameInput(e.target.value)}
                            placeholder="Bir kullanıcı adı seçin" 
                            className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1.5">E-posta</label>
                          <input 
                            type="email" 
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            placeholder="mail@ornek.com" 
                            className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1.5">Şifre</label>
                          <input 
                            type="password" 
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            placeholder="Güçlü bir şifre girin" 
                            className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono tracking-widest"
                          />
                        </div>
                        <button 
                          onClick={handleRegister}
                          className="w-full py-3 mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                        >
                          Kayıt Ol
                        </button>
                        <div className="text-center mt-4">
                          <span className="text-gray-400 text-sm">Zaten hesabınız var mı? </span>
                          <button 
                            onClick={() => setAuthMode("login")}
                            className="text-indigo-400 hover:text-indigo-300 transition-colors text-sm font-medium"
                          >
                            Giriş Yap
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="forgot-password"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                      >
                        <p className="text-sm text-gray-400 mb-4">
                          Hesabınıza bağlı e-posta adresini girin. Şifre sıfırlama bağlantısını size göndereceğiz.
                        </p>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1.5">E-posta Adresi</label>
                          <input 
                            type="email" 
                            placeholder="mail@ornek.com" 
                            className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                          />
                        </div>
                        <div className="flex flex-col gap-3 mt-6">
                          <button 
                            onClick={() => {
                              setIsLoginOpen(false);
                              setTimeout(() => setAuthMode("login"), 300);
                            }}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                          >
                            Sıfırlama Bağlantısı Gönder
                          </button>
                          <button 
                            onClick={() => setAuthMode("login")}
                            className="w-full py-3 bg-transparent hover:bg-white/5 text-gray-400 hover:text-white font-semibold rounded-xl transition-colors border border-white/10"
                          >
                            Geri Dön
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                ) : (
                  <>
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8" />
                      </div>
                      <h4 className="text-lg font-semibold text-white mb-2">Satın Alma İşlemi</h4>
                      <p className="text-gray-400 text-sm">
                        Bu alana site sahibi kendi ödeme altyapısını (örn. Sellix, Shoppy, Kripto Cüzdanı veya Discord yönlendirmesi) ekleyecektir.
                      </p>
                    </div>
                    <button 
                      onClick={() => setIsPopupOpen(false)}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                    >
                      Anladım, Kapat
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Global Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-8 right-8 z-[9999] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border backdrop-blur-md ${
              notification.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.15)]' 
                : 'bg-red-500/10 border-red-500/30 text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.15)]'
            }`}
          >
            <div className={`p-2 rounded-xl ${notification.type === 'success' ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
              {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <X className="w-5 h-5" />}
            </div>
            <p className="font-semibold text-sm tracking-wide mr-2">{notification.message}</p>
            <button 
              onClick={() => setNotification(null)}
              className="ml-auto opacity-60 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default PremiumGamingLanding;