'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/app/utils/supabase';
import { Camera, X, Loader2 } from 'lucide-react';

interface PhotoUploadProps {
  jobId: number;
  onUploadComplete?: () => void;
}

export default function PhotoUpload({ jobId, onUploadComplete }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState<any[]>([]);
  const supabase = createClient();

  // Load existing photos
  useEffect(() => {
    loadPhotos();
  }, [jobId]);

  const loadPhotos = async () => {
    const { data: photos, error } = await supabase
      .from('job_photos')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false });

    if (!error && photos) {
      setPhotos(photos);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${jobId}/${Date.now()}_${Math.random()}.${fileExt}`;
        const filePath = fileName;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('job-photos')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('job-photos')
          .getPublicUrl(filePath);

        // Save reference in database
        const { error: dbError } = await supabase
          .from('job_photos')
          .insert([{
            job_id: jobId,
            url: urlData.publicUrl,
            user_id: userData.user.id
          }]);

        if (dbError) {
          console.error('Database error:', dbError);
        }
      }

      // Reload photos
      await loadPhotos();
      if (onUploadComplete) onUploadComplete();
    } catch (error) {
      console.error('Error uploading photos:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photoId: number, photoUrl: string) => {
    if (!confirm('Delete this photo?')) return;

    try {
      // Extract file path from URL (get the last two parts: jobId/filename)
      const urlParts = photoUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const jobIdFromUrl = urlParts[urlParts.length - 2];
      const filePath = `${jobIdFromUrl}/${fileName}`;
      
      // Delete from storage
      await supabase.storage
        .from('job-photos')
        .remove([filePath]);

      // Delete from database
      await supabase
        .from('job_photos')
        .delete()
        .eq('id', photoId);

      // Reload photos
      await loadPhotos();
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload button */}
      <div>
        <label className="relative cursor-pointer block">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            disabled={uploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors">
            {uploading ? (
              <div className="flex items-center text-gray-500">
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Uploading...
              </div>
            ) : (
              <div className="flex items-center text-gray-500">
                <Camera className="w-5 h-5 mr-2" />
                Click to upload photos
              </div>
            )}
          </div>
        </label>
      </div>

      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group">
              <div className="aspect-square relative rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={photo.url}
                  alt="Job photo"
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={() => handleDelete(photo.id, photo.url)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}