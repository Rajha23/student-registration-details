

interface PrintableReportProps {
  basicData: any;
  firstYearData: any;
  documentsData: any[];
}

export const PrintableReport = ({ basicData, firstYearData, documentsData }: PrintableReportProps) => {
  const getDocUrl = (type: string) => {
    return documentsData.find(d => d.document_type === type)?.file_url;
  };

  const studentPhoto = getDocUrl('photo');
  const fatherPhoto = getDocUrl('father_photo');
  const motherPhoto = getDocUrl('mother_photo');

  return (
    <div className="bg-white text-black p-8 max-w-4xl mx-auto w-full min-h-screen font-sans">
      {/* Header */}
      <div className="text-center border-b-2 border-black pb-4 mb-6">
        <h1 className="text-3xl font-bold uppercase mb-2">Student Registration Report</h1>
        <p className="text-gray-800 text-lg">Folder Number: <strong>{basicData?.folder_number}</strong></p>
      </div>

      {/* Photos Section */}
      <div className="flex justify-end gap-6 mb-8">
        <div className="flex flex-col items-center">
          <div className="w-28 h-36 border-2 border-gray-400 flex items-center justify-center bg-gray-100 overflow-hidden">
            {studentPhoto ? <img src={studentPhoto} alt="Student" className="w-full h-full object-cover" /> : <span className="text-xs text-gray-400">Student</span>}
          </div>
          <span className="text-sm font-bold mt-2">Student</span>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="w-28 h-36 border-2 border-gray-400 flex items-center justify-center bg-gray-100 overflow-hidden">
            {fatherPhoto ? <img src={fatherPhoto} alt="Father" className="w-full h-full object-cover" /> : <span className="text-xs text-gray-400">Father</span>}
          </div>
          <span className="text-sm font-bold mt-2">Father</span>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-28 h-36 border-2 border-gray-400 flex items-center justify-center bg-gray-100 overflow-hidden">
            {motherPhoto ? <img src={motherPhoto} alt="Mother" className="w-full h-full object-cover" /> : <span className="text-xs text-gray-400">Mother</span>}
          </div>
          <span className="text-sm font-bold mt-2">Mother</span>
        </div>
      </div>

      {/* Basic Data Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold bg-gray-200 p-2 mb-4 uppercase">Basic Details</h2>
        <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-base">
          <div><strong className="text-gray-700">Student Name:</strong> {basicData?.student_name}</div>
          <div><strong className="text-gray-700">Application Number:</strong> {basicData?.application_number}</div>
          <div><strong className="text-gray-700">DOB:</strong> {basicData?.dob}</div>
          <div><strong className="text-gray-700">Gender:</strong> {basicData?.gender}</div>
          <div><strong className="text-gray-700">Aadhaar:</strong> {basicData?.aadhaar_number}</div>
          <div><strong className="text-gray-700">Mobile:</strong> {basicData?.mobile_number}</div>
          <div className="col-span-2"><strong className="text-gray-700">Email:</strong> {basicData?.email}</div>
          <div><strong className="text-gray-700">Programme:</strong> {basicData?.programme}</div>
          <div><strong className="text-gray-700">Course:</strong> {basicData?.course}</div>
          <div><strong className="text-gray-700">Admission Category:</strong> {basicData?.admission_category}</div>
          <div><strong className="text-gray-700">Community:</strong> {basicData?.community}</div>
        </div>
      </div>

      {/* First Year Data Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold bg-gray-200 p-2 mb-4 uppercase">Family & Background Information</h2>
        <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-base">
          <div><strong className="text-gray-700">Father Name:</strong> {basicData?.father_name}</div>
          <div><strong className="text-gray-700">Father Mobile:</strong> {basicData?.father_mobile}</div>
          <div className="col-span-2"><strong className="text-gray-700">Father Occupation:</strong> {firstYearData?.father_occupation || '-'}</div>
          
          <div className="mt-2"><strong className="text-gray-700">Mother Name:</strong> {firstYearData?.mother_name || '-'}</div>
          <div className="mt-2"><strong className="text-gray-700">Mother Mobile:</strong> {firstYearData?.mother_mobile || '-'}</div>
          <div className="col-span-2"><strong className="text-gray-700">Mother Occupation:</strong> {firstYearData?.mother_occupation || '-'}</div>

          <div className="mt-2"><strong className="text-gray-700">Single Parent:</strong> {firstYearData?.single_parent || '-'}</div>
          <div className="mt-2"><strong className="text-gray-700">Religion:</strong> {firstYearData?.religion || '-'}</div>
          <div><strong className="text-gray-700">Caste:</strong> {firstYearData?.caste_name || '-'}</div>
          <div><strong className="text-gray-700">Community Cert No:</strong> {firstYearData?.community_certificate_number || '-'}</div>
          
          <div><strong className="text-gray-700">Annual Income:</strong> {firstYearData?.annual_income || '-'}</div>
          <div><strong className="text-gray-700">Income Cert No:</strong> {firstYearData?.income_certificate_number || '-'}</div>
          
          <div><strong className="text-gray-700">First Graduate:</strong> {firstYearData?.first_graduate || '-'}</div>
          <div><strong className="text-gray-700">First Grad Cert No:</strong> {firstYearData?.first_graduate_certificate_number || '-'}</div>
          
          <div><strong className="text-gray-700">EMIS Number:</strong> {firstYearData?.emis_number || '-'}</div>
          <div><strong className="text-gray-700">Blood Group:</strong> {firstYearData?.blood_group || '-'}</div>
          <div><strong className="text-gray-700">Mother Tongue:</strong> {firstYearData?.mother_tongue || '-'}</div>
        </div>
      </div>

      <div className="mt-16 text-center text-sm text-gray-500 border-t border-gray-300 pt-4">
        This is a system-generated official report. Printed on {new Date().toLocaleString()}
      </div>
    </div>
  );
};
