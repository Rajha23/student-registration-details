import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Printer, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase/client';
import { PrintableReport } from './PrintableReport';

interface StudentProfileModalProps {
  applicationNumber: string;
  onClose: () => void;
  startInPrintMode?: boolean;
  viewMode?: 'registered' | 'full';
}

export const StudentProfileModal = ({ applicationNumber, onClose, startInPrintMode = false, viewMode: initialViewMode = 'full' }: StudentProfileModalProps) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [firstYearData, setFirstYearData] = useState<any>(null);
  const [documentsData, setDocumentsData] = useState<any[]>([]);
  const [isPrinting, setIsPrinting] = useState(startInPrintMode);
  const [viewMode, setViewMode] = useState(initialViewMode);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      
      const isConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!isConfigured) {
        // Mock Data
        setTimeout(() => {
          setFirstYearData({
            application_number: applicationNumber,
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
        const { data: fData } = await supabase.from('first_year_data').select('*').eq('application_number', applicationNumber).maybeSingle();
        const { data: dData } = await supabase.from('student_documents').select('*').eq('application_number', applicationNumber);
        
        if (fData) {
          setFirstYearData(fData);
        } else {
          // Fallback to student_profiles if form hasn't been started
          const { data: profileData } = await supabase.from('student_profiles').select('*').eq('application_number', applicationNumber).maybeSingle();
          if (profileData) {
            setFirstYearData({
              application_number: profileData.application_number,
              student_name: profileData.name,
              email: profileData.email,
              mobile_number: profileData.mobile_number,
              programme: profileData.course,
              course: profileData.department,
              status: 'Draft (Not Started)'
            });
          }
        }
        
        setDocumentsData(dData || []);
      } catch (err) {
        console.error("Error fetching profile", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [applicationNumber]);

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
              <p className="text-text-secondary">Application Number: <span className="font-mono text-white">{applicationNumber}</span></p>
            </div>
            <div className="flex items-center gap-3">
              {!isLoading && firstYearData && viewMode === 'registered' && (
                <button
                  onClick={() => setViewMode('full')}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                >
                  View Form
                </button>
              )}
              {!isLoading && firstYearData && viewMode === 'full' && (
                <>
                  <button
                    onClick={() => navigate(`/form/first-year-data?adminEditApp=${encodeURIComponent(applicationNumber)}`)}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Data
                  </button>
                  <button
                    onClick={handleShowReport}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <Printer className="w-4 h-4" />
                    Print Report
                  </button>
                </>
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
                No profile details found for this application number.
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
                    <Field label="Application Number" value={firstYearData.application_number} />
                    <Field label="Student Name" value={firstYearData.student_name} />
                    <Field label="Primary Email" value={firstYearData.email} />
                    <Field label="Mobile Number" value={firstYearData.mobile_number} />
                    <Field label="Degree" value={firstYearData.programme} />
                    <Field label="Course/Department" value={firstYearData.course} />
                    
                    {viewMode === 'full' && (
                      <>
                        <Field label="Alternate Email" value={firstYearData.email_id} />
                        <Field label="Alternative Number" value={firstYearData.alternative_number} />
                    
                        <h3 className="col-span-2 text-lg font-medium text-white border-b border-white/10 pb-2 mt-4">Address Details</h3>
                        <div className="col-span-2 md:col-span-1">
                          <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">Permanent Address</p>
                          <p className="font-medium text-white bg-white/5 p-3 rounded-lg border border-white/5 whitespace-pre-wrap">
                            {firstYearData.perm_address_line_1}
                            {firstYearData.perm_address_line_2 && `\n${firstYearData.perm_address_line_2}`}
                            {`\n${firstYearData.perm_village_city}`}
                            {`\n${firstYearData.perm_district}`}
                            {`\n${firstYearData.perm_state} - ${firstYearData.perm_pincode}`}
                          </p>
                        </div>
                        <div className="col-span-2 md:col-span-1">
                          <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">Communication Address</p>
                          <p className="font-medium text-white bg-white/5 p-3 rounded-lg border border-white/5 whitespace-pre-wrap">
                            {firstYearData.is_same_address === 'Yes' ? 'Same as Permanent Address' : (
                              <>
                                {firstYearData.comm_address_line_1}
                                {firstYearData.comm_address_line_2 && `\n${firstYearData.comm_address_line_2}`}
                                {`\n${firstYearData.comm_village_city}`}
                                {`\n${firstYearData.comm_district}`}
                                {`\n${firstYearData.comm_state} - ${firstYearData.comm_pincode}`}
                              </>
                            )}
                          </p>
                        </div>

                        <h3 className="col-span-2 text-lg font-medium text-white border-b border-white/10 pb-2 mt-4">Residence Type</h3>
                        <Field label="Residence Type" value={firstYearData.residence_type} />
                        {firstYearData.residence_type === 'Dayscholar' && (
                          <>
                            <Field label="Transport Mode" value={firstYearData.transport_mode} />
                            {firstYearData.transport_mode === 'College Bus' && (
                              <Field label="Boarding Point" value={firstYearData.boarding_point} />
                            )}
                          </>
                        )}
                        {firstYearData.residence_type === 'Outside Stay' && (
                          <Field label="Outside Stay Details" value={firstYearData.outside_stay_details} />
                        )}
                        <Field label="Date of Birth" value={firstYearData.dob} />
                        <Field label="Community" value={firstYearData.community === 'Other' ? firstYearData.community_other : firstYearData.community} />
                        <Field label="Admission Category" value={firstYearData.admission_category} />
                        <Field label="Degree" value={firstYearData.programme} />
                        <Field label="Course" value={firstYearData.course} />
                        <Field label="Application/Allotment No." value={firstYearData.application_number} />
                        
                        <h3 className="col-span-2 text-lg font-medium text-white border-b border-white/10 pb-2 mt-4">Family & Income Details</h3>
                        <Field label="Religion" value={firstYearData.religion} />
                        <Field label="Caste Name" value={firstYearData.caste_name} />
                        {firstYearData.community !== 'OC' && (
                          <Field label="Community Certificate No." value={firstYearData.community_certificate_number} />
                        )}
                        <Field label="Father's Income" value={firstYearData.father_income} />
                        <Field label="Date of Document Submission" value={firstYearData.date_of_document_submission} />
                      </>
                    )}
                  </div>
                </div>

                {viewMode === 'full' && (
                  <>
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
                        <Field label="Father Name" value={firstYearData.father_name} />
                        <Field label="Father Mobile" value={firstYearData.father_mobile} />
                        <Field label="Father's Occupation" value={firstYearData.father_occupation} />
                        <Field label="Mother's Occupation" value={firstYearData.mother_occupation} />
                        <Field label="Single Parent" value={firstYearData.single_parent} />
                        <Field label="Number of Siblings" value={firstYearData.siblings_count || '0'} />
                        {firstYearData.siblings && firstYearData.siblings.length > 0 && (
                          <div className="md:col-span-2 space-y-3 my-2">
                            {firstYearData.siblings.map((sibling: any, idx: number) => (
                              <div key={idx} className="bg-white/5 p-4 rounded-lg border border-white/5">
                                <h4 className="text-primary font-medium text-sm mb-3">Sibling {idx + 1}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <Field label="Name" value={sibling.name} />
                                  <Field label="Education" value={sibling.education} />
                                  <Field label="Occupation" value={sibling.occupation} />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        <Field label="Religion" value={firstYearData.religion} />
                        <Field label="Caste Name" value={firstYearData.caste_name} />
                        {firstYearData.community !== 'OC' && (
                          <Field label="Community Certificate No." value={firstYearData.community_certificate_number} />
                        )}
                        <Field label="Father's Income" value={firstYearData.father_income} />
                        <Field label="Mother's Income" value={firstYearData.mother_income} />
                        <Field label="Guardian's Income" value={firstYearData.guardian_income} />
                        <Field label="Income Certificate No." value={firstYearData.income_certificate_number} />
                        <Field label="First Graduate" value={firstYearData.first_graduate} />
                        <Field label="First Graduate Cert. No." value={firstYearData.first_graduate_certificate_number} />
                        <Field label="PMSS Scholarship" value={firstYearData.apply_pmss_scholarship} />
                        <Field label="BC/MBC Scholarship" value={firstYearData.apply_bc_mbc_scholarship} />
                        <Field label="EMIS Number" value={firstYearData.emis_number} />
                        <Field label="Document Submission Date" value={firstYearData.date_of_document_submission} />
                      </div>
                      
                      <div className="mt-8">
                        <h3 className="text-lg font-medium text-white border-b border-white/10 pb-2 mb-4">10th Standard Details</h3>
                        <div className="grid md:grid-cols-2 gap-4 gap-y-6">
                          <Field label="State" value={firstYearData.tenth_state} />
                          <Field label="Board of Education" value={firstYearData.tenth_board} />
                          <Field label="Medium of Instruction" value={firstYearData.tenth_medium} />
                          <Field label="District" value={firstYearData.tenth_district} />
                          {firstYearData.tenth_state === 'Tamil Nadu' && <Field label="Block" value={firstYearData.tenth_block} />}
                          <div className="col-span-2">
                            <Field label="School" value={firstYearData.tenth_school} />
                          </div>
                          <div className="col-span-2 bg-white/5 p-4 rounded-lg">
                            <h4 className="text-sm font-medium text-text-secondary mb-3">10th Marks (Out of 100 per subject)</h4>
                            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                              <Field label="Language" value={firstYearData.tenth_lang_mark} />
                              <Field label="English" value={firstYearData.tenth_eng_mark} />
                              <Field label="Maths" value={firstYearData.tenth_math_mark} />
                              <Field label="Science" value={firstYearData.tenth_sci_mark} />
                              <Field label="Social" value={firstYearData.tenth_soc_mark} />
                              <Field label="Total Mark" value={firstYearData.tenth_total_marks} />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8">
                        <h3 className="text-lg font-medium text-white border-b border-white/10 pb-2 mb-4">12th Standard Details</h3>
                        <div className="grid md:grid-cols-2 gap-4 gap-y-6">
                          <Field label="State" value={firstYearData.twelfth_state} />
                          <Field label="Board of Education" value={firstYearData.twelfth_board} />
                          <Field label="Medium of Instruction" value={firstYearData.twelfth_medium} />
                          <Field label="District" value={firstYearData.twelfth_district} />
                          {firstYearData.twelfth_state === 'Tamil Nadu' && <Field label="Block" value={firstYearData.twelfth_block} />}
                          <div className="col-span-2">
                            <Field label="School" value={firstYearData.twelfth_school} />
                          </div>
                          <div className="col-span-2 bg-white/5 p-4 rounded-lg">
                            <h4 className="text-sm font-medium text-text-secondary mb-3">12th Marks (Out of 100 per subject)</h4>
                            {firstYearData.twelfth_board === 'ICSE' ? (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 border-b border-white/10 pb-4">
                                  <Field label="Total Mark" value={firstYearData.twelfth_total_marks} />
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  {(() => {
                                    try {
                                      const subjects = JSON.parse(firstYearData.twelfth_sub1_name || '[]');
                                      return subjects.map((sub: any, i: number) => (
                                        <Field key={i} label={sub.name || `Subject ${i+1}`} value={sub.mark} />
                                      ));
                                    } catch (e) {
                                      return <div className="text-red-400">Error parsing ICSE subjects</div>;
                                    }
                                  })()}
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="grid grid-cols-3 gap-4 mb-4">
                                  {firstYearData.twelfth_board !== 'CBSE' && (
                                    <Field label="Language" value={firstYearData.twelfth_lang_mark} />
                                  )}
                                  <Field label="English" value={firstYearData.twelfth_eng_mark} />
                                  <Field label="Total Mark" value={firstYearData.twelfth_total_marks} />
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <Field label={firstYearData.twelfth_sub1_name || "Subject 1"} value={firstYearData.twelfth_sub1_mark} />
                                  <Field label={firstYearData.twelfth_sub2_name || "Subject 2"} value={firstYearData.twelfth_sub2_mark} />
                                  <Field label={firstYearData.twelfth_sub3_name || "Subject 3"} value={firstYearData.twelfth_sub3_mark} />
                                  <Field label={firstYearData.twelfth_sub4_name || "Subject 4"} value={firstYearData.twelfth_sub4_mark} />
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>


                  </>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
