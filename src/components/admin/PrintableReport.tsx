

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
        <p className="text-gray-800 text-lg">Application Number: <strong>{basicData?.application_number}</strong></p>
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
          <div><strong className="text-gray-700">Field of Interest:</strong> {firstYearData?.field_of_interest || '-'}</div>
          <div><strong className="text-gray-700">Mobile:</strong> {basicData?.mobile_number}</div>
          <div className="col-span-2"><strong className="text-gray-700">Email:</strong> {basicData?.email}</div>
          
          <div className="col-span-2 mt-2">
            <strong className="text-gray-700 block mb-1 border-b border-gray-300 pb-1">Permanent Address:</strong>
            <p className="whitespace-pre-wrap text-sm mt-1">
              {firstYearData?.perm_address_line_1}
              {firstYearData?.perm_address_line_2 && `\n${firstYearData?.perm_address_line_2}`}
              {`\n${firstYearData?.perm_village_city}`}
              {`\n${firstYearData?.perm_district}`}
              {`\n${firstYearData?.perm_state} - ${firstYearData?.perm_pincode}`}
            </p>
          </div>

          <div className="col-span-2 mt-2 mb-2">
            <strong className="text-gray-700 block mb-1 border-b border-gray-300 pb-1">Communication Address:</strong>
            <p className="whitespace-pre-wrap text-sm mt-1">
              {firstYearData?.is_same_address === 'Yes' ? 'Same as Permanent Address' : (
                <>
                  {firstYearData?.comm_address_line_1}
                  {firstYearData?.comm_address_line_2 && `\n${firstYearData?.comm_address_line_2}`}
                  {`\n${firstYearData?.comm_village_city}`}
                  {`\n${firstYearData?.comm_district}`}
                  {`\n${firstYearData?.comm_state} - ${firstYearData?.comm_pincode}`}
                </>
              )}
            </p>
          </div>

          <div><strong className="text-gray-700">Residence Type:</strong> {firstYearData?.residence_type || '-'}</div>
          
          {firstYearData?.residence_type === 'Dayscholar' && (
            <>
              <div><strong className="text-gray-700">Transport:</strong> {firstYearData?.transport_mode || '-'}</div>
              {firstYearData?.transport_mode === 'College Bus' && (
                <div><strong className="text-gray-700">Boarding Pt:</strong> {firstYearData?.boarding_point || '-'}</div>
              )}
            </>
          )}

          {firstYearData?.residence_type === 'Outside Stay' && (
            <div className="col-span-2"><strong className="text-gray-700">Outside Stay Details:</strong> {firstYearData?.outside_stay_details || '-'}</div>
          )}
          
          <div><strong className="text-gray-700">Degree:</strong> {basicData?.programme}</div>
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
          
          <div className="col-span-2 mt-4">
            <h3 className="font-bold border-b border-gray-300 pb-1 mb-2">Siblings Details ({firstYearData?.siblings_count || '0'})</h3>
            {firstYearData?.siblings && firstYearData.siblings.length > 0 ? (
              <div className="space-y-2 mt-2">
                {firstYearData.siblings.map((sibling: any, idx: number) => (
                  <div key={idx} className="grid grid-cols-3 gap-4 bg-gray-50 p-2 rounded text-sm">
                    <div><strong className="text-gray-700">Name:</strong> {sibling.name}</div>
                    <div><strong className="text-gray-700">Education:</strong> {sibling.education}</div>
                    <div><strong className="text-gray-700">Occupation:</strong> {sibling.occupation}</div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="mt-4"><strong className="text-gray-700">Religion:</strong> {firstYearData?.religion || '-'}</div>
          <div><strong className="text-gray-700">Caste:</strong> {firstYearData?.caste_name || '-'}</div>
          {firstYearData?.community !== 'OC' && (
            <div><strong className="text-gray-700">Community Cert No:</strong> {firstYearData?.community_certificate_number || '-'}</div>
          )}
          
          <div><strong className="text-gray-700">Father Income:</strong> {firstYearData?.father_income || '-'}</div>
          <div><strong className="text-gray-700">Mother Income:</strong> {firstYearData?.mother_income || '-'}</div>
          <div><strong className="text-gray-700">Guardian Income:</strong> {firstYearData?.guardian_income || '-'}</div>
          <div><strong className="text-gray-700">Income Cert No:</strong> {firstYearData?.income_certificate_number || '-'}</div>
          
          <div className="col-span-2 space-y-4 my-4">
            <div className="border border-gray-300 rounded overflow-hidden">
              <div className="bg-gray-100 px-4 py-2 font-bold border-b border-gray-300">10th Standard Details</div>
              <div className="p-4 grid grid-cols-3 gap-4 text-sm">
                <div><strong className="text-gray-700">Board:</strong> {firstYearData?.tenth_board || '-'}</div>
                <div><strong className="text-gray-700">Medium:</strong> {firstYearData?.tenth_medium || '-'}</div>
                <div><strong className="text-gray-700">District:</strong> {firstYearData?.tenth_district || '-'}</div>
                <div><strong className="text-gray-700">Block:</strong> {firstYearData?.tenth_block || '-'}</div>
                <div className="col-span-2"><strong className="text-gray-700">School:</strong> {firstYearData?.tenth_school || '-'}</div>
                
                <div className="col-span-3 mt-2">
                  <strong className="text-gray-700 block mb-2 border-b border-gray-300 pb-1">10th Marks (Out of 100)</strong>
                  <div className="grid grid-cols-6 gap-2">
                    <div><strong className="text-gray-600 block text-xs">Language</strong>{firstYearData?.tenth_lang_mark || '-'}</div>
                    <div><strong className="text-gray-600 block text-xs">English</strong>{firstYearData?.tenth_eng_mark || '-'}</div>
                    <div><strong className="text-gray-600 block text-xs">Maths</strong>{firstYearData?.tenth_math_mark || '-'}</div>
                    <div><strong className="text-gray-600 block text-xs">Science</strong>{firstYearData?.tenth_sci_mark || '-'}</div>
                    <div><strong className="text-gray-600 block text-xs">Social</strong>{firstYearData?.tenth_soc_mark || '-'}</div>
                    <div><strong className="text-gray-800 block text-xs">Total</strong>{firstYearData?.tenth_total_marks || '-'}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-gray-300 rounded overflow-hidden">
              <div className="bg-gray-100 px-4 py-2 font-bold border-b border-gray-300">12th Standard Details</div>
              <div className="p-4 grid grid-cols-3 gap-4 text-sm">
                <div><strong className="text-gray-700">EMIS Number:</strong> {firstYearData?.emis_number || '-'}</div>
                <div><strong className="text-gray-700">Board:</strong> {firstYearData?.twelfth_board || '-'}</div>
                <div><strong className="text-gray-700">Medium:</strong> {firstYearData?.twelfth_medium || '-'}</div>
                <div><strong className="text-gray-700">District:</strong> {firstYearData?.twelfth_district || '-'}</div>
                <div><strong className="text-gray-700">Block:</strong> {firstYearData?.twelfth_block || '-'}</div>
                <div className="col-span-3"><strong className="text-gray-700">School:</strong> {firstYearData?.twelfth_school || '-'}</div>

                <div className="col-span-3 mt-2">
                  <strong className="text-gray-700 block mb-2 border-b border-gray-300 pb-1">12th Marks (Out of 100)</strong>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <div><strong className="text-gray-600 block text-xs">Language</strong>{firstYearData?.twelfth_lang_mark || '-'}</div>
                    <div><strong className="text-gray-600 block text-xs">English</strong>{firstYearData?.twelfth_eng_mark || '-'}</div>
                    <div><strong className="text-gray-800 block text-xs">Total (600)</strong>{firstYearData?.twelfth_total_marks || '-'}</div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 border-t border-gray-200 pt-2">
                    <div><strong className="text-gray-600 block text-xs truncate" title={firstYearData?.twelfth_sub1_name}>{firstYearData?.twelfth_sub1_name || 'Subject 1'}</strong>{firstYearData?.twelfth_sub1_mark || '-'}</div>
                    <div><strong className="text-gray-600 block text-xs truncate" title={firstYearData?.twelfth_sub2_name}>{firstYearData?.twelfth_sub2_name || 'Subject 2'}</strong>{firstYearData?.twelfth_sub2_mark || '-'}</div>
                    <div><strong className="text-gray-600 block text-xs truncate" title={firstYearData?.twelfth_sub3_name}>{firstYearData?.twelfth_sub3_name || 'Subject 3'}</strong>{firstYearData?.twelfth_sub3_mark || '-'}</div>
                    <div><strong className="text-gray-600 block text-xs truncate" title={firstYearData?.twelfth_sub4_name}>{firstYearData?.twelfth_sub4_name || 'Subject 4'}</strong>{firstYearData?.twelfth_sub4_mark || '-'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div><strong className="text-gray-700">First Graduate:</strong> {firstYearData?.first_graduate || '-'}</div>
          <div><strong className="text-gray-700">First Grad Cert No:</strong> {firstYearData?.first_graduate_certificate_number || '-'}</div>
          <div><strong className="text-gray-700">PMSS Scholarship:</strong> {firstYearData?.apply_pmss_scholarship || '-'}</div>
          <div><strong className="text-gray-700">BC/MBC Scholarship:</strong> {firstYearData?.apply_bc_mbc_scholarship || '-'}</div>
          
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
