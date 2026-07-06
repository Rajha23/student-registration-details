import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, ArrowRight, CheckCircle, ArrowLeft, ExternalLink } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { supabase } from '../supabase/client';

export const StudentDashboard = () => {
  const navigate = useNavigate();
  const [applicationNumber, setApplicationNumber] = useState<string | null>(null);
  const [form2Status, setForm2Status] = useState<'Not Started' | 'Pending' | 'Completed'>('Not Started');
  const [form3Status, setForm3Status] = useState<'Not Started' | 'Completed'>('Not Started');
  
  // Google Form link for document submission
  const GOOGLE_FORM_LINK = "https://docs.google.com/forms/d/1L0dCgwQah6IM5ajiKxJ5ya3iLQGvrein3K_ZLnBNDQg/viewform?ts=6a4b5ea4&edit_requested=true";

  useEffect(() => {
    const fn = localStorage.getItem('student_application_number');
    if (!fn) {
      navigate('/access');
      return;
    }
    setApplicationNumber(fn);

    const checkStatus = async () => {
      const isConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;
      if (!isConfigured) return; // In mock mode, we just leave them as Not Started for visual demo

      try {
        const { data: fData } = await supabase.from('first_year_data').select('status').eq('application_number', fn).single();
        if (fData) setForm2Status(fData.status === 'submitted' ? 'Completed' : 'Pending');

        const docsSubmitted = localStorage.getItem(`docs_submitted_${fn}`);
        if (docsSubmitted === 'true') {
          setForm3Status('Completed');
        }
      } catch (err) {
        console.error("Error fetching status", err);
      }
    };
    checkStatus();
  }, [navigate]);

  if (!applicationNumber) return null;

  return (
    <div className="flex flex-col max-w-6xl mx-auto py-8">
      <div className="mb-4">
        <Button variant="ghost" onClick={() => navigate('/access')} className="text-text-secondary hover:text-white -ml-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Exit Dashboard
        </Button>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-3xl font-bold mb-2">Student Dashboard</h1>
        <p className="text-text-secondary">
          Welcome back! You are viewing the registration profile for Application Number: <span className="text-white font-mono bg-white/10 px-2 py-1 rounded">{applicationNumber}</span>
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Form 2 Card */}
        <Card className="flex flex-col">
          <div className="flex items-start justify-between mb-6">
            <div className="w-12 h-12 bg-accent/20 text-accent rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
              form2Status === 'Completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
              form2Status === 'Pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
              'bg-white/5 text-text-secondary border-white/10'
            }`}>
              {form2Status === 'Completed' ? <CheckCircle className="w-3.5 h-3.5" /> : form2Status === 'Pending' ? <Clock className="w-3.5 h-3.5" /> : null} 
              {form2Status}
            </div>
          </div>
          
          <h3 className="text-xl font-bold mb-2">First Year Data 2026-27</h3>
          <p className="text-sm text-text-secondary mb-8 flex-1">
            Required module for first-year students including personal, family, community, and income details.
          </p>
          
          <Button onClick={() => navigate('/form/first-year-data')} className="w-full group">
            {form2Status === 'Completed' ? 'Edit Form' : 'Start Form'}
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Card>

        {/* Form 3 Card */}
        <Card className="flex flex-col">
          <div className="flex items-start justify-between mb-6">
            <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
              form3Status === 'Completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
              'bg-white/5 text-text-secondary border-white/10'
            }`}>
              {form3Status === 'Completed' ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />} 
              {form3Status}
            </div>
          </div>
          
          <h3 className="text-xl font-bold mb-2">Document Uploads</h3>
          <p className="text-sm text-text-secondary mb-4 flex-1">
            Please submit all your mandatory certificates (10th, 12th, TC, Community, etc.) through our official Google Form.
          </p>
          
          <Button 
            onClick={() => window.open(GOOGLE_FORM_LINK, '_blank')} 
            className="w-full bg-purple-600 hover:bg-purple-700 text-white mb-6 group"
          >
            Open Google Form
            <ExternalLink className="w-4 h-4 ml-2 group-hover:scale-110 transition-transform" />
          </Button>

          <div className="mt-auto pt-4 border-t border-white/10">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 appearance-none border-2 border-white/20 rounded-md checked:bg-green-500 checked:border-green-500 transition-colors peer"
                  checked={form3Status === 'Completed'}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setForm3Status(checked ? 'Completed' : 'Not Started');
                    localStorage.setItem(`docs_submitted_${applicationNumber}`, checked ? 'true' : 'false');
                  }}
                />
                <CheckCircle className="w-3.5 h-3.5 absolute text-black opacity-0 peer-checked:opacity-100 transition-opacity" />
              </div>
              <span className="text-sm text-text-secondary group-hover:text-white transition-colors">
                I confirm I have uploaded my documents via the Google Form
              </span>
            </label>
          </div>
        </Card>
      </div>
    </div>
  );
};
