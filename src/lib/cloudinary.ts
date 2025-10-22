const CLOUDINARY_CLOUD_NAME = 'daaeup80x';
const CLOUDINARY_UPLOAD_PRESET = 'perfil_catolico';
const MAX_FILE_SIZE = 1024 * 1024;

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
}

export async function uploadToCloudinary(
  file: File,
  folder: string = 'profiles'
): Promise<CloudinaryUploadResult> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('A imagem deve ter no máximo 1MB');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error('Erro ao fazer upload da imagem');
  }

  const data = await response.json();
  return {
    secure_url: data.secure_url,
    public_id: data.public_id,
    width: data.width,
    height: data.height,
  };
}

export function validateImageFile(file: File): string | null {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

  if (!validTypes.includes(file.type)) {
    return 'Apenas imagens JPG, PNG ou WEBP são permitidas';
  }

  if (file.size > MAX_FILE_SIZE) {
    return 'A imagem deve ter no máximo 1MB';
  }

  return null;
}
