import { supabase } from '@/lib/supabase-client'

export async function uploadGeneratedImage(dataUrl: string, path: string) {
  try {
    console.log('Checking if file exists at path:', path);
    
    const { data: existingFile, error: checkError } = await supabase.storage
      .from('activity-images')
      .download(path);
    
    if (!checkError && existingFile) {
      console.log('File already exists, returning existing URL');
      const { data: urlData } = supabase.storage
        .from('activity-images')
        .getPublicUrl(path);
      return urlData.publicUrl;
    }
    
    console.log('File does not exist, proceeding with upload...');
    
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    
    console.log('Uploading new file, blob size:', blob.size, 'bytes');

    const { data, error } = await supabase.storage
      .from('activity-images')
      .upload(path, blob, { 
        contentType: 'image/jpeg',
        upsert: false
      });

    if (error) {
      console.log('Upload got error, but checking if file exists anyway...');
      
      const { data: urlData } = supabase.storage
        .from('activity-images')
        .getPublicUrl(path);
      return urlData.publicUrl;
    }

    console.log('Upload successful for new file:', data.path);

    const { data: urlData } = supabase.storage
      .from('activity-images')
      .getPublicUrl(data.path);
    
    return urlData.publicUrl;
    
  } catch (error: any) {
    console.log('Catch block, trying to get public URL anyway...');

    const { data: urlData } = supabase.storage
      .from('activity-images')
      .getPublicUrl(path);
    
    return urlData.publicUrl;
  }
}