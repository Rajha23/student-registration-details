import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Upload, File, CheckCircle, ArrowLeft, Loader2, Plus } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { documentUploadSchema } from '../schemas/forms';
import type { DocumentUploadFormData } from '../schemas/forms';
import { supabase } from '../supabase/client';

const FileUploadItem = ({ 
  label, 
  id, 
  required, 
  value, 
  onChange, 
  error 
}: { 
  label: string, 
  id: string, 
  required?: boolean, 
  value?: string, 
  onChange: (url: string) => void,
  error?: string 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const folderNumber = localStorage.getItem('student_folder_number');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !folderNumber) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit.");
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${folderNumber}/${id}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('student_certificates')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('student_certificates')
        .getPublicUrl(fileName);

      onChange(urlData.publicUrl);

      // Save to db, ignoring duplicates natively
      await supabase.from('student_documents').insert({
        folder_number: folderNumber,
        document_type: id,
        document_name: label,
        file_url: urlData.publicUrl
      });

    } catch (err: any) {
      console.error(err);
      alert("Upload failed: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!folderNumber || !value) return;
    try {
      // Best effort cleanup in DB
      await supabase.from('student_documents').delete().match({ folder_number: folderNumber, file_url: value });
    } catch (e) {}
    onChange('');
  };

  return (
    <div className="flex flex-col gap-2 p-4 border border-white/10 rounded-xl bg-white/5 transition-all duration-300 hover:border-primary/50">
      <div className="flex justify-between items-center">
        <label className="font-medium text-sm">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {value && <span className="text-xs text-green-400 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Uploaded</span>}
      </div>
      
      {!value ? (
        <div className="relative">
          <input 
            type="file" 
            id={id}
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleUpload}
            className="hidden"
            disabled={isUploading}
          />
          <label 
            htmlFor={id} 
            className={`flex items-center justify-center gap-2 w-full p-3 border border-dashed border-white/20 rounded-lg cursor-pointer hover:bg-white/5 transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 text-text-secondary" />}
            <span className="text-sm text-text-secondary">{isUploading ? 'Uploading...' : 'Click to upload PDF/Image (Max 5MB)'}</span>
          </label>
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center gap-2 overflow-hidden">
            <File className="w-4 h-4 text-primary shrink-0" />
            <a href={value} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline truncate">View Document</a>
          </div>
          <button type="button" onClick={handleRemove} className="text-xs text-red-400 hover:text-red-300 px-2 py-1">Remove</button>
        </div>
      )}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export const DocumentUploadForm = () => {
  const navigate = useNavigate();
  const folderNumber = localStorage.getItem('student_folder_number');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otherDocs, setOtherDocs] = useState<{id: string, name: string, url: string}[]>([]);
  const [newDocName, setNewDocName] = useState('');

  const { handleSubmit, setValue, watch, formState: { errors } } = useForm<DocumentUploadFormData>({
    resolver: zodResolver(documentUploadSchema),
    defaultValues: {}
  });

  useEffect(() => {
    if (!folderNumber) {
      navigate('/access');
      return;
    }
    fetchExistingDocs();
  }, [folderNumber, navigate]);

  const fetchExistingDocs = async () => {
    try {
      const { data } = await supabase
        .from('student_documents')
        .select('*')
        .eq('folder_number', folderNumber);
        
      if (data) {
        const others: {id: string, name: string, url: string}[] = [];
        data.forEach(doc => {
          if (doc.document_type.startsWith('other_')) {
            others.push({ id: doc.document_type, name: doc.document_name, url: doc.file_url });
          } else {
            // @ts-ignore
            setValue(doc.document_type, doc.file_url);
          }
        });
        setOtherDocs(others);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddOtherDoc = () => {
    if (!newDocName.trim()) return;
    setOtherDocs(prev => [...prev, { id: `other_${Date.now()}`, name: newDocName, url: '' }]);
    setNewDocName('');
  };

  const onSubmit = async () => {
    setIsSubmitting(true);
    try {
      // In a real app we might update a status column for form 3.
      // For now, since files are already uploaded to Storage/DB individually during selection,
      // we just need to ensure all required fields are filled, which Zod does for us.
      
      // Update form 3 status in basic details if we wanted to track it, but we can just mark form 3 complete in our app logic by checking if documents exist.
      alert("Documents submitted successfully!");
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      alert('An error occurred during submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col max-w-4xl mx-auto py-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="text-text-secondary hover:text-white -ml-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Button>
      </div>

      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          Document Uploads
        </h1>
        <p className="text-text-secondary">
          Please upload your certificates and documents. Accepted formats: PDF, PNG, JPG (Max 5MB per file).
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="mb-8">
          <h2 className="text-xl font-bold mb-6 pb-2 border-b border-white/10 text-primary">Mandatory Documents</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <FileUploadItem label="10th Mark Sheet" id="tenth_marksheet" required value={watch('tenth_marksheet')} onChange={(v) => setValue('tenth_marksheet', v, { shouldValidate: true })} error={errors.tenth_marksheet?.message} />
            <FileUploadItem label="12th Mark Sheet" id="twelfth_marksheet" required value={watch('twelfth_marksheet')} onChange={(v) => setValue('twelfth_marksheet', v, { shouldValidate: true })} error={errors.twelfth_marksheet?.message} />
            <FileUploadItem label="Transfer Certificate (TC)" id="tc" required value={watch('tc')} onChange={(v) => setValue('tc', v, { shouldValidate: true })} error={errors.tc?.message} />
            <FileUploadItem label="Community Certificate" id="community_certificate" required value={watch('community_certificate')} onChange={(v) => setValue('community_certificate', v, { shouldValidate: true })} error={errors.community_certificate?.message} />
            <FileUploadItem label="Aadhar Card" id="aadhar" required value={watch('aadhar')} onChange={(v) => setValue('aadhar', v, { shouldValidate: true })} error={errors.aadhar?.message} />
            <FileUploadItem label="Passport Size Photo" id="photo" required value={watch('photo')} onChange={(v) => setValue('photo', v, { shouldValidate: true })} error={errors.photo?.message} />
            <FileUploadItem label="Signature" id="sign" required value={watch('sign')} onChange={(v) => setValue('sign', v, { shouldValidate: true })} error={errors.sign?.message} />
          </div>
        </Card>

        <Card className="mb-8">
          <h2 className="text-xl font-bold mb-6 pb-2 border-b border-white/10 text-accent">Optional Documents</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <FileUploadItem label="11th Mark Sheet" id="eleventh_marksheet" value={watch('eleventh_marksheet')} onChange={(v) => setValue('eleventh_marksheet', v)} />
            <FileUploadItem label="Migration Certificate" id="migration_certificate" value={watch('migration_certificate')} onChange={(v) => setValue('migration_certificate', v)} />
            <FileUploadItem label="First Graduate Certificate" id="first_graduate_certificate" value={watch('first_graduate_certificate')} onChange={(v) => setValue('first_graduate_certificate', v)} />
            <FileUploadItem label="Nativity Certificate" id="nativity_certificate" value={watch('nativity_certificate')} onChange={(v) => setValue('nativity_certificate', v)} />
          </div>
        </Card>

        <Card className="mb-8">
          <h2 className="text-xl font-bold mb-6 pb-2 border-b border-white/10 text-purple-400">Other Documents</h2>
          <p className="text-sm text-text-secondary mb-4">If you need to upload any other supporting documents, add them here.</p>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {otherDocs.map((doc, idx) => (
              <FileUploadItem 
                key={doc.id}
                label={doc.name} 
                id={doc.id} 
                value={doc.url} 
                onChange={(v) => {
                  const updated = [...otherDocs];
                  updated[idx].url = v;
                  setOtherDocs(updated);
                }} 
              />
            ))}
          </div>

          <div className="flex gap-4 items-end bg-white/5 p-4 rounded-xl border border-white/10">
            <div className="flex-1">
              <Input 
                label="Document Name" 
                placeholder="e.g., Medical Certificate" 
                value={newDocName}
                onChange={(e) => setNewDocName(e.target.value)}
                className="mb-0"
              />
            </div>
            <Button type="button" variant="secondary" onClick={handleAddOtherDoc} disabled={!newDocName.trim()}>
              <Plus className="w-4 h-4 mr-2" /> Add Upload Field
            </Button>
          </div>
        </Card>

        <div className="flex justify-end gap-4 mt-8">
          <Button type="submit" isLoading={isSubmitting} className="bg-green-600 hover:bg-green-700 w-full md:w-auto text-lg px-8 py-4">
            <CheckCircle className="w-5 h-5 mr-2" /> Complete Documentation
          </Button>
        </div>
      </form>
    </div>
  );
};
