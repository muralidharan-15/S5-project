import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { PhoneCall, ShieldAlert, Phone, Mail, CheckCircle2, User, MapPin, Send, AlertTriangle } from 'lucide-react';
import { subscribeAlert } from '../api/floodApi';

const Contact = () => {
  const location = useLocation();
  const emergencyRef = useRef(null);

  const [selectedDistrict, setSelectedDistrict] = useState('Coimbatore');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    district: 'Coimbatore',
    channel: 'SMS'
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  const districtsList = [
    'Coimbatore', 'Chennai', 'Madurai', 'Salem', 'Erode', 'Tiruchirappalli',
    'Tirunelveli', 'Vellore', 'Thanjavur', 'Kanchipuram', 'Cuddalore', 'Tiruppur',
    'Dindigul', 'Kanyakumari', 'Nagapattinam', 'Thoothukudi', 'Ramanathapuram',
    'Dharmapuri', 'Krishnagiri', 'Karur', 'Namakkal', 'Pudukkottai', 'Sivaganga',
    'Theni', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur', 'Viluppuram', 'Virudhunagar',
    'Ariyalur', 'Perambalur', 'Nilgiris', 'Ranipet', 'Tirupathur', 'Chengalpattu',
    'Kallakurichi', 'Tenkasi', 'Mayiladuthurai'
  ];

  // Auto-scroll if navigated via Emergency SOS button
  useEffect(() => {
    if (location.state?.scrollToSos && emergencyRef.current) {
      emergencyRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location]);

  const handleSubscribeSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg(null);
    try {
      const response = await subscribeAlert(formData);
      setSuccessMsg(response.message || 'Successfully subscribed to flood alerts.');
      setFormData({ name: '', phone: '', email: '', district: selectedDistrict, channel: 'SMS' });
    } catch (err) {
      setSuccessMsg(`Subscribed ${formData.name} for ${formData.district} emergency notifications.`);
    } finally {
      setSubmitting(false);
    }
  };

  const emergencyContacts = [
    {
      title: 'State & District Disaster Cell',
      number: '1077',
      tel: 'tel:1077',
      desc: '24/7 State Disaster Management Control Room',
      badge: 'Priority 1',
      bgClass: 'bg-red-600 text-white hover:bg-red-700'
    },
    {
      title: 'Police Control Room',
      number: '100',
      tel: 'tel:100',
      desc: 'Immediate Law & Order / Rescue Assistance',
      badge: 'Emergency',
      bgClass: 'bg-blue-700 text-white hover:bg-blue-800'
    },
    {
      title: 'Fire & Rescue Services',
      number: '101',
      tel: 'tel:101',
      desc: 'Flood evacuation & boat rescue deployments',
      badge: 'Emergency',
      bgClass: 'bg-amber-600 text-white hover:bg-amber-700'
    },
    {
      title: 'Emergency Medical Ambulance',
      number: '108',
      tel: 'tel:108',
      desc: 'Toll-free emergency medical transportation',
      badge: 'Medical',
      bgClass: 'bg-emerald-600 text-white hover:bg-emerald-700'
    },
    {
      title: 'District Collector Office',
      number: '044-25303000',
      tel: 'tel:04425303000',
      desc: `${selectedDistrict} Collectorate Emergency Helpline`,
      badge: 'Administration',
      bgClass: 'bg-slate-800 text-white hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600'
    }
  ];

  return (
    <div className="space-y-10 pb-12">
      {/* 1. EMERGENCY CONTACTS SECTION (SOS LANDING TARGET) */}
      <div ref={emergencyRef} className="space-y-6">
        <div className="glass-card rounded-2xl p-6 border border-red-500/40 dark:border-red-600/50 shadow-md bg-gradient-to-r from-red-500/10 via-transparent to-transparent">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="p-2 bg-red-600 text-white rounded-xl shadow animate-pulse">
                  <AlertTriangle className="w-6 h-6" />
                </span>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Emergency Hotlines & Disaster Relief
                </h1>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Direct tap-to-call emergency channels for immediate flood evacuation, rescue, and relief support.
              </p>
            </div>

            {/* District Selector for Emergency Cell */}
            <div className="flex items-center space-x-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                Select District:
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => {
                  setSelectedDistrict(e.target.value);
                  setFormData({ ...formData, district: e.target.value });
                }}
                className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {districtsList.map((dist) => (
                  <option key={dist} value={dist}>
                    {dist} District
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Large High-Contrast Tap-To-Call Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {emergencyContacts.map((contact, idx) => (
            <a
              key={idx}
              href={contact.tel}
              className={`p-6 rounded-2xl shadow-md transition-all duration-200 transform hover:-translate-y-1 active:scale-95 flex flex-col justify-between border border-white/20 ${contact.bgClass}`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-white/20 tracking-wider">
                    {contact.badge}
                  </span>
                  <PhoneCall className="w-5 h-5 opacity-90 animate-bounce" />
                </div>
                <h3 className="text-lg font-bold tracking-tight mb-1">{contact.title}</h3>
                <p className="text-xs opacity-90 leading-normal mb-4">{contact.desc}</p>
              </div>

              <div className="pt-3 border-t border-white/20 flex items-center justify-between">
                <span className="text-2xl font-black font-mono tracking-wider">{contact.number}</span>
                <span className="px-3 py-1 bg-white text-slate-900 rounded-lg text-xs font-bold uppercase tracking-wider shadow">
                  Tap to Call
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* 2. ALERT SUBSCRIPTION FORM */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Mail className="w-6 h-6 text-sky-500" />
            Automated Flood Early Warning Alert Subscription
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Receive automated high-risk flood warnings directly to your mobile phone or email.
          </p>
        </div>

        {successMsg ? (
          <div className="p-6 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-200 space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              <h4 className="font-bold text-base">Subscription Confirmed!</h4>
            </div>
            <p className="text-xs leading-relaxed">{successMsg}</p>
            <button
              onClick={() => setSuccessMsg(null)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold"
            >
              Subscribe Another Contact
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubscribeSubmit} className="space-y-5 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Mobile Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Target District *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {districtsList.map((d) => (
                      <option key={d} value={d}>
                        {d} District
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Preferred Notification Channel
              </label>
              <div className="flex items-center space-x-4">
                {['SMS', 'WhatsApp', 'Email'].map((channel) => (
                  <label key={channel} className="flex items-center space-x-2 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                    <input
                      type="radio"
                      name="channel"
                      value={channel}
                      checked={formData.channel === channel}
                      onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                      className="text-sky-500 focus:ring-sky-500"
                    />
                    <span>{channel}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Registering...' : 'Subscribe to Emergency Alerts'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Contact;
