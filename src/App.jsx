import React, { useState, useEffect } from "react";
import {
  Upload,
  QrCode,
  History,
  Clipboard,
  Check,
  RefreshCcw,
  Home,
  Info,
  Mail,
  UserPlus,
  Plus,
  ShieldCheck,
  LogOut,
  FileText,
  Search,
  User,
  ArrowLeft,
  ArrowRight,
  Zap,
  Lock,
  Globe,
  X,
  Users,
  ClipboardCheck,
  Activity,
  Calendar,
  Pill,
  TrendingUp,
  BookOpen,
  Bell,
} from "lucide-react";
import { api } from "./api";

const mockDoctorPatients = [
  { id: "doc-patient-1", name: "Jane Doe" },
  { id: "doc-patient-2", name: "John Smith" },
  { id: "doc-patient-3", name: "Emily White" },
];

const App = () => {
  const [view, setView] = useState("landing");
  const [record, setRecord] = useState(null);
  const [token, setToken] = useState(null);
  const [tokenExpiry, setTokenExpiry] = useState(0);
  const [log, setLog] = useState([]);
  const [isCopied, setIsCopied] = useState(false);
  const [history, setHistory] = useState(["landing"]);
  const [errorMessage, setErrorMessage] = useState("");

  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [currentDocumentUrl, setCurrentDocumentUrl] = useState("");
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [user, setUser] = useState(null); // { id, name, email, role }

  const navigateTo = (newView) => {
    setHistory((prevHistory) => [...prevHistory, newView]);
    setView(newView);
    setErrorMessage("");
  };

  const goBack = () => {
    if (history.length > 1) {
      const newHistory = history.slice(0, history.length - 1);
      setHistory(newHistory);
      setView(newHistory[newHistory.length - 1]);
    } else {
      setView("landing");
    }
    setErrorMessage("");
  };

  const addLog = async (entry) => {
    setLog((prev) => [...prev, entry]);
    try {
      await api.addLog(entry.user, entry.action, entry.accessLevel || "Owner");
    } catch (e) {
      // ignore in demo
    }
  };

  const startTokenTimer = (seconds) => {
    setTokenExpiry(seconds);
    const timer = setInterval(() => {
      setTokenExpiry((prevExpiry) => {
        if (prevExpiry <= 1) {
          clearInterval(timer);
          setToken(null);
          return 0;
        }
        return prevExpiry - 1;
      });
    }, 1000);
  };

  const generateTokenForRecord = async (recordId, recordName) => {
    try {
      const { token: newToken, expiresIn } = await api.generateToken(recordId);
      setToken(newToken);
      setRecord({ id: recordId, name: recordName });
      startTokenTimer(expiresIn);

      await addLog({
        user: user?.role === "doctor" ? "Dr. Smith" : user?.name || "Patient",
        action: `Access token generated for record: ${recordName}`,
        timestamp: new Date().toLocaleString(),
        accessLevel: "Owner",
      });
    } catch (e) {
      setErrorMessage(e.message || "Failed to generate token");
    }
  };

  const simulateDoctorAccess = async (patientId) => {
    const newLogEntry = {
      user: "Dr. Smith",
      action: `Record accessed for Patient ID: ${patientId}`,
      timestamp: new Date().toLocaleString(),
      accessLevel: "Full Access",
    };
    await addLog(newLogEntry);
  };

  const copyToClipboard = async () => {
    if (!token) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(token);
      } else {
        const el = document.createElement("textarea");
        el.value = token;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (e) {
      setErrorMessage("Copy failed");
    }
  };

  const handleLogout = () => {
    setRecord(null);
    setToken(null);
    setTokenExpiry(0);
    setLog([]);
    setIsCopied(false);
    setHistory(["landing"]);
    setView("landing");
    setErrorMessage("");
    setUser(null);
  };

  const openDocumentViewer = (url) => {
    setCurrentDocumentUrl(url);
    setShowDocumentViewer(true);
  };

  const closeDocumentViewer = () => {
    setShowDocumentViewer(false);
    setCurrentDocumentUrl("");
  };

  const Container = ({ children }) => (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 text-gray-900 flex flex-col p-4 font-sans">
      <div className="p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-full transform transition-all duration-500 ease-in-out" style={{ backgroundColor: '#E5F6DF' }}>
        {children}
      </div>
    </div>
  );

  const BackButton = () => (
    <div className="mb-4">
      <button
        onClick={goBack}
        className="flex items-center text-gray-600 hover:text-emerald-500 transition-colors"
      >
        <ArrowLeft className="h-5 w-5 mr-2" /> Back
      </button>
    </div>
  );

  const AppLogo = () => (
    <button
      onClick={() => navigateTo("landing")}
      className="flex items-center group focus:outline-none"
    >
      <style>{`
        .plus-pulse-hover:hover {
          animation: pulse-plus 0.7s ease-in-out infinite alternate;
        }
        @keyframes pulse-plus {
          0% { transform: scale(1) rotate(0deg); }
          100% { transform: scale(1.2) rotate(90deg); }
        }
      `}</style>
      <Plus className="h-9 w-9 text-emerald-500 mr-3 transition-transform duration-300 group-hover:scale-110 plus-pulse-hover" />
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
        do<span className="text-emerald-500">Q</span>to<span className="text-emerald-500">R</span>
      </h1>
    </button>
  );

  const LandingView = () => {
    const [heroTextVisible, setHeroTextVisible] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
      setHeroTextVisible(true);

      const handleMouseMove = (e) => {
        setMousePosition({ x: e.clientX, y: e.clientY });
      };

      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    const parallaxOffset = 20;
    const getBlobTransform = (blobIndex) => {
      if (typeof window === 'undefined' || window.innerWidth === 0 || window.innerHeight === 0) {
        return 'translate(calc(-50%), calc(-50%)) scale(1)';
      }
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const offsetX = ((mousePosition.x - centerX) / centerX) * parallaxOffset;
      const offsetY = ((mousePosition.y - centerY) / centerY) * parallaxOffset;

      if (blobIndex === 1) {
        return `translate(calc(-50% + ${offsetX * 0.5}px), calc(-50% + ${offsetY * 0.5}px)) scale(1)`;
      } else if (blobIndex === 2) {
        return `translate(calc(-50% - ${offsetX * 0.8}px), calc(-50% - ${offsetY * 0.8}px)) scale(1.1)`;
      } else if (blobIndex === 3) {
        return `translate(calc(-50% + ${offsetX * 0.3}px), calc(-50% - ${offsetY * 0.3}px)) scale(0.9)`;
      }
      return '';
    };

    return (
      <div className="flex flex-col items-center min-h-[calc(100vh-8rem)] relative overflow-hidden">
        <nav className="flex items-center justify-between w-full mb-12 py-4">
          <AppLogo />
          <div className="flex space-x-4 sm:space-x-6 text-gray-600 font-medium">
            <button
              onClick={() => document.getElementById("features-section")?.scrollIntoView({ behavior: "smooth" })}
              className="hover:text-emerald-600 transition-colors flex items-center text-sm sm:text-base"
            >
              <Info className="h-4 w-4 mr-1 hidden sm:inline" />
              Features
            </button>
            <button
              onClick={() => navigateTo("contact")}
              className="hover:text-emerald-600 transition-colors flex items-center text-sm sm:text-base"
            >
              <Mail className="h-4 w-4 mr-1 hidden sm:inline" />
              Contact
            </button>
            <button
              onClick={() => setShowSignUpModal(true)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-md transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center text-sm sm:text-base"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Sign Up
            </button>
          </div>
        </nav>

        <header className="relative w-full text-center py-20 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob transition-transform duration-75 ease-out" style={{ transform: getBlobTransform(1) }}></div>
          <div className="absolute top-1/4 right-1/4 w-60 h-60 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000 transition-transform duration-75 ease-out" style={{ transform: getBlobTransform(2) }}></div>
          <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-emerald-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-6000 transition-transform duration-75 ease-out" style={{ transform: getBlobTransform(3) }}></div>

          <style>{`
            .animate-blob { animation: blob 7s infinite; }
            .animation-delay-2000 { animation-delay: 2s; }
            .animation-delay-4000 { animation-delay: 4s; }
            .animation-delay-6000 { animation-delay: 6s; }
            @keyframes blob {
              0% { transform: translate(0px, 0px) scale(1); }
              33% { transform: translate(30px, -50px) scale(1.1); }
              66% { transform: translate(-20px, 20px) scale(0.9); }
              100% { transform: translate(0px, 0px) scale(1); }
            }
            .fade-in-up { opacity: 0; transform: translateY(20px); animation: fadeInUp 1s ease-out forwards; }
            .delay-1 { animation-delay: 0.2s; }
            .delay-2 { animation-delay: 0.4s; }
            .delay-3 { animation-delay: 0.6s; }
            @keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }
          `}</style>

          <div className="relative z-10 max-w-4xl mx-auto">
            <h2 className={`text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight transition-opacity duration-1000 ${heroTextVisible ? "fade-in-up" : "opacity-0"}`}>
              Your Health, <br className="md:hidden"/> <span className="text-emerald-600">Securely Shared.</span>
            </h2>
            <p className={`text-lg md:text-xl text-gray-700 mb-10 max-w-2xl mx-auto transition-opacity duration-1000 delay-1 ${heroTextVisible ? "fade-in-up" : "opacity-0"}`}>
              doQtoR empowers you with unparalleled control over your medical records. Effortless, private, and always on your terms.
            </p>
            <div className={`flex flex-col sm:flex-row justify-center gap-6 transition-opacity duration-1000 delay-2 ${heroTextVisible ? "fade-in-up" : "opacity-0"}`}>
              <button onClick={() => navigateTo("login")} className="flex items-center justify-center px-10 py-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 text-lg">
                <ArrowRight className="h-6 w-6 mr-3" />
                Get Started
              </button>
              <button onClick={() => document.getElementById("features-section")?.scrollIntoView({ behavior: "smooth" })} className="flex items-center justify-center px-10 py-5 border-2 border-emerald-600 text-emerald-600 font-bold rounded-full transition-colors duration-300 hover:bg-emerald-50 hover:text-emerald-700 text-lg">
                Learn More
              </button>
            </div>
          </div>
        </header>

        <section id="features-section" className="w-full mt-24 py-16 bg-gradient-to-r from-emerald-50 to-green-50 rounded-3xl shadow-lg">
          <h3 className="text-4xl font-extrabold text-gray-900 text-center mb-12">Why Choose <span className="text-emerald-600">doQtoR?</span></h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 px-8 max-w-6xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col items-center text-center border-b-4 border-emerald-500">
              <Lock className="h-16 w-16 text-emerald-500 mb-6" />
              <h4 className="text-2xl font-bold text-gray-900 mb-3">Uncompromising Security</h4>
              <p className="text-gray-700 text-lg">Your data is protected with state-of-the-art encryption, ensuring confidentiality and integrity at all times.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col items-center text-center border-b-4 border-emerald-500">
              <QrCode className="h-16 w-16 text-emerald-500 mb-6" />
              <h4 className="text-2xl font-bold text-gray-900 mb-3">Complete Control</h4>
              <p className="text-gray-700 text-lg">Manage who sees your records and for how long with secure, time-limited QR codes. You're always in charge.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col items-center text-center border-b-4 border-emerald-500">
              <Zap className="h-16 w-16 text-emerald-500 mb-6" />
              <h4 className="text-2xl font-bold text-gray-900 mb-3">Effortless Sharing</h4>
              <p className="text-gray-700 text-lg">Streamline the sharing process with doctors and specialists, eliminating paper and hassle.</p>
            </div>
          </div>
        </section>

        <section className="w-full mt-24 bg-emerald-600 text-white py-16 rounded-3xl shadow-xl text-center">
          <h3 className="text-4xl font-extrabold mb-4">Ready to Take Control of Your Health?</h3>
          <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">Join the growing community of patients and doctors who trust doQtoR for secure and efficient health record management.</p>
          <button onClick={() => setShowSignUpModal(true)} className="flex items-center justify-center mx-auto px-12 py-5 bg-white hover:bg-gray-100 text-emerald-600 font-bold rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 text-lg">
            <UserPlus className="h-6 w-6 mr-3" />
            Sign Up Now
          </button>
        </section>

        <footer className="w-full mt-24 pt-10 pb-16 border-t-2 border-gray-200 text-center text-gray-700">
          <div className="flex justify-center items-center mb-6">
            <Plus className="h-8 w-8 text-emerald-500 mr-3" />
            <span className="text-2xl font-bold">doQtoR</span>
          </div>
          <p className="text-md mb-6 max-w-xl mx-auto">doQtoR is committed to revolutionizing how you interact with your health data. Experience the future of secure, patient-centric healthcare.</p>
          <div className="flex justify-center space-x-8 text-md">
            <a href="#" onClick={() => navigateTo("contact")} className="hover:text-emerald-600 transition-colors">Contact Us</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Terms of Service</a>
          </div>
          <p className="mt-8 text-sm text-gray-500">&copy; {new Date().getFullYear()} doQtoR. All rights reserved.</p>
        </footer>
      </div>
    );
  };

  const LoginView = () => {
    const [loginType, setLoginType] = useState("patient");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
      e.preventDefault();
      const username = e.target.elements[0].value;
      const password = e.target.elements[1].value;

      if (!username || !password) {
        setErrorMessage("Please enter both name and password.");
        return;
      }
      setLoading(true);
      setErrorMessage("");
      try {
        const { user } = await api.login(username, password, loginType);
        setUser(user);
        if (user.role === "patient") navigateTo("patientDashboard");
        else navigateTo("doctorDashboard");
      } catch (e) {
        setErrorMessage("Invalid credentials");
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="flex flex-col items-center text-center">
        <div className="flex justify-between items-center w-full mb-8">
          <AppLogo />
          <BackButton />
        </div>
        <header className="flex items-center justify-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight text-center">doQto<span className="text-emerald-500">R</span></h1>
        </header>

        <p className="text-gray-600 text-lg md:text-xl mb-8">Secure Patient Record Sharing</p>

        <div className="w-full max-w-sm rounded-xl overflow-hidden shadow-lg border border-gray-200 mb-8">
          <div className="grid grid-cols-2 bg-gray-100">
            <button onClick={() => { setLoginType("patient"); setErrorMessage(""); }} className={`p-3 text-lg font-semibold transition-colors duration-200 ${loginType === "patient" ? "bg-emerald-500 text-white" : "bg-transparent text-gray-600 hover:bg-gray-200"}`}>
              Patient Login
            </button>
            <button onClick={() => { setLoginType("doctor"); setErrorMessage(""); }} className={`p-3 text-lg font-semibold transition-colors duration-200 ${loginType === "doctor" ? "bg-emerald-500 text-white" : "bg-transparent text-gray-600 hover:bg-gray-200"}`}>
              Doctor Login
            </button>
          </div>
          <form onSubmit={handleLogin} className="p-6 space-y-6 bg-white">
            {errorMessage && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {errorMessage}</span>
                <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
                  <X className="h-6 w-6 fill-current cursor-pointer" onClick={() => setErrorMessage("")} />
                </span>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-left">Name or Email</label>
              <input type="text" placeholder="Enter your name or email" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-left">Password</label>
              <input type="password" placeholder="Enter your password" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors" required />
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95">
              {loading ? 'Logging in…' : `Login as ${loginType.charAt(0).toUpperCase() + loginType.slice(1)}`}
            </button>
          </form>
        </div>
        <p className="text-gray-500 text-sm">Don't have an account? <a href="#" onClick={() => setShowSignUpModal(true)} className="text-emerald-500 hover:underline">Sign Up</a></p>
      </div>
    );
  };

  const PatientDashboard = () => {
    const [records, setRecords] = useState([]);

    useEffect(() => {
      const fetchRecords = async () => {
        try {
          const { records } = await api.getRecords(user?.id);
          setRecords(records || []);
        } catch (e) {
          setRecords([]);
        }
      };
      fetchRecords();
    }, [user?.id]);

    const patientSummary = {
      totalRecords: records.length,
      upcomingAppointments: 2,
      activeMedications: 3,
      healthProgress: "On Track",
    };

    const PatientStatBar = ({ icon: Icon, label, value, color, onClick }) => (
      <div className="flex items-center justify-between p-4 rounded-xl shadow-md transition-all duration-300 transform hover:scale-105 cursor-pointer" style={{ backgroundColor: '#E5F6DF', borderLeft: `8px solid ${color}` }} onClick={onClick}>
        <div className="flex items-center">
          <Icon className="h-8 w-8 mr-4" style={{ color: color }} />
          <div>
            <p className="text-sm text-gray-600 font-medium">{label}</p>
            <span className="text-2xl font-bold text-gray-900">{value}</span>
          </div>
        </div>
        <ArrowRight className="h-5 w-5 text-gray-500" />
      </div>
    );

    return (
      <div className="flex flex-col items-center text-center">
        <div className="flex justify-between items-center w-full mb-8">
          <AppLogo />
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">Patient<span className="text-emerald-500">Dashboard</span></h1>
          <button onClick={handleLogout} className="flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors text-sm">
            <LogOut className="h-4 w-4 mr-2" />
            Log Out
          </button>
        </div>
        <p className="text-gray-600 text-lg md:text-xl mb-8">Welcome back{user?.name ? `, ${user.name}` : ''}! Here's your health overview.</p>

        <div className="w-full max-w-2xl mt-8 mb-12 flex flex-col gap-4">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-4">Your Health at a Glance</h3>
          <PatientStatBar icon={FileText} label="Total Records" value={patientSummary.totalRecords} color="#10B981" onClick={() => navigateTo("patientRecordsView")} />
          <PatientStatBar icon={Calendar} label="Upcoming Appointments" value={patientSummary.upcomingAppointments} color="#059669" onClick={() => alert("Navigate to Upcoming Appointments")} />
          <PatientStatBar icon={Pill} label="Active Medications" value={patientSummary.activeMedications} color="#047857" onClick={() => alert("Navigate to Medication List")} />
          <PatientStatBar icon={TrendingUp} label="Health Progress" value={patientSummary.healthProgress} color="#065F46" onClick={() => alert("Navigate to Health Trackers")} />
        </div>

        <div className="w-full max-w-2xl mt-4">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button onClick={() => navigateTo("upload")} className="flex items-center justify-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 border-b-4 border-emerald-500">
              <Upload className="h-8 w-8 text-emerald-500 mr-3" />
              <span className="text-lg font-semibold text-gray-900">Upload New Records</span>
            </button>
            <button onClick={() => navigateTo("log")} className="flex items-center justify-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 border-b-4 border-emerald-500">
              <History className="h-8 w-8 text-emerald-500 mr-3" />
              <span className="text-lg font-semibold text-gray-900">View Access History</span>
            </button>
            <button onClick={() => navigateTo("patientProfileView")} className="flex items-center justify-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 border-b-4 border-emerald-500">
              <User className="h-8 w-8 text-emerald-500 mr-3" />
              <span className="text-lg font-semibold text-gray-900">My Profile</span>
            </button>
            <button onClick={() => navigateTo("patientRecordsView")} className="flex items-center justify-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 border-b-4 border-emerald-500">
              <FileText className="h-8 w-8 text-emerald-500 mr-3" />
              <span className="text-lg font-semibold text-gray-900">All My Records</span>
            </button>
            <button onClick={() => alert("Navigate to Wellness Resources")} className="flex items-center justify-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 border-b-4 border-emerald-500">
              <BookOpen className="h-8 w-8 text-emerald-500 mr-3" />
              <span className="text-lg font-semibold text-gray-900">Wellness Resources</span>
            </button>
            <button onClick={() => alert("Navigate to Reminders")} className="flex items-center justify-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 border-b-4 border-emerald-500">
              <Bell className="h-8 w-8 text-emerald-500 mr-3" />
              <span className="text-lg font-semibold text-gray-900">Reminders</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const PatientRecordsView = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const load = async () => {
        try {
          const { records } = await api.getRecords(user?.id);
          setRecords(records || []);
        } catch (e) {
          setErrorMessage("Failed to load records");
        } finally {
          setLoading(false);
        }
      };
      load();
    }, [user?.id]);

    return (
      <div className="w-full">
        <div className="flex justify-between items-center w-full mb-6">
          <AppLogo />
          <BackButton />
        </div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">My Records</h2>
        </div>
        {loading ? (
          <p className="text-gray-600">Loading…</p>
        ) : (
          <div className="space-y-4">
            {records.map((rec) => (
              <div key={rec.id} className="bg-gray-100 p-4 rounded-xl shadow-inner flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div className="flex-1 mb-2 sm:mb-0">
                  <span className="text-lg font-semibold text-emerald-500">{rec.name}</span>
                  <span className="block text-sm text-gray-600">Uploaded: {rec.date}</span>
                  <span className={`block text-xs font-semibold mt-1 px-2 py-1 rounded-full w-fit ${rec.status === 'Viewed' ? 'bg-green-200 text-green-800' : rec.status === 'Pending' ? 'bg-yellow-200 text-yellow-800' : 'bg-red-200 text-red-800'}`}>Status: {rec.status}</span>
                </div>
                <button onClick={() => openDocumentViewer(rec.url || "https://placehold.co/800x600/22c55e/fff?text=Sample+Document")} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full transition-colors text-sm font-semibold mt-2 sm:mt-0">
                  View Document
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const PatientProfileView = () => (
    <div className="w-full">
      <div className="flex justify-between items-center w-full mb-6">
        <AppLogo />
        <BackButton />
      </div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">My Profile</h2>
      </div>
      <div className="bg-gray-100 p-6 rounded-xl shadow-inner space-y-4">
        <div className="flex items-center space-x-4">
          <User className="h-16 w-16 text-gray-500" />
          <div>
            <h3 className="text-xl font-bold">{user?.name || 'Patient Name'}</h3>
            <p className="text-gray-600">{user?.email || 'patient.name@example.com'}</p>
          </div>
        </div>
        <div className="border-t border-gray-300 pt-4">
          <p className="text-sm text-gray-600"><strong>User ID:</strong> {user?.id || '#12345'}</p>
          <p className="text-sm text-gray-600"><strong>Role:</strong> {user?.role || 'patient'}</p>
        </div>
      </div>
    </div>
  );

  const DoctorDashboard = () => {
    const [showQrModal, setShowQrModal] = useState(false);
    const [qrPatientName, setQrPatientName] = useState("");
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");

    const doctorSummary = {
      totalPatients: mockDoctorPatients.length,
      recordsAccessed: 150,
      qrCodesGenerated: 75,
      overallActivity: "High",
    };

    const generatePlaceholderQr = (patientName) => {
      const text = encodeURIComponent(patientName);
      return `https://placehold.co/200x200/22c55e/fff?text=${text}`;
    };

    const handleGenerateQr = (patient) => {
      setQrPatientName(patient.name);
      const url = generatePlaceholderQr(patient.name);
      setQrCodeDataUrl(url);
      setShowQrModal(true);
    };

    const StatBar = ({ icon: Icon, label, value, color }) => (
      <div className="flex items-center justify-between p-4 rounded-xl shadow-md transition-all duration-300 transform hover:scale-105 cursor-pointer" style={{ backgroundColor: '#E5F6DF', borderLeft: `8px solid ${color}` }}>
        <div className="flex items-center">
          <Icon className="h-8 w-8 mr-4" style={{ color: color }} />
          <div>
            <p className="text-sm text-gray-600 font-medium">{label}</p>
            <span className="text-2xl font-bold text-gray-900">{value}</span>
          </div>
        </div>
        <ArrowRight className="h-5 w-5 text-gray-500" />
      </div>
    );

    return (
      <div className="flex flex-col items-center text-center">
        <div className="flex justify-between items-center w-full mb-8">
          <AppLogo />
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">Doctor<span className="text-emerald-500">Dashboard</span></h1>
          <button onClick={handleLogout} className="flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors text-sm">
            <LogOut className="h-4 w-4 mr-2" />
            Log Out
          </button>
        </div>
        <p className="text-gray-600 text-lg md:text-xl mb-8">Welcome back, Dr. Smith! Here's an overview of your practice.</p>

        <div className="w-full max-w-2xl mt-8 mb-12 flex flex-col gap-4">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-4">Your Practice at a Glance</h3>
          <StatBar icon={Users} label="Total Patients" value={doctorSummary.totalPatients} color="#10B981" />
          <StatBar icon={ClipboardCheck} label="Records Accessed" value={doctorSummary.recordsAccessed} color="#059669" />
          <StatBar icon={QrCode} label="QR Codes Generated" value={doctorSummary.qrCodesGenerated} color="#047857" />
          <StatBar icon={Activity} label="Overall Activity" value={doctorSummary.overallActivity} color="#065F46" />
        </div>

        <div className="w-full max-w-md mt-4">
          <h3 className="text-2xl font-bold text-gray-800 text-left mb-4">Your Patients</h3>
          <ul className="space-y-3">
            {mockDoctorPatients.map((patient) => (
              <li key={patient.id} className="bg-gray-100 p-4 rounded-xl shadow-inner flex justify-between items-center">
                <span className="font-semibold">{patient.name}</span>
                <button onClick={() => handleGenerateQr(patient)} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full transition-colors text-sm font-semibold">Generate QR</button>
              </li>
            ))}
          </ul>
        </div>

        {showQrModal && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="p-8 rounded-3xl shadow-2xl relative max-w-sm w-full text-center" style={{ backgroundColor: '#E5F6DF' }}>
              <button onClick={() => setShowQrModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors">
                <X className="h-6 w-6" />
              </button>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">QR Code for {qrPatientName}</h3>
              <p className="text-gray-600 mb-6">Share this code with the patient for temporary access.</p>
              <div className="bg-gray-100 p-4 rounded-lg shadow-inner inline-block">
                <img src={qrCodeDataUrl} alt="QR Code" className="rounded-lg" />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const DoctorPatientRecordsView = () => (
    <div className="w-full">
      <div className="flex justify-between items-center w-full mb-6">
        <AppLogo />
        <BackButton />
      </div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Jane Doe's Records</h2>
      </div>
      <div className="space-y-4">
        {(log.length ? log : []).map((_, idx) => (
          <div key={idx} className="bg-gray-100 p-4 rounded-xl shadow-inner flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="flex-1 mb-2 sm:mb-0">
              <span className="text-lg font-semibold text-emerald-500">Sample Record</span>
              <span className="block text-sm text-gray-600">Uploaded: 2024-01-01</span>
            </div>
            <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full">PDF</span>
          </div>
        ))}
      </div>
    </div>
  );

  const UploadView = () => {
    const [fileName, setFileName] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!fileName.trim()) {
        setErrorMessage("Please enter a record name before generating an access code.");
        return;
      }
      if (!user?.id) {
        setErrorMessage("Please login first.");
        return;
      }
      setSubmitting(true);
      setErrorMessage("");
      try {
        const { record } = await api.createRecord(user.id, fileName);
        await generateTokenForRecord(record.id, record.name);
        navigateTo("qr");
      } catch (e) {
        setErrorMessage(e.message || "Failed to upload record");
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-between items-center w-full">
          <AppLogo />
          <BackButton />
        </div>
        <div className="flex justify-between items-center w-full">
          <h2 className="text-3xl font-bold text-gray-900">Upload a New Record</h2>
          <button onClick={handleLogout} className="flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors text-sm">
            <LogOut className="h-4 w-4 mr-2" />
            Log Out
          </button>
        </div>
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {errorMessage}</span>
            <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
              <X className="h-6 w-6 fill-current cursor-pointer" onClick={() => setErrorMessage("")} />
            </span>
          </div>
        )}
        <div>
          <label htmlFor="recordName" className="block text-sm font-medium text-gray-600 mb-2">Record Name (e.g., Blood Test Results, MRI Scan)</label>
          <input type="text" id="recordName" value={fileName} onChange={(e) => setFileName(e.target.value)} className="w-full px-4 py-3 bg-gray-100 rounded-lg text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors" placeholder="Enter a descriptive name" required />
        </div>
        <div>
          <label htmlFor="fileUpload" className="block text-sm font-medium text-gray-600 mb-2">Choose a File</label>
          <div className="flex items-center justify-center w-full">
            <label htmlFor="file-upload-input" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-100 border-gray-300 hover:bg-gray-200 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-4-4v-1a4 4 0 014-4h14a4 4 0 014 4v1a4 4 0 01-4 4h-2M12 12V3m0 9l3 3m-3-3l-3 3"></path></svg>
                <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                <p className="text-xs text-gray-500">PDF, JPG, PNG (MAX. 50MB)</p>
              </div>
              <input id="file-upload-input" type="file" className="hidden" />
            </label>
          </div>
        </div>
        <div className="flex justify-center">
          <button type="submit" disabled={submitting} className="flex items-center justify-center px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95">
            <QrCode className="mr-2" />
            {submitting ? 'Generating…' : 'Generate Access Code'}
          </button>
        </div>
      </form>
    );
  };

  const QrView = () => {
    const qrImageUrl = `https://placehold.co/200x200/22c55e/fff?text=${encodeURIComponent(token || '')}`;

    useEffect(() => {
      if (token) {
        const accessTimer = setTimeout(() => {
          simulateDoctorAccess(user?.id || "12345");
        }, 5000);
        return () => clearTimeout(accessTimer);
      }
    }, [token]);

    return (
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="flex justify-between items-center w-full mb-6">
          <AppLogo />
          <BackButton />
        </div>
        <div className="flex justify-between items-center w-full">
          <h2 className="text-3xl font-bold text-gray-900">Share Your Record Securely</h2>
          <button onClick={handleLogout} className="flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors text-sm">
            <LogOut className="h-4 w-4 mr-2" />
            Log Out
          </button>
        </div>
        <p className="text-gray-600 text-lg">Scan this QR code or use the token below. It will expire in <span className="text-emerald-500 font-bold">{tokenExpiry}</span> seconds.</p>

        <div className="bg-gray-200 p-4 rounded-xl shadow-md">
          <img src={qrImageUrl} alt="QR Code" className="rounded-lg" />
        </div>

        <div className="relative w-full max-w-sm">
          <div className="flex items-center justify-between bg-gray-100 text-gray-900 rounded-lg px-4 py-3 shadow-inner">
            <span className="text-lg font-mono tracking-widest">{token}</span>
            <button onClick={copyToClipboard} className="p-2 ml-4 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors" title="Copy to clipboard">
              {isCopied ? <Check className="h-5 w-5 text-emerald-500" /> : <Clipboard className="h-5 w-5 text-gray-600" />}
            </button>
          </div>
          {isCopied && <div className="absolute top-full mt-2 w-full text-center text-sm text-emerald-500 animate-fadeIn">Copied to clipboard!</div>}
        </div>

        <button onClick={() => navigateTo("log")} className="flex items-center justify-center px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95">
          <History className="mr-2" />
          View Access Log
        </button>
      </div>
    );
  };

  const LogView = () => (
    <div className="w-full">
      <div className="flex justify-between items-center w-full mb-6">
        <AppLogo />
        <BackButton />
      </div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Access Log</h2>
        <button onClick={handleLogout} className="flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors text-sm">
          <LogOut className="h-4 w-4 mr-2" />
          Log Out
        </button>
      </div>
      <p className="text-gray-600 mb-6">Here is a log of all access to your record, "{record?.name || "N/A"}".</p>
      <div className="space-y-4">
        {log.length === 0 ? (
          <p className="text-center text-gray-500">No access logs yet.</p>
        ) : (
          log.map((entry, index) => (
            <div key={index} className="bg-gray-100 p-4 rounded-xl shadow-inner flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-lg font-semibold text-emerald-500">{entry.user}</span>
                <span className="text-sm text-gray-600">{entry.action}</span>
                <span className="text-xs text-gray-500">{entry.timestamp}</span>
              </div>
              <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full">{entry.accessLevel}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const DocumentViewerModal = ({ documentUrl, onClose }) => {
    return (
      <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="p-6 rounded-3xl shadow-2xl relative max-w-3xl w-full max-h-[90vh] overflow-auto text-center" style={{ backgroundColor: '#E5F6DF' }}>
          <AppLogo />
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors">
            <X className="h-6 w-6" />
          </button>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Document Viewer</h3>
          <div className="flex justify-center items-center">
            {documentUrl?.match(/\.(png|jpg|jpeg)$/i) ? (
              <img src={documentUrl} alt="Document" className="max-w-full h-auto rounded-lg shadow-md" />
            ) : documentUrl?.endsWith(".pdf") ? (
              <p className="text-gray-600">PDF preview not available in this demo. Please download the file.</p>
            ) : (
              <p className="text-gray-600">Cannot display this document type directly.</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const ContactUsView = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [submissionStatus, setSubmissionStatus] = useState("");

    const handleSubmit = (e) => {
      e.preventDefault();
      if (name && email && message) {
        setSubmissionStatus("success");
        setName("");
        setEmail("");
        setMessage("");
        setTimeout(() => setSubmissionStatus(""), 3000);
      } else {
        setSubmissionStatus("error");
      }
    };

    return (
      <div className="w-full">
        <div className="flex justify-between items-center w-full mb-6">
          <AppLogo />
          <BackButton />
        </div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Contact Us</h2>
        </div>
        <p className="text-gray-600 mb-6">Have questions or need support? Reach out to us!</p>

        <div className="p-6 rounded-xl shadow-inner space-y-6" style={{ backgroundColor: '#E5F6DF' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-2 text-left">Your Name</label>
              <input type="text" id="contactName" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 rounded-lg text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors" style={{ backgroundColor: '#E5F6DF' }} placeholder="Enter your name" required />
            </div>
            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2 text-left">Your Email</label>
              <input type="email" id="contactEmail" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-lg text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors" style={{ backgroundColor: '#E5F6DF' }} placeholder="your.email@example.com" required />
            </div>
            <div>
              <label htmlFor="contactMessage" className="block text-sm font-medium text-gray-700 mb-2 text-left">Message</label>
              <textarea id="contactMessage" rows="5" value={message} onChange={(e) => setMessage(e.target.value)} className="w-full px-4 py-3 rounded-lg text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors resize-y" style={{ backgroundColor: '#E5F6DF' }} placeholder="Type your message here..." required></textarea>
            </div>
            <button type="submit" className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center">
              Send Message
            </button>
          </form>

          {submissionStatus === "success" && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative text-center" role="alert">
              <strong className="font-bold">Success!</strong>
              <span className="block sm:inline"> Your message has been sent.</span>
            </div>
          )}
          {submissionStatus === "error" && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center" role="alert">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline"> Please fill in all fields.</span>
            </div>
          )}

          <div className="border-t border-gray-300 pt-6 mt-6 space-y-4">
            <h3 className="text-xl font-bold text-gray-900">Other Ways to Reach Us</h3>
            <p className="text-gray-600 flex items-center"><Mail className="h-5 w-5 mr-2 text-emerald-500" />Email: <a href="mailto:support@vitalkey.com" className="text-emerald-500 hover:underline ml-1">support@vitalkey.com</a></p>
            <p className="text-gray-600 flex items-center"><Plus className="h-5 w-5 mr-2 text-emerald-500" />Phone: +1 (123) 456-7890</p>
            <p className="text-gray-600 flex items-start"><Home className="h-5 w-5 mr-2 mt-1 text-emerald-500" />Address: 123 Healthway, Wellness City, VC 54321</p>
          </div>
        </div>
      </div>
    );
  };

  const SignUpModal = ({ onClose }) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [modalErrorMessage, setModalErrorMessage] = useState("");
    const [registrationSuccess, setRegistrationSuccess] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setModalErrorMessage("");

      if (!name || !email || !password || !confirmPassword) {
        setModalErrorMessage("All fields are required.");
        return;
      }
      if (password !== confirmPassword) {
        setModalErrorMessage("Passwords do not match.");
        return;
      }
      if (password.length < 6) {
        setModalErrorMessage("Password must be at least 6 characters long.");
        return;
      }

      try {
        await api.register(name, email, password, 'patient');
        setRegistrationSuccess(true);
        setTimeout(() => {
          setRegistrationSuccess(false);
          onClose();
        }, 1500);
      } catch (e) {
        setModalErrorMessage("Registration failed");
      }
    };

    return (
      <div className="fixed inset-0 bg-gray-800 bg-opacity-40 flex items-center justify-center z-50 p-4 animate-fadeIn">
        <div className="p-8 rounded-3xl shadow-2xl relative w-full max-w-md text-center" style={{ backgroundColor: '#E5F6DF' }}>
          <AppLogo />
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors">
            <X className="h-6 w-6" />
          </button>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Sign Up for doQtoR</h3>
          <p className="text-gray-600 mb-6">Create your secure account to manage your health records.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {modalErrorMessage && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {modalErrorMessage}</span>
              </div>
            )}
            {registrationSuccess && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Success!</strong>
                <span className="block sm:inline"> Registration successful!</span>
              </div>
            )}
            <div>
              <label htmlFor="signupName" className="block text-sm font-medium text-gray-700 mb-2 text-left">Full Name</label>
              <input type="text" id="signupName" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 bg-gray-100 rounded-lg text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors" placeholder="Your full name" required />
            </div>
            <div>
              <label htmlFor="signupEmail" className="block text-sm font-medium text-gray-700 mb-2 text-left">Email Address</label>
              <input type="email" id="signupEmail" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-gray-100 rounded-lg text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors" placeholder="your.email@example.com" required />
            </div>
            <div>
              <label htmlFor="signupPassword" className="block text-sm font-medium text-gray-700 mb-2 text-left">Password</label>
              <input type="password" id="signupPassword" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 bg-gray-100 rounded-lg text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors" placeholder="Enter your password" required />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2 text-left">Confirm Password</label>
              <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-3 bg-gray-100 rounded-lg text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors" placeholder="Confirm your password" required />
            </div>
            <button type="submit" className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center">
              <UserPlus className="h-5 w-5 mr-2" />
              Sign Up
            </button>
          </form>
          <p className="text-gray-500 text-sm mt-4">Already have an account? <a href="#" onClick={onClose} className="text-emerald-500 hover:underline">Login</a></p>
        </div>
      </div>
    );
  };

  const ContactUsViewWrapped = () => <ContactUsView />;

  const renderView = () => {
    switch (view) {
      case "landing":
        return <LandingView />;
      case "login":
        return <LoginView />;
      case "patientDashboard":
        return <PatientDashboard />;
      case "doctorDashboard":
        return <DoctorDashboard />;
      case "patientRecordsView":
        return <PatientRecordsView />;
      case "patientProfileView":
        return <PatientProfileView />;
      case "doctorPatientRecordsView":
        return <DoctorPatientRecordsView />;
      case "upload":
        return <UploadView />;
      case "qr":
        return <QrView />;
      case "log":
        return <LogView />;
      case "contact":
        return <ContactUsViewWrapped />;
      default:
        return <LandingView />;
    }
  };

  return (
    <Container>
      {renderView()}
      {showDocumentViewer && (
        <DocumentViewerModal documentUrl={currentDocumentUrl} onClose={closeDocumentViewer} />
      )}
      {showSignUpModal && (
        <SignUpModal onClose={() => setShowSignUpModal(false)} />
      )}
    </Container>
  );
};

export default App;