import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Search, Users, FileCheck, Clock, CheckCircle, ArrowLeft, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { supabase } from '../supabase/client';
import { StudentProfileModal } from '../components/admin/StudentProfileModal';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, today: 0 });
  const [students, setStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFolderNumber, setSelectedFolderNumber] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);

    const isConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!isConfigured) {
      setTimeout(() => {
        setStudents([
          { id: '1', folder_number: 'DDMM/CS/001', student_name: 'John Doe', email: 'john@example.com', programme: 'B.E Computer Science and Engineering', status: 'submitted', created_at: new Date().toISOString() },
          { id: '2', folder_number: 'DDMM/IT/002', student_name: 'Jane Smith', email: 'jane@example.com', programme: 'B.Tech Information Technology', status: 'draft', created_at: new Date().toISOString() }
        ]);
        setStats({ total: 2, completed: 1, pending: 1, today: 2 });
        setIsLoading(false);
      }, 500);
      return;
    }

    try {
      const { data: basicDetails } = await supabase.from('student_basic_details').select('*');

      if (basicDetails) {
        setStudents(basicDetails);
        
        const completed = basicDetails.filter(s => s.status === 'submitted').length;
        const pending = basicDetails.filter(s => s.status === 'draft').length;
        const today = basicDetails.filter(s => {
          const date = new Date(s.created_at);
          const todayDate = new Date();
          return date.toDateString() === todayDate.toDateString();
        }).length;

        setStats({
          total: basicDetails.length,
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

  const handleDelete = async (folderNumber: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete the registration for Folder No. ${folderNumber}? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('student_basic_details')
        .delete()
        .eq('folder_number', folderNumber);

      if (error) {
        alert("Failed to delete record: " + error.message);
      } else {
        setStudents(prev => prev.filter(s => s.folder_number !== folderNumber));
        // Recalculate stats entirely to be safe
        fetchData();
        alert("Record deleted successfully.");
      }
    } catch (err) {
      alert("An unexpected error occurred while deleting.");
    }
  };

  const [isExporting, setIsExporting] = useState(false);

  const generateExportData = async () => {
    setIsExporting(true);
    try {
      const { data: basicData } = await supabase.from('student_basic_details').select('*');
      const { data: fydData } = await supabase.from('first_year_data').select('*');
      
      if (!basicData) return [];

      return basicData.map(basic => {
        const fyd = (fydData || []).find(f => f.folder_number === basic.folder_number) || {};
        
        // Exclude system fields for a cleaner export
        const { id: _id1, created_at: _ca1, updated_at: _ua1, status: _s1, ...cleanBasic } = basic;
        const { id: _id2, created_at: _ca2, updated_at: _ua2, status: _s2, folder_number: _fn, ...cleanFyd } = fyd;

        return {
          "Folder Number": basic.folder_number,
          "Status": basic.status,
          "Registration Date": new Date(basic.created_at).toLocaleString(),
          ...cleanBasic,
          ...cleanFyd
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
    student.folder_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

      <Card className="flex-1 min-h-[500px]">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
          <h2 className="text-xl font-bold">Student Records</h2>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-3.5 w-4 h-4 text-text-secondary pointer-events-none" />
            <Input 
              label=""
              placeholder="Search by name, email, folder..." 
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
                <th className="p-4 font-medium text-text-secondary">Folder No.</th>
                <th className="p-4 font-medium text-text-secondary">Student Name</th>
                <th className="p-4 font-medium text-text-secondary">Email</th>
                <th className="p-4 font-medium text-text-secondary">Programme</th>
                <th className="p-4 font-medium text-text-secondary">Status</th>
                <th className="p-4 font-medium text-text-secondary text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-text-secondary">Loading records...</td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-text-secondary">No records found.</td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 font-medium">{student.folder_number || '-'}</td>
                    <td className="p-4">{student.student_name || 'N/A'}</td>
                    <td className="p-4 text-text-secondary">{student.email}</td>
                    <td className="p-4">{student.programme || '-'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        student.status === 'submitted' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" className="text-primary hover:text-white px-3 py-1 mr-2" onClick={() => setSelectedFolderNumber(student.folder_number)}>View Profile</Button>
                      <Button variant="ghost" className="text-red-500 hover:text-red-400 hover:bg-red-500/10 px-2 py-1" onClick={() => handleDelete(student.folder_number)} title="Delete Record">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedFolderNumber && (
        <StudentProfileModal 
          folderNumber={selectedFolderNumber} 
          onClose={() => setSelectedFolderNumber(null)} 
        />
      )}
    </div>
  );
};
