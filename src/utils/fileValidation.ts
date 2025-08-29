export interface FileValidationOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  allowedExtensions?: string[];
}

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateFile = (
  file: File,
  options: FileValidationOptions = {}
): FileValidationResult => {
  const {
    maxSize = 5 * 1024 * 1024, // Default 5MB
    allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"],
    allowedExtensions = ["jpg", "jpeg", "png", "gif"],
  } = options;

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024);
    return {
      isValid: false,
      error: `File size too large. Please upload a file smaller than ${maxSizeMB}MB.`,
    };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: "File type not supported. Please upload a JPG, PNG, or GIF image.",
    };
  }

  // Check file extension
  const fileExtension = file.name.split(".").pop()?.toLowerCase();
  if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
    return {
      isValid: false,
      error: "File type not supported. Please upload a JPG, PNG, or GIF image.",
    };
  }

  return { isValid: true };
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};
