'use client';

import { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
    onImageChange: (imageData: string | null) => void;
    currentImage?: string;
}

export default function ImageUpload({ onImageChange, currentImage }: ImageUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [preview, setPreview] = useState<string | null>(currentImage || null);
    const [error, setError] = useState<string | null>(null);

    const handleFile = useCallback((file: File) => {
        setError(null);

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('이미지 파일만 업로드 가능합니다.');
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('파일 크기는 5MB 이하여야 합니다.');
            return;
        }

        // Read file and convert to base64
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            setPreview(result);
            onImageChange(result);
        };
        reader.onerror = () => {
            setError('파일을 읽는 중 오류가 발생했습니다.');
        };
        reader.readAsDataURL(file);
    }, [onImageChange]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    }, [handleFile]);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    }, [handleFile]);

    const handleRemove = useCallback(() => {
        setPreview(null);
        setError(null);
        onImageChange(null);
    }, [onImageChange]);

    return (
        <div className="space-y-2">
            <label className="block text-sm text-gray-400">카드 이미지</label>

            {preview ? (
                <div className="relative group">
                    <div className="w-full h-48 bg-black/40 rounded-lg border-2 border-white/10 overflow-hidden">
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <button
                        onClick={handleRemove}
                        className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-400 rounded-full transition-colors shadow-lg"
                    >
                        <X size={16} className="text-white" />
                    </button>
                </div>
            ) : (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={cn(
                        "relative w-full h-48 border-2 border-dashed rounded-lg transition-all cursor-pointer",
                        isDragging
                            ? "border-cyan-500 bg-cyan-500/10"
                            : "border-white/20 bg-white/5 hover:border-cyan-500/50 hover:bg-white/10"
                    )}
                >
                    <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleFileInput}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
                        {isDragging ? (
                            <>
                                <Upload size={40} className="text-cyan-400 animate-bounce" />
                                <p className="text-cyan-400 font-medium">이미지를 놓으세요</p>
                            </>
                        ) : (
                            <>
                                <ImageIcon size={40} className="text-white/40" />
                                <div className="text-center">
                                    <p className="text-white/60 font-medium mb-1">
                                        이미지를 드래그하거나 클릭하여 업로드
                                    </p>
                                    <p className="text-white/40 text-xs">
                                        PNG, JPEG, WEBP (최대 5MB)
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {error && (
                <p className="text-red-400 text-xs">{error}</p>
            )}
        </div>
    );
}
