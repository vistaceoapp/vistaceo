import { useState, useEffect, useRef } from 'react';
import { Camera, Plus, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/contexts/BusinessContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface BusinessPhoto {
  id: string;
  photo_url: string;
  category: string;
  caption: string | null;
  created_at: string;
  signed_url?: string;
}

// Extract storage path from either a stored path or a legacy public URL
const extractStoragePath = (photoUrl: string): string | null => {
  if (!photoUrl) return null;
  const marker = '/business-photos/';
  const idx = photoUrl.indexOf(marker);
  if (idx >= 0) return photoUrl.substring(idx + marker.length);
  // Assume it's already a plain path
  if (!/^https?:\/\//i.test(photoUrl)) return photoUrl;
  return null;
};

export const BusinessPhotosSection = () => {
  const { currentBusiness } = useBusiness();
  const [photos, setPhotos] = useState<BusinessPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentBusiness) loadPhotos();
  }, [currentBusiness?.id]);

  const loadPhotos = async () => {
    if (!currentBusiness) return;
    const { data } = await supabase
      .from('business_photos')
      .select('*')
      .eq('business_id', currentBusiness.id)
      .order('created_at', { ascending: false });

    if (!data) return;

    // Generate signed URLs for private bucket display
    const withSigned = await Promise.all(
      data.map(async (p) => {
        const path = extractStoragePath(p.photo_url);
        if (!path) return { ...p, signed_url: undefined };
        const { data: signed } = await supabase.storage
          .from('business-photos')
          .createSignedUrl(path, 60 * 60); // 1 hour
        return { ...p, signed_url: signed?.signedUrl };
      })
    );
    setPhotos(withSigned);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || !currentBusiness) return;
    
    setUploading(true);
    
    try {
      for (const file of files) {
        const ext = file.name.split('.').pop();
        const path = `${currentBusiness.id}/${Date.now()}.${ext}`;
        
        const { error: uploadError } = await supabase.storage
          .from('business-photos')
          .upload(path, file, { upsert: true });
        
        if (uploadError) throw uploadError;

        // Store storage path (not a public URL — bucket is private, we sign at read time)
        await supabase.from('business_photos').insert({
          business_id: currentBusiness.id,
          photo_url: path,
          category: 'general',
        });
      }
      
      toast.success(`${files.length} foto${files.length > 1 ? 's' : ''} subida${files.length > 1 ? 's' : ''}`);
      loadPhotos();
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Error al subir la foto');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (photo: BusinessPhoto) => {
    try {
      const path = extractStoragePath(photo.photo_url);
      if (path) {
        await supabase.storage.from('business-photos').remove([path]);
      }
      await supabase.from('business_photos').delete().eq('id', photo.id);
      setPhotos(prev => prev.filter(p => p.id !== photo.id));
      toast.success('Foto eliminada');
    } catch (err) {
      toast.error('Error al eliminar');
    }
  };

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Fotos del negocio</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs gap-1.5 rounded-xl"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
          Subir
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground mb-3">
        Subí fotos de tu local, productos, equipo o marca. La IA las usa para entender mejor tu negocio.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleUpload}
      />

      {photos.length === 0 ? (
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className={cn(
            "w-full py-8 rounded-xl border-2 border-dashed border-border/50",
            "flex flex-col items-center gap-2 text-muted-foreground",
            "hover:border-primary/30 hover:bg-primary/5 transition-colors"
          )}
        >
          <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
          <span className="text-xs">Tocá para subir fotos de tu negocio</span>
        </button>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {photos.map(photo => (
            <div key={photo.id} className="relative group aspect-square rounded-xl overflow-hidden">
              <img
                src={photo.signed_url || photo.photo_url}
                alt="Foto del negocio"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <button
                onClick={() => handleDelete(photo)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-destructive/90 text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="aspect-square rounded-xl border-2 border-dashed border-border/40 flex items-center justify-center hover:border-primary/30 transition-colors"
          >
            <Plus className="w-5 h-5 text-muted-foreground/40" />
          </button>
        </div>
      )}
    </div>
  );
};
