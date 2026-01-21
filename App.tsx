
import React, { useState, useEffect } from 'react';
import { AppView, Service, FormField, Submission } from './types';
import { SERVICES } from './constants';
import Layout from './components/Layout';
import SignaturePad from './components/SignaturePad';
import Logo from './components/Logo';
import { generateDynamicForm, syncToGoogleSheets } from './services/geminiService';

const DEFAULT_SYNC_URL = "https://script.google.com/macros/s/AKfycbznk8elEgtGVFgLi8SIN9rcX31noEo-Xx2tVrPI8OYoUeqY504M3BY6aj2LcUT39r-g/exec";

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.WELCOME);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [signature, setSignature] = useState<string>('');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [webhookUrl, setWebhookUrl] = useState<string>(DEFAULT_SYNC_URL);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);

  useEffect(() => {
    const savedLogs = localStorage.getItem('cotrac_v4_store');
    const savedUrl = localStorage.getItem('cotrac_sync_url');
    if (savedLogs) {
      try { setSubmissions(JSON.parse(savedLogs)); } catch (e) { console.error("Storage error"); }
    }
    if (savedUrl) setWebhookUrl(savedUrl);
  }, []);

  const handleServiceSelect = async (service: Service) => {
    setSelectedService(service);
    setIsLoading(true);
    setView(AppView.INTAKE_FORM);
    const fields = await generateDynamicForm(service.name);
    setFormFields(fields);
    setIsLoading(false);
  };

  const handleInputChange = (id: string, value: string, type: string) => {
    const finalValue = type === 'email' ? value : value.toUpperCase();
    setFormData(prev => ({ ...prev, [id]: finalValue }));
  };

  const handleFinalSubmit = async () => {
    if (!selectedService || !signature || !agreedTerms) return;

    setIsSyncing(true);
    const newSubmission: Submission = {
      id: `COT-${Math.floor(Date.now() / 1000)}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      formData: { ...formData },
      signature,
      timestamp: new Date().toISOString()
    };

    try {
        await syncToGoogleSheets(newSubmission, webhookUrl);
        const updatedSubmissions = [newSubmission, ...submissions];
        setSubmissions(updatedSubmissions);
        localStorage.setItem('cotrac_v4_store', JSON.stringify(updatedSubmissions));
        setView(AppView.SUCCESS);
    } catch (err) {
        alert("Sync Error: Verify your Google Script URL and connectivity.");
    } finally {
        setIsSyncing(false);
    }
  };

  const resetFlow = () => {
    setSelectedService(null);
    setFormData({});
    setSignature('');
    setAgreedTerms(false);
    setView(AppView.WELCOME);
  };

  const vehicleKeywords = [
    'license_plate', 'unit_no', 'vehicle_make', 'sim_no', 'model', 
    'engine_no', 'vehicle_color', 'mileage', 'chassis_no', 
    'speed_limit', 'fuel_capacity', 'fuel_sensor'
  ];
  const customerFields = formFields.filter(f => !vehicleKeywords.includes(f.id));
  const vehicleFields = formFields.filter(f => vehicleKeywords.includes(f.id));

  const renderView = () => {
    switch (view) {
      case AppView.WELCOME:
        return (
          <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#f8fafc] relative overflow-hidden">
             <div className="relative z-10 flex flex-col items-center max-w-2xl w-full">
                <Logo className="mb-12 transform scale-110" />
                
                <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 w-full text-center relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-[#000080] text-white text-[9px] font-black uppercase tracking-[0.3em] rounded-full shadow-lg">Secure Terminal</div>
                    <h2 className="text-5xl font-black text-[#002e5d] mb-4 tracking-tighter uppercase italic">
                        Fleet <span className="text-[#f7941d]">Onboarding</span>
                    </h2>
                    <p className="text-slate-400 font-bold text-sm mb-12 uppercase tracking-wide">Enterprise Digital Installation Module</p>
                    
                    <button
                        onClick={() => setView(AppView.SERVICE_SELECTION)}
                        className="group w-full py-8 bg-[#000080] text-white rounded-2xl text-2xl font-black shadow-xl hover:shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4 relative overflow-hidden"
                    >
                        <span className="relative z-10">INITIALIZE SYSTEM</span>
                        <i className="fa-solid fa-chevron-right text-lg opacity-40 group-hover:translate-x-2 transition-transform"></i>
                    </button>
                    
                    <div className="mt-8 flex items-center justify-center gap-8 text-slate-200">
                        <i className="fa-solid fa-server"></i>
                        <i className="fa-solid fa-shield-halved"></i>
                        <i className="fa-solid fa-microchip"></i>
                    </div>
                </div>
             </div>
          </div>
        );

      case AppView.SERVICE_SELECTION:
        return (
          <div className="p-8 md:p-20 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 border-b border-slate-100 pb-12">
                <div>
                    <span className="text-[10px] font-black text-[#f7941d] uppercase tracking-[0.5em] mb-3 block">Step 01: Service Plan</span>
                    <h2 className="text-5xl font-black text-[#002e5d] tracking-tighter uppercase italic">Deployment Selection</h2>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {SERVICES.map((service) => (
                <button 
                  key={service.id} 
                  onClick={() => handleServiceSelect(service)} 
                  className="group relative p-12 bg-white border border-slate-100 rounded-[3rem] hover:border-[#000080] transition-all hover:shadow-2xl text-left flex flex-col h-full overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                      <i className={`fa-solid ${service.icon} text-9xl`}></i>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 group-hover:bg-[#000080] transition-all flex items-center justify-center mb-10 text-[#000080] group-hover:text-white shadow-sm">
                    <i className={`fa-solid ${service.icon} text-2xl`}></i>
                  </div>
                  <h3 className="text-3xl font-black text-[#002e5d] mb-4 uppercase leading-none">{service.name}</h3>
                  <p className="text-slate-400 text-xs font-bold leading-relaxed mb-12 flex-1">{service.description}</p>
                  
                  <div className="w-full py-4 bg-slate-50 group-hover:bg-[#f7941d] text-slate-400 group-hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl text-center transition-all border border-slate-100 group-hover:border-transparent">
                    Configure This Plan
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case AppView.INTAKE_FORM:
        return (
          <div className="p-8 md:p-20 max-w-5xl mx-auto">
            <div className="mb-20">
               <span className="text-[10px] font-black text-[#f7941d] uppercase tracking-[0.5em] mb-3 block">Step 02: Records</span>
               <div className="flex items-center gap-6">
                    <h2 className="text-5xl font-black text-[#002e5d] uppercase italic tracking-tighter">Installation Data</h2>
                    <div className="px-5 py-2 bg-[#000080] text-white text-[10px] font-black uppercase rounded-xl shadow-sm">{selectedService?.name}</div>
               </div>
            </div>

            {isLoading ? (
               <div className="flex flex-col items-center justify-center py-40">
                  <div className="w-24 h-24 border-[8px] border-slate-100 border-t-[#000080] rounded-full animate-spin"></div>
                  <h3 className="mt-12 text-xs font-black text-slate-300 uppercase tracking-[0.5em] animate-pulse">Initializing Protocol...</h3>
               </div>
            ) : (
               <form onSubmit={(e) => { e.preventDefault(); setView(AppView.SIGNATURE); }} className="space-y-12 pb-20">
                  <div className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-sm">
                    <div className="mb-10 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#000080] flex items-center justify-center font-black">A</div>
                        <h4 className="text-2xl font-black text-[#002e5d] uppercase italic tracking-tight">Personal Profile</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {customerFields.map((field) => (
                        <div key={field.id} className="space-y-2">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>
                            {field.type === 'select' ? (
                                <select required={field.required} value={formData[field.id] || ''} onChange={(e) => handleInputChange(field.id, e.target.value, field.type)} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-lg focus:bg-white focus:border-[#f7941d] outline-none shadow-sm transition-all">
                                    <option value="">-- SELECT --</option>
                                    {field.options?.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
                                </select>
                            ) : (
                                <input type={field.type} required={field.required} value={formData[field.id] || ''} onChange={(e) => handleInputChange(field.id, e.target.value, field.type)} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-lg focus:bg-white focus:border-[#f7941d] outline-none shadow-sm transition-all" placeholder={field.placeholder || field.label} />
                            )}
                        </div>
                        ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-sm">
                    <div className="mb-10 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#f7941d] flex items-center justify-center font-black">B</div>
                        <h4 className="text-2xl font-black text-[#002e5d] uppercase italic tracking-tight">Asset Specs</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {vehicleFields.map((field) => (
                        <div key={field.id} className="space-y-2">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>
                            {field.type === 'select' ? (
                                <select required={field.required} value={formData[field.id] || ''} onChange={(e) => handleInputChange(field.id, e.target.value, field.type)} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-lg focus:bg-white focus:border-[#f7941d] outline-none shadow-sm transition-all">
                                    <option value="">-- SELECT --</option>
                                    {field.options?.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
                                </select>
                            ) : (
                                <input type={field.type} required={field.required} value={formData[field.id] || ''} onChange={(e) => handleInputChange(field.id, e.target.value, field.type)} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-lg focus:bg-white focus:border-[#f7941d] outline-none shadow-sm transition-all" placeholder={field.placeholder || field.label} />
                            )}
                        </div>
                        ))}
                    </div>
                  </div>

                  <div className="pt-12 flex justify-center">
                      <button type="submit" className="px-32 py-8 bg-[#000080] text-white rounded-3xl text-xl font-black shadow-2xl hover:scale-105 active:scale-95 transition-all">
                         FINALIZE FOR SIGNATURE
                      </button>
                  </div>
               </form>
            )}
          </div>
        );

      case AppView.SIGNATURE:
        return (
          <div className="p-8 md:p-20 max-w-4xl mx-auto">
             <div className="text-center mb-16">
                <span className="text-[10px] font-black text-[#f7941d] uppercase tracking-[0.5em] mb-3 block">Step 03: Commitment</span>
                <h2 className="text-5xl font-black text-[#002e5d] tracking-tighter uppercase italic mb-3">Service Authorization</h2>
                <p className="text-slate-400 font-bold text-sm uppercase tracking-wider">Execute Digital Handshake</p>
             </div>
             
             <div className="space-y-10">
                 <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-[#000080]"></div>
                    <label className="flex items-start gap-8 cursor-pointer group">
                        <div className="mt-1">
                            <input type="checkbox" className="w-10 h-10 rounded-xl text-[#f7941d] focus:ring-0 cursor-pointer border-slate-200" checked={agreedTerms} onChange={(e) => setAgreedTerms(e.target.checked)} />
                        </div>
                        <div>
                            <span className="text-lg font-black text-[#002e5d] uppercase block mb-2">Service Validation for {selectedService?.name}</span>
                            <p className="text-xs text-slate-400 font-medium leading-relaxed uppercase tracking-tight">
                                I confirm the installation of <span className="text-[#002e5d] font-bold">{selectedService?.name}</span> hardware on this asset. I authorize the digital record creation in the Cotrac Cloud.
                            </p>
                        </div>
                    </label>
                 </div>

                 <div className="bg-slate-50 p-2 rounded-[3.5rem] border border-slate-200 shadow-inner">
                    <SignaturePad onSave={setSignature} />
                 </div>

                 <div className="flex flex-col items-center pt-8">
                    <button 
                        disabled={!signature || !agreedTerms || isSyncing} 
                        onClick={handleFinalSubmit} 
                        className={`group px-32 py-8 rounded-[2.5rem] text-3xl font-black shadow-2xl transition-all flex items-center gap-6 ${
                            signature && agreedTerms && !isSyncing ? 'bg-[#000080] text-white hover:scale-105' : 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'
                        }`}
                    >
                        {isSyncing ? (
                            <>
                                <i className="fa-solid fa-cloud-arrow-up animate-bounce"></i>
                                SYNCING {selectedService?.name}...
                            </>
                        ) : (
                            <>
                                <i className="fa-solid fa-link opacity-40"></i>
                                COMMIT TO CLOUD
                            </>
                        )}
                    </button>
                    <div className="mt-8 flex items-center gap-4 text-slate-300">
                        <i className="fa-solid fa-lock text-sm"></i>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">End-to-End Handshake Protocol</span>
                    </div>
                 </div>
             </div>
          </div>
        );

      case AppView.SUCCESS:
        return (
          <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-[#f8fafc] relative overflow-hidden">
            <div className="relative z-10 max-w-xl w-full">
                <div className="mb-12 relative inline-block">
                    <div className="w-56 h-56 bg-white rounded-[4rem] shadow-2xl flex items-center justify-center text-green-500 text-8xl border border-slate-100">
                        <i className="fa-solid fa-check"></i>
                    </div>
                    <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-[#f7941d] rounded-3xl flex items-center justify-center text-white text-3xl shadow-xl border-8 border-[#f8fafc]">
                        <i className="fa-solid fa-database"></i>
                    </div>
                </div>

                <h2 className="text-6xl font-black text-[#002e5d] mb-4 uppercase italic tracking-tighter">Transmission Live</h2>
                <div className="inline-flex items-center gap-3 px-6 py-2 bg-green-50 border border-green-100 text-green-600 rounded-full mb-12">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest">{selectedService?.name} Archived Successfully</span>
                </div>

                <p className="text-slate-400 font-bold text-lg leading-relaxed mb-16 uppercase tracking-tight">
                    Installation for <span className="text-[#002e5d]">{formData.full_name || 'CLIENT'}</span> has been committed.
                </p>

                <button onClick={resetFlow} className="w-full py-8 bg-[#000080] text-white rounded-3xl text-2xl font-black shadow-2xl hover:scale-105 active:scale-95 transition-all">
                    START NEXT SESSION
                </button>
            </div>
          </div>
        );

      case AppView.STAFF_DASHBOARD:
        return (
          <div className="p-8 md:p-16 max-w-[1400px] mx-auto w-full h-full flex flex-col">
            <div className="flex items-center justify-between mb-16">
                <div className="flex items-center gap-8">
                    <div className="w-16 h-16 bg-[#002e5d] text-white flex items-center justify-center rounded-[1.5rem] text-3xl shadow-xl">
                        <i className="fa-solid fa-gear"></i>
                    </div>
                    <div>
                        <h2 className="text-4xl font-black text-[#002e5d] uppercase italic tracking-tighter">Admin Terminal</h2>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Cloud Synchronization Gateway</p>
                    </div>
                </div>
                <button onClick={() => setView(AppView.WELCOME)} className="px-8 py-3 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white font-black text-[10px] uppercase transition-all rounded-xl border border-red-100">Exit Admin</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
                <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm col-span-1 flex flex-col justify-between">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-4">Total Records</p>
                    <p className="text-7xl font-black text-[#000080] tracking-tighter">{submissions.length}</p>
                </div>
                <div className="bg-[#002e5d] p-10 rounded-[2.5rem] shadow-2xl col-span-3 flex flex-col justify-center border-t-4 border-[#f7941d]">
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-[10px] text-white/50 font-black uppercase tracking-[0.4em] flex items-center gap-3">
                            <i className="fa-solid fa-cloud-bolt text-[#f7941d]"></i>
                            Google Apps Script Target (Link)
                        </p>
                        <span className={`text-[8px] font-black uppercase px-3 py-1 rounded-full ${webhookUrl !== DEFAULT_SYNC_URL ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                            {webhookUrl !== DEFAULT_SYNC_URL ? 'Active Link' : 'Default Target'}
                        </span>
                    </div>
                    <div className="flex gap-4">
                        <input 
                            type="text"
                            className="flex-1 text-sm p-5 bg-white/5 border border-white/10 rounded-2xl font-mono text-white/90 outline-none focus:border-white/30"
                            value={webhookUrl}
                            onChange={(e) => { 
                                setWebhookUrl(e.target.value); 
                                localStorage.setItem('cotrac_sync_url', e.target.value); 
                            }}
                            placeholder="https://script.google.com/macros/s/..."
                        />
                        <button 
                            onClick={() => alert("Settings Committed to Local Store.")}
                            className="px-8 bg-[#f7941d] text-white font-black text-[10px] uppercase rounded-2xl shadow-lg hover:scale-105 transition-all"
                        >
                            Commit URL
                        </button>
                    </div>
                    <p className="mt-4 text-[9px] text-white/30 font-bold uppercase tracking-widest">Verify deployment is configured for 'Anyone' access level on Google.</p>
                </div>
            </div>

            <div className="flex-1 bg-white border border-slate-100 rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col">
                <div className="bg-slate-50 border-b border-slate-100 px-12 py-6 flex justify-between items-center">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Submission Activity Log</h5>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left">
                      <thead className="bg-white sticky top-0 z-10 border-b border-slate-50">
                        <tr>
                          <th className="px-12 py-6 text-[10px] font-black text-slate-300 uppercase tracking-widest">Sync Time</th>
                          <th className="px-12 py-6 text-[10px] font-black text-slate-300 uppercase tracking-widest">Selected Plan</th>
                          <th className="px-12 py-6 text-[10px] font-black text-slate-300 uppercase tracking-widest">Client Identity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {submissions.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="py-32 text-center text-slate-200 font-black uppercase tracking-[0.8em] text-sm">Log Empty</td>
                            </tr>
                        ) : submissions.map((sub) => (
                          <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-12 py-8 text-xs font-bold text-slate-400">{new Date(sub.timestamp).toLocaleString()}</td>
                            <td className="px-12 py-8"><span className="bg-[#000080]/5 text-[#000080] text-[10px] font-black px-4 py-1.5 rounded-xl uppercase tracking-tighter border border-[#000080]/10">{sub.serviceName}</span></td>
                            <td className="px-12 py-8 font-black text-[#002e5d] uppercase italic text-lg tracking-tight">{sub.formData.full_name || "PROVISIONING..."}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                </div>
            </div>
          </div>
        );
    }
  };

  return (
    <Layout 
        currentView={view} 
        onStaffAccess={() => setView(AppView.STAFF_DASHBOARD)} 
        onReset={resetFlow} 
        isLinked={webhookUrl !== DEFAULT_SYNC_URL}
    >
      {renderView()}
    </Layout>
  );
};

export default App;
