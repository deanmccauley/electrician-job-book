'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/app/utils/supabase';
import { Upload } from 'lucide-react';

interface BusinessSettingsProps {
  initialData: any;
}

export default function BusinessSettingsForm({ initialData }: BusinessSettingsProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    business_name: initialData?.business_name || 'Frank Rooney Electrical',
    business_address: initialData?.business_address || '',
    business_phone: initialData?.business_phone || '',
    business_vat: initialData?.business_vat || '',
    invoice_legal_text: initialData?.invoice_legal_text || 'All goods supplied, remain the property of Frank Rooney Electrical until paid in Full',
    business_logo_url: initialData?.business_logo_url || '',
  });

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setUploading(true);
  try {
    // Simple FileReader conversion
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      setFormData({ ...formData, business_logo_url: base64String });
      setUploading(false);
    };
    reader.onerror = () => {
      console.error('Error reading file');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  } catch (error) {
    console.error('Error converting logo:', error);
    setUploading(false);
  }
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { error } = await supabase
      .from('users')
      .upsert({
        id: userData.user.id,
        ...formData,
        updated_at: new Date().toISOString(),
      });

    if (!error) {
      router.refresh();
      alert('Settings saved successfully!');
    } else {
      alert('Error saving settings: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Logo Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Business Logo</label>
        <div className="flex items-center space-x-4">
          {formData.business_logo_url && (
            <img src={formData.business_logo_url} alt="Logo" className="h-16 w-16 object-contain border rounded" />
          )}
          <label className="cursor-pointer bg-white px-4 py-2 border rounded-md hover:bg-gray-50">
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              disabled={uploading}
              className="hidden"
            />
            <Upload className="w-4 h-4 inline mr-2" />
            {uploading ? 'Converting...' : 'Upload Logo'}
          </label>
        </div>
      </div>

      {/* Business Details */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Business Name</label>
        <input
          type="text"
          value={formData.business_name}
          onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Business Address</label>
        <textarea
          value={formData.business_address}
          onChange={(e) => setFormData({ ...formData, business_address: e.target.value })}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
        <input
          type="tel"
          value={formData.business_phone}
          onChange={(e) => setFormData({ ...formData, business_phone: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">VAT Number</label>
        <input
          type="text"
          value={formData.business_vat}
          onChange={(e) => setFormData({ ...formData, business_vat: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Invoice Legal Text</label>
        <textarea
          value={formData.invoice_legal_text}
          onChange={(e) => setFormData({ ...formData, invoice_legal_text: e.target.value })}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save Settings'}
      </button>
    </form>
  );
}