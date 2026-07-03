import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, ArrowRight, CheckCircle, ArrowLeft } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { supabase } from '../supabase/client';

export const StudentDashboard = () => {
  const navigate = useNavigate();
  const [folderNumber, setFolderNumber] = useState<string | null>(null);
  const [form1Status, setForm1Status] = useState<'Not Started' | 'Pending' | 'Completed'>('Not Started');
  const [form2Status, setForm2Status] = useState<'Not Started' | 'Pending' | 'Completed'>('Not Started');
  const [form3Status, setForm3Status] = useState<'Not Started' | 'Pending' | 'Completed'>('Not Started');

  useEffect(() => {
    const fn = localStorage.getItem('student_folder_number');
    if (!fn) {
      navigate('/access');
      return;
    }
    setFolderNumber(fn);

    const checkStatus = async () => {
      const isConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;
      if (!isConfigured) return; // In mock mode, we just leave them as Not Started for visual demo

      try {
        const { data: bData } = await supabase.from('student_basic_details').select('status').eq('folder_number', fn).single();
        if (bData) setForm1Status(bData.status === 'submitted' ? 'Completed' : 'Pending');

        const { data: fData } = await supabase.from('first_year_data').select('status').eq('folder_number', fn).single();
        if (fData) setForm2Status(fData.status === 'submitted' ? 'Completed' : 'Pending');

        const { count } = await supabase.from('student_documents').select('*', { count: 'exact', head: true }).eq('folder_number', fn);
        if (count && count >= 7) {
          // Assuming 7 mandatory docs
          setForm3Status('Completed');
        } else if (count && count > 0) {
          setForm3Status('Pending');
        }
      } catch (err) {
        console.error("Error fetching status", err);
      }
    };
    checkStatus();
  }, [navigate]);

  if (!folderNumber) return null;

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
          Welcome back! You are viewing the registration profile for Folder: <span className="text-white font-mono bg-white/10 px-2 py-1 rounded">{folderNumber}</span>
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Form 1 Card */}
        <Card className="flex flex-col">
          <div className="flex items-start justify-between mb-6">
            <div className="w-12 h-12 bg-primary/20 text-primary rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
              form1Status === 'Completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
              form1Status === 'Pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
              'bg-white/5 text-text-secondary border-white/10'
            }`}>
              {form1Status === 'Completed' ? <CheckCircle className="w-3.5 h-3.5" /> : form1Status === 'Pending' ? <Clock className="w-3.5 h-3.5" /> : null} 
              {form1Status}
            </div>
          </div>
          
          <h3 className="text-xl font-bold mb-2">Student Basic Details</h3>
          <p className="text-sm text-text-secondary mb-8 flex-1">
            Required module. Fill out your basic academic and personal information to initiate your college registration profile.
          </p>
          
          <Button onClick={() => navigate('/form/basic-details')} className="w-full group">
            {form1Status === 'Completed' ? 'Edit Form' : 'Start Form'}
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Card>

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
            Detailed module for first-year students including family, community, and income details. Requires Form 1 completion.
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
              form3Status === 'Pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
              'bg-white/5 text-text-secondary border-white/10'
            }`}>
              {form3Status === 'Completed' ? <CheckCircle className="w-3.5 h-3.5" /> : form3Status === 'Pending' ? <Clock className="w-3.5 h-3.5" /> : null} 
              {form3Status}
            </div>
          </div>
          
          <h3 className="text-xl font-bold mb-2">Document Uploads</h3>
          <p className="text-sm text-text-secondary mb-8 flex-1">
            Upload mandatory certificates (10th, 12th, TC, Community, etc.) as PDFs or Images (Max 5MB).
          </p>
          
          <Button onClick={() => navigate('/form/documents')} className="w-full group">
            {form3Status === 'Completed' ? 'Edit Uploads' : 'Start Uploads'}
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Card>
      </div>
    </div>
  );
};
