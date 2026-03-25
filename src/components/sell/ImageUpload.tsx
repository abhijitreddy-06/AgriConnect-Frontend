import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  onFilesChange?: (files: File[]) => void;
}

const ImageUpload = ({ images, onChange, onFilesChange }: ImageUploadProps) => {
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const incomingFiles = Array.from(files).slice(0, 4 - images.length);
    const newImages = incomingFiles
      .slice(0, 4 - images.length)
      .map((f) => URL.createObjectURL(f));
    const nextImages = [...images, ...newImages].slice(0, 4);
    const nextFiles = [...selectedFiles, ...incomingFiles].slice(0, 4);
    setSelectedFiles(nextFiles);
    onChange(nextImages);
    onFilesChange?.(nextFiles);
  };

  const removeImage = (i: number) => {
    const nextImages = images.filter((_, idx) => idx !== i);
    const nextFiles = selectedFiles.filter((_, idx) => idx !== i);
    setSelectedFiles(nextFiles);
    onChange(nextImages);
    onFilesChange?.(nextFiles);
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/40 bg-muted/30"
        }`}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm font-medium text-foreground">Upload product images</p>
        <p className="text-xs text-muted-foreground mt-1">Drag & drop or click to browse (max 4)</p>
      </div>
      {images.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          {images.map((src, i) => (
            <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border">
              <img src={src} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
