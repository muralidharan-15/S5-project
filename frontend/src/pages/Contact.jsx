import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscribeAlert } from '../api/floodApi';

const Contact = ({ district = 'Virudhunagar' }) => {
  const navigate = useNavigate();

  // Subscription Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    district: district,
    channel: 'SMS',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submittedMsg, setSubmittedMsg] = useState('');

  const emergencyContacts = [
    {
      name: 'National Disaster Helpline',
      number: '108',
      tel: '108',
      icon: 'health_and_safety',
      iconBg: 'bg-red-50 text-red-600',
    },
    {
      name: 'Police Emergency Response',
      number: '100',
      tel: '100',
      icon: 'local_police',
      iconBg: 'bg-blue-50 text-primary',
    },
    {
      name: 'State Disaster Control Room',
      number: '1070',
      tel: '1070',
      icon: 'emergency',
      iconBg: 'bg-red-50 text-red-600',
    },
    {
      name: 'District Disaster Management',
      number: '1077',
      tel: '1077',
      icon: 'domain',
      iconBg: 'bg-amber-50 text-amber-600',
    },
    {
      name: 'Fire & Rescue Services',
      number: '101',
      tel: '101',
      icon: 'fire_truck',
      iconBg: 'bg-red-50 text-red-600',
    },
  ];

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmittedMsg('');
    try {
      const res = await subscribeAlert(formData);
      setSubmittedMsg(res.message || 'Alert subscription successfully registered!');
      setFormData({ name: '', phone: '', email: '', district, channel: 'SMS' });
    } catch (err) {
      setSubmittedMsg('Failed to subscribe. Please verify your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-container-padding-mobile md:px-container-padding-desktop py-stack-md flex flex-col items-center pb-32 animate-fadeIn">
      <div className="w-full md:max-w-2xl flex flex-col gap-stack-md">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-600 active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="text-center">
            <h1 className="text-xl font-bold text-primary">Emergency SOS Contacts</h1>
            <p className="text-xs text-slate-500">Reach Help Immediately</p>
          </div>
          <div className="w-9" />
        </div>

        {/* Urgent Red-Tint Banner */}
        <div className="bg-red-50 border border-red-200/80 p-4 rounded-xl flex items-center gap-3 shadow-xs">
          <span className="material-symbols-outlined text-[#DC2626] text-2xl">info</span>
          <p className="text-xs font-bold text-red-800">
            Emergency Hotlines: Tap any red button below to dial immediately.
          </p>
        </div>

        {/* Hotlines List */}
        <div className="flex flex-col gap-3">
          {emergencyContacts.map((c) => (
            <div
              key={c.number}
              className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-card flex items-center justify-between hover:border-primary transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${c.iconBg}`}>
                  <span className="material-symbols-outlined text-2xl">{c.icon}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-500">{c.name}</span>
                  <span className="text-2xl font-bold text-[#0F172A] tracking-tight">{c.number}</span>
                </div>
              </div>

              <a
                href={`tel:${c.tel}`}
                className="w-12 h-12 rounded-full bg-[#DC2626] text-white flex items-center justify-center shadow-md active:scale-95 hover:bg-red-700 transition-all shrink-0 cursor-pointer"
                title={`Call ${c.number}`}
              >
                <span className="material-symbols-outlined filled text-xl">call</span>
              </a>
            </div>
          ))}
        </div>

        {/* Citizen Broadcast Alert Subscription Form */}
        <div className="mt-4 bg-white border border-[#E2E8F0] rounded-card p-6 shadow-card flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">notifications_active</span>
            <h3 className="text-base font-bold text-[#0F172A]">
              Register for Automated Flood Alerts
            </h3>
          </div>
          <p className="text-xs text-slate-500 font-normal">
            Receive direct SMS, WhatsApp, or Email flood risk alerts and reservoir spillway warnings.
          </p>

          {submittedMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold">
              {submittedMsg}
            </div>
          )}

          <form onSubmit={handleSubscribe} className="space-y-3.5">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Muralidharan"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                Preferred Channel
              </label>
              <div className="flex items-center gap-4">
                {['SMS', 'WhatsApp', 'Email'].map((channel) => (
                  <label key={channel} className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="channel"
                      value={channel}
                      checked={formData.channel === channel}
                      onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                      className="text-primary"
                    />
                    <span>{channel}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-primary hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Registering...' : 'Subscribe to Emergency Alerts'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
