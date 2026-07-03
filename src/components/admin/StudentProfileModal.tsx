import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { supabase } from '../../supabase/client';

interface StudentProfileModalProps {
  folderNumber: string;
  onClose: () => void;
}

export const StudentProfileModal = ({ folderNumber, onClose }: StudentProfileModalProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [basicData, setBasicData] = useState<any>(null);
  const [firstYearData, setFirstYearData] = useState<any>(null);
  const [documentsData, setDocumentsData] = useState<any[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      
      const isConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!isConfigured) {
        // Mock Data
        setTimeout(() => {
          setBasicData({
            folder_number: folderNumber,
            student_name: 'John Doe Mock',
            email: 'john@example.com',
            mobile_number: '9876543210',
            programme: 'B.E Computer Science and Engineering',
            course: 'B.E CSE',
            status: 'submitted',
            admission_category: 'Management Quota',
            dob: '2005-05-15',
            gender: 'Male'
          });
          setFirstYearData({
            blood_group: 'O+',
            mother_tongue: 'English',
            religion: 'Christian',
            community: 'BC'
          });
          setDocumentsData([]);
          setIsLoading(false);
        }, 500);
        return;
      }

      try {
        const { data: bData } = await supabase.from('student_basic_details').select('*').eq('folder_number', folderNumber).single();
        const { data: fData } = await supabase.from('first_year_data').select('*').eq('folder_number', folderNumber).single();
        const { data: dData } = await supabase.from('student_documents').select('*').eq('folder_number', folderNumber);
        
        setBasicData(bData);
        setFirstYearData(fData);
        setDocumentsData(dData || []);
      } catch (err) {
        console.error("Error fetching profile", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [folderNumber]);

  const Field = ({ label, value }: { label: string, value: string | undefined | null }) => (
    <div className="bg-white/5 p-3 rounded-lg border border-white/5">
      <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">{label}</p>
      <p className="font-medium text-white">{value || '-'}</p>
    </div>
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#111827] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
            <div>
              <h2 className="text-2xl font-bold">Student Profile</h2>
              <p className="text-text-secondary">Folder: <span className="font-mono text-white">{folderNumber}</span></p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64 text-text-secondary">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
                <p>Loading profile details...</p>
              </div>
            ) : !basicData ? (
              <div className="text-center p-8 text-text-secondary">
                No basic details found for this folder number.
              </div>
            ) : (
              <div className="space-y-6">
                {/* Form 1: Student Basic Details */}
                <div>
                  <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg mb-4">
                    <h3 className="text-xl font-bold text-primary">Form 1: Student Basic Details</h3>
                    <p className="text-sm text-text-secondary">Submitted on: {basicData.created_at ? new Date(basicData.created_at).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-2">
                    <Field label="Folder Number" value={basicData.folder_number} />
                    <Field label="Application Number" value={basicData.application_number} />
                    <Field label="Student Name" value={basicData.student_name} />
                    <Field label="Primary Email" value={basicData.email} />
                    <Field label="Alternate Email" value={basicData.email_id} />
                    <Field label="Mobile Number" value={basicData.mobile_number} />
                    <Field label="Date of Birth" value={basicData.dob} />
                    <Field label="Gender" value={basicData.gender === 'Other' ? basicData.gender_other : basicData.gender} />
                    <Field label="Aadhaar Number" value={basicData.aadhaar_number} />
                    <Field label="Community" value={basicData.community === 'Other' ? basicData.community_other : basicData.community} />
                    <Field label="Admission Category" value={basicData.admission_category} />
                    <Field label="Programme" value={basicData.programme} />
                    <Field label="Course" value={basicData.course} />
                    <Field label="Father/Guardian Name" value={basicData.father_name} />
                    <Field label="Father Mobile" value={basicData.father_mobile} />
                    <Field label="Date of Document Submission" value={basicData.date_of_document_submission} />
                  </div>
                </div>

                {/* Form 2: First Year Data */}
                <div className="pt-6 border-t border-white/10">
                  <div className="bg-accent/10 border border-accent/20 p-4 rounded-lg mb-4">
                    <h3 className="text-xl font-bold text-accent">Form 2: First Year Data 2026-27</h3>
                    <p className="text-sm text-text-secondary">
                      {firstYearData 
                        ? `Status: ${firstYearData.status === 'submitted' ? 'Submitted' : 'Draft'}` 
                        : 'Not Started'}
                    </p>
                  </div>
                  
                  {firstYearData ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-2">
                      <Field label="Alternative Mobile" value={firstYearData.alternative_number} />
                      <Field label="Blood Group" value={firstYearData.blood_group} />
                      <Field label="Mother Tongue" value={firstYearData.mother_tongue} />
                      <Field label="Mother Name" value={firstYearData.mother_name} />
                      <Field label="Mother Mobile" value={firstYearData.mother_mobile} />
                      <Field label="Parents Occupation" value={firstYearData.parents_occupation} />
                      <Field label="Single Parent" value={firstYearData.single_parent} />
                      <Field label="Religion" value={firstYearData.religion} />
                      <Field label="Caste Name" value={firstYearData.caste_name} />
                      <Field label="Community Certificate No." value={firstYearData.community_certificate_number} />
                      <Field label="Annual Income" value={firstYearData.annual_income} />
                      <Field label="Income Certificate No." value={firstYearData.income_certificate_number} />
                      <Field label="First Graduate" value={firstYearData.first_graduate} />
                      <Field label="First Graduate Cert. No." value={firstYearData.first_graduate_certificate_number} />
                      <Field label="EMIS Number" value={firstYearData.emis_number} />
                    </div>
                  ) : (
                    <div className="text-center p-6 text-text-secondary bg-white/5 rounded-lg border border-white/5">
                      Student has not started Form 2 yet.
                    </div>
                  )}
                </div>

                {/* Form 3: Documents */}
                <div className="pt-6 border-t border-white/10">
                  <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-lg mb-4">
                    <h3 className="text-xl font-bold text-purple-400">Form 3: Document Uploads</h3>
                    <p className="text-sm text-text-secondary">
                      {documentsData.length > 0 
                        ? `${documentsData.length} documents uploaded` 
                        : 'No documents uploaded yet'}
                    </p>
                  </div>
                  
                  {documentsData.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-2">
                      {documentsData.map(doc => (
                        <div key={doc.id} className="bg-white/5 p-3 rounded-lg border border-white/5 flex flex-col justify-center">
                          <p className="text-xs text-text-secondary uppercase tracking-wider mb-1 truncate">{doc.document_name}</p>
                          <a href={doc.file_url} target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline truncate">View Document</a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-6 text-text-secondary bg-white/5 rounded-lg border border-white/5">
                      Student has not uploaded any documents.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
