import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Search, Users, FileCheck, Clock, CheckCircle, ArrowLeft, Trash2, Edit } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { StudentProfileModal } from '../components/admin/StudentProfileModal';
import { EditRegistrationModal } from '../components/admin/EditRegistrationModal';
import { CreateStudentModal } from '../components/admin/CreateStudentModal';
import { CreateAdminModal } from '../components/admin/CreateAdminModal';
import { ChangeStudentPasswordModal } from '../components/admin/ChangeStudentPasswordModal';
import { supabase } from '../supabase/client';


export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, today: 0 });
  const [students, setStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'submissions' | 'registered' | 'accounts' | 'edit_requests'>('submissions');
  const [registeredStudents, setRegisteredStudents] = useState<any[]>([]);
  const [selectedFolderNumber, setSelectedFolderNumber] = useState<string | null>(null);
  const [editRegistrationApp, setEditRegistrationApp] = useState<string | null>(null);
  const [showCreateStudent, setShowCreateStudent] = useState(false);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [printMode, setPrintMode] = useState(false);
  const [modalViewMode, setModalViewMode] = useState<'registered' | 'full'>('full');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);

    const isConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!isConfigured) {
      setTimeout(() => {
        setStudents([
          { id: '1', application_number: 'DDMM/CS/001', student_name: 'John Doe', email: 'john@example.com', programme: 'B.E Computer Science and Engineering', status: 'submitted', created_at: new Date().toISOString() },
          { id: '2', application_number: 'DDMM/IT/002', student_name: 'Jane Smith', email: 'jane@example.com', programme: 'B.Tech Information Technology', status: 'draft', created_at: new Date().toISOString() }
        ]);
        setStats({ total: 2, completed: 1, pending: 1, today: 2 });
        setIsLoading(false);
      }, 500);
      return;
    }

    try {
      const { data: firstYearData } = await supabase.from('first_year_data').select('*');
      const { data: profiles } = await supabase.from('student_profiles').select('*');

      if (profiles) {
        setRegisteredStudents(profiles);
      }

      if (firstYearData) {
        setStudents(firstYearData);
        
        const completed = firstYearData.filter(s => s.status === 'submitted').length;
        const pending = firstYearData.filter(s => s.status === 'draft').length;
        const today = firstYearData.filter(s => {
          const date = new Date(s.created_at);
          const todayDate = new Date();
          return date.toDateString() === todayDate.toDateString();
        }).length;

        setStats({
          total: firstYearData.length,
          completed,
          pending,
          today
        });
      }
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (applicationNumber: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete the registration for Application No. ${applicationNumber}? This action cannot be undone.`)) {
      return;
    }

    try {
      await supabase.from('student_documents').delete().eq('application_number', applicationNumber);
      await supabase.from('first_year_data').delete().eq('application_number', applicationNumber);
      const { error } = await supabase.from('student_profiles').delete().eq('application_number', applicationNumber);
      
      if (error) throw error;
      
      showSuccess(`Record ${applicationNumber} deleted successfully`);
      fetchData();
    } catch (error) {
      console.error("Error deleting record:", error);
      alert("Failed to delete record. It might be linked to other data.");
    }
  };

  const handleApproveEditRequest = async (applicationNumber: string, studentName: string) => {
    try {
      const cleanName = studentName.split('| EDIT_REQUEST:')[0].trim();
      await supabase.from('first_year_data').update({ status: 'draft', student_name: cleanName }).eq('application_number', applicationNumber);
      showSuccess('Edit request approved');
      fetchData();
    } catch (e) {
      alert('Error approving request');
    }
  };

  const handleRejectEditRequest = async (applicationNumber: string, studentName: string) => {
    try {
      const cleanName = studentName.split('| EDIT_REQUEST:')[0].trim();
      await supabase.from('first_year_data').update({ student_name: cleanName }).eq('application_number', applicationNumber);
      showSuccess('Edit request rejected');
      fetchData();
    } catch (e) {
      alert('Error rejecting request');
    }
  };

  const [isExporting, setIsExporting] = useState(false);

  const generateExportData = async () => {
    setIsExporting(true);
    try {
      const { data: fydData } = await supabase.from('first_year_data').select('*');
      
      if (!fydData) return [];

      return fydData.map(fyd => {
        return {
          "Folder Number": fyd.application_number,
          "Status": fyd.status,
          "Registration Date": new Date(fyd.created_at).toLocaleString(),
          "Email": fyd.email,
          "Student Name": fyd.student_name,
          "Degree": fyd.programme,
          "Course": fyd.course,
          "Admission Category": fyd.admission_category,
          "Application Number": fyd.application_number,
          "Mobile Number": fyd.mobile_number,
          "Alternative Number": fyd.alternative_number,
          "Alternate Email": fyd.email_id,
          "Residence Type": fyd.residence_type,
          "Transport Mode": fyd.transport_mode,
          "Boarding Point": fyd.boarding_point,
          "Outside Stay Details": fyd.outside_stay_details,
          "Date of Birth": fyd.dob,
          "Gender": fyd.gender,
          "Gender (Other)": fyd.gender_other,
          "Blood Group": fyd.blood_group,
          "Mother Tongue": fyd.mother_tongue,
          "Aadhaar Number": fyd.aadhaar_number,
          "Field of Interest": fyd.field_of_interest,
          
          "Permanent Address": `${fyd.perm_address_line_1 || ''}, ${fyd.perm_address_line_2 || ''}, ${fyd.perm_village_city || ''}, ${fyd.perm_district || ''}, ${fyd.perm_state || ''} - ${fyd.perm_pincode || ''}`,
          "Communication Address": fyd.is_same_address === 'Yes' 
            ? 'Same as Permanent' 
            : `${fyd.comm_address_line_1 || ''}, ${fyd.comm_address_line_2 || ''}, ${fyd.comm_village_city || ''}, ${fyd.comm_district || ''}, ${fyd.comm_state || ''} - ${fyd.comm_pincode || ''}`,

          "Father's Name": fyd.father_name,
          "Father's Mobile": fyd.father_mobile,
          "Mother's Name": fyd.mother_name,
          "Mother's Mobile": fyd.mother_mobile,
          "Father's Occupation": fyd.father_occupation,
          "Mother's Occupation": fyd.mother_occupation,
          "Single Parent": fyd.single_parent,
          "Religion": fyd.religion,
          "Community": fyd.community,
          "Community (Other)": fyd.community_other,
          "Caste Name": fyd.caste_name,
          "Community Certificate No.": fyd.community_certificate_number,
          "Father Income": fyd.father_income,
          "Mother Income": fyd.mother_income,
          "Guardian Income": fyd.guardian_income,
          "Income Certificate No.": fyd.income_certificate_number,
          "First Graduate": fyd.first_graduate,
          "FG Certificate Number": fyd.first_graduate_certificate_number,
          "PMSS Scholarship": fyd.apply_pmss_scholarship,
          "BC/MBC Scholarship": fyd.apply_bc_mbc_scholarship,
          
          "EMIS Number": fyd.emis_number,

          "10th Board": fyd.tenth_board,
          "10th Medium": fyd.tenth_medium,
          "10th District": fyd.tenth_district,
          "10th Block": fyd.tenth_block,
          "10th School": fyd.tenth_school,
          "10th Total Mark": fyd.tenth_total_marks,
          "10th Lang Mark": fyd.tenth_lang_mark,
          "10th Eng Mark": fyd.tenth_eng_mark,
          "10th Maths Mark": fyd.tenth_math_mark,
          "10th Sci Mark": fyd.tenth_sci_mark,
          "10th Soc Mark": fyd.tenth_soc_mark,

          "12th Board": fyd.twelfth_board,
          "12th Medium": fyd.twelfth_medium,
          "12th District": fyd.twelfth_district,
          "12th Block": fyd.twelfth_block,
          "12th School": fyd.twelfth_school,
          "12th Total Mark": fyd.twelfth_total_marks,
          "12th Lang Mark": fyd.twelfth_lang_mark,
          "12th Eng Mark": fyd.twelfth_eng_mark,
          "12th Sub 1": fyd.twelfth_sub1_name,
          "12th Sub 1 Mark": fyd.twelfth_sub1_mark,
          "12th Sub 2": fyd.twelfth_sub2_name,
          "12th Sub 2 Mark": fyd.twelfth_sub2_mark,
          "12th Sub 3": fyd.twelfth_sub3_name,
          "12th Sub 3 Mark": fyd.twelfth_sub3_mark,
          "12th Sub 4": fyd.twelfth_sub4_name,
          "12th Sub 4 Mark": fyd.twelfth_sub4_mark,
          
          "Document Submission": fyd.date_of_document_submission,
          "Siblings Count": fyd.siblings_count || "0",
          "Sibling 1 Name": fyd.siblings?.[0]?.name || "",
          "Sibling 1 Education": fyd.siblings?.[0]?.education || "",
          "Sibling 1 Occupation": fyd.siblings?.[0]?.occupation || "",
          "Sibling 2 Name": fyd.siblings?.[1]?.name || "",
          "Sibling 2 Education": fyd.siblings?.[1]?.education || "",
          "Sibling 2 Occupation": fyd.siblings?.[1]?.occupation || "",
          "Sibling 3 Name": fyd.siblings?.[2]?.name || "",
          "Sibling 3 Education": fyd.siblings?.[2]?.education || "",
          "Sibling 3 Occupation": fyd.siblings?.[2]?.occupation || "",
          "Sibling 4 Name": fyd.siblings?.[3]?.name || "",
          "Sibling 4 Education": fyd.siblings?.[3]?.education || "",
          "Sibling 4 Occupation": fyd.siblings?.[3]?.occupation || "",
          "Sibling 5 Name": fyd.siblings?.[4]?.name || "",
          "Sibling 5 Education": fyd.siblings?.[4]?.education || "",
          "Sibling 5 Occupation": fyd.siblings?.[4]?.occupation || "",
          "Date of Doc Submission": fyd.date_of_document_submission
        };
      });
    } catch (err) {
      console.error("Error generating export data", err);
      alert("Failed to gather data for export.");
      return [];
    } finally {
      setIsExporting(false);
    }
  };

  const exportToExcel = async () => {
    const data = await generateExportData();
    if (data.length === 0) return;
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    XLSX.writeFile(workbook, "Student_Registrations.xlsx");
  };

  const exportToCSV = async () => {
    const data = await generateExportData();
    if (data.length === 0) return;
    const worksheet = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'Student_Registrations.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredStudents = students.filter(student => 
    student.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.application_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const regularSubmissions = filteredStudents.filter(s => !s.student_name?.includes('| EDIT_REQUEST:'));
  const editRequests = filteredStudents.filter(s => s.student_name?.includes('| EDIT_REQUEST:'));

  const filteredRegistered = registeredStudents.filter(student => 
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.application_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col w-full py-8">
      <div className="mb-4">
        <Button variant="ghost" onClick={() => navigate('/admin/login')} className="text-text-secondary hover:text-white -ml-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Sign Out
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-text-secondary">Overview of all student registrations and statistics.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="secondary" onClick={exportToCSV} isLoading={isExporting}>
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
          <Button onClick={exportToExcel} className="bg-green-600 hover:bg-green-700" isLoading={isExporting}>
            <Download className="w-4 h-4 mr-2" /> Export Excel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
        <Card className="flex flex-col items-center justify-center text-center p-6">
          <div className="w-12 h-12 bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center mb-3">
            <Users className="w-6 h-6" />
          </div>
          <p className="text-3xl font-bold">{stats.total}</p>
          <p className="text-sm text-text-secondary">Total Registrations</p>
        </Card>
        
        <Card className="flex flex-col items-center justify-center text-center p-6">
          <div className="w-12 h-12 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-3">
            <CheckCircle className="w-6 h-6" />
          </div>
          <p className="text-3xl font-bold">{stats.completed}</p>
          <p className="text-sm text-text-secondary">Completed Forms</p>
        </Card>

        <Card className="flex flex-col items-center justify-center text-center p-6">
          <div className="w-12 h-12 bg-yellow-500/20 text-yellow-500 rounded-full flex items-center justify-center mb-3">
            <Clock className="w-6 h-6" />
          </div>
          <p className="text-3xl font-bold">{stats.pending}</p>
          <p className="text-sm text-text-secondary">Pending Drafts</p>
        </Card>

        <Card className="flex flex-col items-center justify-center text-center p-6">
          <div className="w-12 h-12 bg-purple-500/20 text-purple-500 rounded-full flex items-center justify-center mb-3">
            <FileCheck className="w-6 h-6" />
          </div>
          <p className="text-3xl font-bold">{stats.today}</p>
          <p className="text-sm text-text-secondary">Today's Registrations</p>
        </Card>
      </div>
      <div className="flex space-x-2 mb-4">
        <Button 
          variant={activeTab === 'submissions' ? 'primary' : 'ghost'} 
          onClick={() => setActiveTab('submissions')}
          className={activeTab === 'submissions' ? '' : 'text-text-secondary hover:text-white'}
        >
          Form Submissions
        </Button>
        <Button 
          variant={activeTab === 'registered' ? 'primary' : 'ghost'} 
          onClick={() => setActiveTab('registered')}
          className={activeTab === 'registered' ? '' : 'text-text-secondary hover:text-white'}
        >
          Registered Profiles
        </Button>
        <Button 
          variant={activeTab === 'accounts' ? 'primary' : 'ghost'} 
          onClick={() => setActiveTab('accounts')}
          className={activeTab === 'accounts' ? '' : 'text-text-secondary hover:text-white'}
        >
          Account Management
        </Button>
        <Button 
          variant={activeTab === 'edit_requests' ? 'primary' : 'ghost'} 
          onClick={() => setActiveTab('edit_requests')}
          className={activeTab === 'edit_requests' ? '' : 'text-text-secondary hover:text-white'}
        >
          Edit Requests
          {editRequests.length > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {editRequests.length}
            </span>
          )}
        </Button>
      </div>

      <Card className="flex-1 min-h-[500px]">
        {activeTab === 'accounts' ? (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-6">Account Management</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 bg-white/5 border-white/10 hover:bg-white/10 transition-colors flex flex-col h-full">
                <h3 className="text-lg font-bold text-primary mb-2">Student Logins</h3>
                <p className="text-text-secondary text-sm mb-6">
                  Manually register a new student and generate their login credentials. They can then log in and complete the full admission form.
                </p>
                <Button 
                  onClick={() => setShowCreateStudent(true)}
                  className="w-full bg-primary hover:bg-primary-hover text-white mt-auto"
                >
                  Create Student Login
                </Button>
              </Card>

              <Card className="p-6 bg-white/5 border-white/10 hover:bg-white/10 transition-colors flex flex-col h-full">
                <h3 className="text-lg font-bold text-blue-400 mb-2">Administrator Profiles</h3>
                <p className="text-text-secondary text-sm mb-6">
                  Invite a new administrator to the dashboard. They will have full access to view, edit, and print student records.
                </p>
                <Button 
                  onClick={() => setShowCreateAdmin(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-auto"
                >
                  Create Admin Profile
                </Button>
              </Card>
              
              <Card className="p-6 bg-white/5 border-white/10 hover:bg-white/10 transition-colors flex flex-col h-full">
                <h3 className="text-lg font-bold text-red-400 mb-2">Change Password</h3>
                <p className="text-text-secondary text-sm mb-6">
                  Reset or change the password for an existing student account. You will need their Application Number.
                </p>
                <Button 
                  onClick={() => setShowChangePassword(true)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white mt-auto"
                >
                  Change Student Password
                </Button>
              </Card>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
              <div className="flex items-center">
                {successMessage && (
                  <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-lg flex items-center mb-4 md:mb-0 md:mr-4 border border-green-500/30">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {successMessage}
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold">{activeTab === 'submissions' ? 'Student Records' : activeTab === 'edit_requests' ? 'Edit Requests' : 'Registered Students'}</h2>
                  <p className="text-sm text-text-secondary">
                    {activeTab === 'submissions' ? `${regularSubmissions.length} records found` : activeTab === 'edit_requests' ? `${editRequests.length} requests pending` : `${filteredRegistered.length} profiles found`}
                  </p>
                </div>
              </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-3.5 w-4 h-4 text-text-secondary pointer-events-none" />
            <Input 
              label=""
              placeholder="Search by name, email, app no..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 mb-0"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-4 font-medium text-text-secondary">App No.</th>
                <th className="p-4 font-medium text-text-secondary">Name</th>
                <th className="p-4 font-medium text-text-secondary">Email</th>
                <th className="p-4 font-medium text-text-secondary">Date</th>
                {activeTab === 'submissions' && <th className="p-4 font-medium text-text-secondary">Degree</th>}
                {activeTab === 'registered' && <th className="p-4 font-medium text-text-secondary">Course</th>}
                {activeTab === 'submissions' && <th className="p-4 font-medium text-text-secondary">Status</th>}
                {activeTab === 'registered' && <th className="p-4 font-medium text-text-secondary">Mobile</th>}
                {activeTab === 'edit_requests' && <th className="p-4 font-medium text-text-secondary">Reason</th>}
                <th className="p-4 font-medium text-text-secondary text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-text-secondary">Loading records...</td>
                </tr>
              ) : activeTab === 'submissions' ? (
                regularSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-text-secondary">No records found.</td>
                  </tr>
                ) : (
                regularSubmissions.map((student) => (
                  <tr key={student.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 font-medium">{student.application_number || '-'}</td>
                    <td className="p-4">{student.student_name || 'N/A'}</td>
                    <td className="p-4 text-text-secondary">{student.email}</td>
                    <td className="p-4 text-text-secondary whitespace-nowrap">{student.created_at ? new Date(student.created_at).toLocaleDateString() : '-'}</td>
                    <td className="p-4">{student.programme || '-'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        student.status === 'submitted' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <Button 
                        variant="ghost" 
                        className="text-primary hover:text-white px-3 py-1 mr-2" 
                        onClick={() => { setSelectedFolderNumber(student.application_number); setModalViewMode('full'); setPrintMode(false); }}
                      >
                        View Form
                      </Button>
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 mr-2 h-8 text-sm" 
                        onClick={() => { setSelectedFolderNumber(student.application_number); setPrintMode(true); }}
                      >
                        Print
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10 px-2 py-1 mr-2" 
                        onClick={() => navigate(`/form/first-year-data?adminEditApp=${encodeURIComponent(student.application_number)}`)} 
                        title="Edit Record"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" className="text-red-500 hover:text-red-400 hover:bg-red-500/10 px-2 py-1" onClick={() => handleDelete(student.application_number)} title="Delete Record">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
                )
              ) : activeTab === 'edit_requests' ? (
                editRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-text-secondary">No edit requests pending.</td>
                  </tr>
                ) : (
                  editRequests.map((student) => (
                    <tr key={student.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4 font-medium">{student.application_number || '-'}</td>
                      <td className="p-4">{student.student_name ? student.student_name.split('| EDIT_REQUEST:')[0].trim() : 'N/A'}</td>
                      <td className="p-4 text-text-secondary">{student.email}</td>
                      <td className="p-4 text-text-secondary whitespace-nowrap">{student.created_at ? new Date(student.created_at).toLocaleDateString() : '-'}</td>
                      <td className="p-4 text-yellow-500 italic max-w-[200px] truncate" title={student.student_name ? student.student_name.split('| EDIT_REQUEST:')[1] : ''}>
                        "{student.student_name ? student.student_name.split('| EDIT_REQUEST:')[1] : ''}"
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <Button 
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 mr-2 h-8 text-sm" 
                          onClick={() => handleApproveEditRequest(student.application_number, student.student_name)}
                        >
                          Approve
                        </Button>
                        <Button 
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 mr-2 h-8 text-sm" 
                          onClick={() => handleRejectEditRequest(student.application_number, student.student_name)}
                        >
                          Reject
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="text-primary hover:text-white px-3 py-1" 
                          onClick={() => { setSelectedFolderNumber(student.application_number); setModalViewMode('full'); setPrintMode(false); }}
                        >
                          View Form
                        </Button>
                      </td>
                    </tr>
                  ))
                )
              ) : (
                filteredRegistered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-text-secondary">No registered profiles found.</td>
                  </tr>
                ) : (
                  filteredRegistered.map((student) => (
                    <tr key={student.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4 font-medium">{student.application_number || '-'}</td>
                      <td className="p-4">{student.name || 'N/A'}</td>
                      <td className="p-4 text-text-secondary">{student.email}</td>
                      <td className="p-4 text-text-secondary whitespace-nowrap">{student.created_at ? new Date(student.created_at).toLocaleDateString() : '-'}</td>
                      <td className="p-4">{student.course || '-'}</td>
                      <td className="p-4">{student.mobile_number || '-'}</td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <Button 
                          variant="ghost" 
                          className="text-primary hover:text-white px-3 py-1 mr-2" 
                          onClick={() => { setSelectedFolderNumber(student.application_number); setModalViewMode('registered'); setPrintMode(false); }}
                        >
                          View Profile
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10 px-2 py-1 mr-2" 
                          onClick={() => setEditRegistrationApp(student.application_number)} 
                          title="Edit Registration Details"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" className="text-red-500 hover:text-red-400 hover:bg-red-500/10 px-2 py-1" onClick={() => handleDelete(student.application_number)} title="Delete Record">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )
              )}
            </tbody>
          </table>
        </div>
        </>
        )}
      </Card>

      {selectedFolderNumber && (
        <StudentProfileModal 
          applicationNumber={selectedFolderNumber} 
          viewMode={modalViewMode}
          onClose={() => { setSelectedFolderNumber(null); setPrintMode(false); }} 
          startInPrintMode={printMode}
        />
      )}

      {editRegistrationApp && (
        <EditRegistrationModal
          applicationNumber={editRegistrationApp}
          onClose={() => setEditRegistrationApp(null)}
          onSave={() => {
            setEditRegistrationApp(null);
            fetchData();
          }}
        />
      )}

      {showCreateStudent && (
        <CreateStudentModal
          onClose={() => setShowCreateStudent(false)}
          onSuccess={() => {
            setShowCreateStudent(false);
            fetchData();
            showSuccess("Student login created successfully!");
          }}
        />
      )}

      {showCreateAdmin && (
        <CreateAdminModal
          onClose={() => setShowCreateAdmin(false)}
          onSuccess={() => {
            setShowCreateAdmin(false);
            showSuccess("Admin profile created successfully!");
          }}
        />
      )}

      {showChangePassword && (
        <ChangeStudentPasswordModal
          onClose={() => setShowChangePassword(false)}
          onSuccess={() => {
            setShowChangePassword(false);
            showSuccess("Student password changed successfully!");
          }}
        />
      )}

      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-500/90 text-white px-6 py-3 rounded-lg shadow-2xl z-[100] flex items-center gap-3 backdrop-blur-sm border border-green-400/20">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}
    </div>
  );
};
