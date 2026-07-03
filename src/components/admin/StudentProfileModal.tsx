import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Printer } from 'lucide-react';
import { supabase } from '../../supabase/client';
import { PrintableReport } from './PrintableReport';

interface StudentProfileModalProps {
  folderNumber: string;
  onClose: () => void;
  startInPrintMode?: boolean;
}

export const StudentProfileModal = ({ folderNumber, onClose, startInPrintMode }: StudentProfileModalProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [firstYearData, setFirstYearData] = useState<any>(null);
  const [documentsData, setDocumentsData] = useState<any[]>([]);
  const [isPrinting, setIsPrinting] = useState(!!startInPrintMode);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      
      const isConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!isConfigured) {
        // Mock Data
        setTimeout(() => {
          setFirstYearData({
            folder_number: folderNumber,
            student_name: 'John Doe Mock',
            email: 'john@example.com',
            mobile_number: '9876543210',
            programme: 'B.E Computer Science and Engineering',
            course: 'B.E CSE',
            status: 'submitted',
            admission_category: 'Management Quota',
            dob: '2005-05-15',
            gender: 'Male',
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
        const { data: fData } = await supabase.from('first_year_data').select('*').eq('folder_number', folderNumber).single();
        const { data: dData } = await supabase.from('student_documents').select('*').eq('folder_number', folderNumber);
        
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

  const handleShowReport = () => {
    setIsPrinting(true);
  };

  const handleActualPrint = () => {
    window.print();
  };

  const Field = ({ label, value }: { label: string, value: string | undefined | null }) => (
    <div className="bg-white/5 p-3 rounded-lg border border-white/5">
      <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">{label}</p>
      <p className="font-medium text-white">{value || '-'}</p>
    </div>
  );

  if (isPrinting) {
    return (
      <div className="fixed inset-0 z-[100] bg-white overflow-auto print:static print:bg-transparent print:overflow-visible flex flex-col">
        {/* Floating Header for Report View (Hidden when actually printing) */}
        <div className="sticky top-0 bg-gray-100 border-b border-gray-300 p-4 flex items-center justify-between shadow-sm z-50 print:hidden text-black">
          <div>
            <h2 className="text-lg font-bold">Report Preview</h2>
            <p className="text-sm text-gray-600">Review the report before printing</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setIsPrinting(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Back to Profile
            </button>
            <button
              onClick={handleActualPrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Print Now
            </button>
          </div>
        </div>
        
        {/* The actual printable report */}
        <div className="flex-1">
          <PrintableReport basicData={firstYearData} firstYearData={firstYearData} documentsData={documentsData} />
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 print:hidden">
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
            <div className="flex items-center gap-3">
              {!isLoading && firstYearData && (
                <button
                  onClick={handleShowReport}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <Printer className="w-4 h-4" />
                  Print Report
                </button>
              )}
              <button 
                onClick={onClose}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64 text-text-secondary">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
                <p>Loading profile details...</p>
              </div>
            ) : !firstYearData ? (
              <div className="text-center p-8 text-text-secondary">
                No profile details found for this folder number.
              </div>
            ) : (
              <div className="space-y-6">
                {/* Form: First Year Data */}
                <div>
                  <div className="bg-accent/10 border border-accent/20 p-4 rounded-lg mb-4">
                    <h3 className="text-xl font-bold text-accent">Student Profile (First Year Data 2026-27)</h3>
                    <p className="text-sm text-text-secondary">
                      {`Status: ${firstYearData.status === 'submitted' ? 'Submitted' : 'Draft'}`}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-2">
                    <Field label="Folder Number" value={firstYearData.folder_number} />
                    <Field label="Application Number" value={firstYearData.application_number} />
                    <Field label="Student Name" value={firstYearData.student_name} />
                    <Field label="Primary Email" value={firstYearData.email} />
                    <Field label="Alternate Email" value={firstYearData.email_id} />
                    <Field label="Mobile Number" value={firstYearData.mobile_number} />
                    <Field label="Date of Birth" value={firstYearData.dob} />
                    <Field label="Gender" value={firstYearData.gender === 'Other' ? firstYearData.gender_other : firstYearData.gender} />
                    <Field label="Aadhaar Number" value={firstYearData.aadhaar_number} />
                    <Field label="Community" value={firstYearData.community === 'Other' ? firstYearData.community_other : firstYearData.community} />
                    <Field label="Admission Category" value={firstYearData.admission_category} />
                    <Field label="Programme" value={firstYearData.programme} />
                    <Field label="Course" value={firstYearData.course} />
                    <Field label="Father/Guardian Name" value={firstYearData.father_name} />
                    <Field label="Father Mobile" value={firstYearData.father_mobile} />
                    <Field label="Date of Document Submission" value={firstYearData.date_of_document_submission} />
                  </div>
                </div>

                {/* Form 2: Additional Details */}
                <div className="pt-6 border-t border-white/10">
                  <div className="bg-accent/10 border border-accent/20 p-4 rounded-lg mb-4">
                    <h3 className="text-xl font-bold text-accent">Additional Details</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-2">
                    <Field label="Alternative Mobile" value={firstYearData.alternative_number} />
                    <Field label="Blood Group" value={firstYearData.blood_group} />
                    <Field label="Mother Tongue" value={firstYearData.mother_tongue} />
                    <Field label="Mother Name" value={firstYearData.mother_name} />
                    <Field label="Mother Mobile" value={firstYearData.mother_mobile} />
                    <Field label="Father's Occupation" value={firstYearData.father_occupation} />
                    <Field label="Mother's Occupation" value={firstYearData.mother_occupation} />
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
