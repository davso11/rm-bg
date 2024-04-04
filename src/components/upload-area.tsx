import { toast } from 'sonner';
import { saveAs } from 'file-saver';
import { useCallback, useState } from 'react';
import { ImageUp, LoaderCircle } from 'lucide-react';
import { removeBackground } from '@imgly/background-removal';
import { FileRejection, ErrorCode, useDropzone } from 'react-dropzone';
import { ALLOWED_IMG_EXTENSIONS, MAX_FILE_SIZE } from '@/constants/files';
import { cn } from '@/lib/utils';

export const UploadArea = () => {
  const [pending, setPending] = useState(false);
  const [pendingMsg, setPendingMsg] = useState<string>(
    'May take a few seconds',
  );

  const onDrop = useCallback((files: File[], rejected: FileRejection[]) => {
    if (rejected.length > 0) {
      const error = rejected[0].errors[0];
      switch (error.code) {
        case ErrorCode.FileInvalidType:
          toast.error('Only JPEG, PNG, and SVG files are allowed');
          break;
        case ErrorCode.TooManyFiles:
          toast.error('Only one (01) file is allowed');
          break;
        case ErrorCode.FileTooLarge:
          toast.error(`File is too large (max ${MAX_FILE_SIZE}MB)`);
          break;
        default:
          toast.error('An error occurred');
          break;
      }
      return;
    }

    const file = files[0];

    if (!file) return;

    setPending(true);

    const timeout1 = setTimeout(() => {
      setPendingMsg('Just a few more seconds...');
    }, 1000 * 30); // 30s

    const timeout2 = setTimeout(() => {
      setPendingMsg('Your image may be quite large, please be patient');
    }, 1000 * 90); // 1m30s

    const reader = new FileReader();

    reader.readAsArrayBuffer(file);

    reader.onload = async () => {
      const arrBuffer = reader.result as ArrayBuffer;
      const blob = new Blob([arrBuffer], { type: file.type });

      try {
        const debut = Date.now();
        const removedBg = await removeBackground(blob);
        const duration = (Date.now() - debut) / 1000;
        toast('Background successfully removed', {
          description: `Duration: ${duration}s`,
          duration: 5 * 1000 * 60,
          action: {
            label: 'Close',
            onClick: () => null,
          },
        });
        saveAs(removedBg, `RmBg-${file.name}`);
      } catch (e) {
        toast.error('An error occurred');
      } finally {
        setPending(false);
        clearTimeout(timeout1);
        clearTimeout(timeout2);
        setPendingMsg('May take a few seconds');
      }
    };

    reader.onerror = () => {
      toast.error('An error occurred');
      setPending(false);
    };

    reader.onabort = () => {
      toast.error('File reading was aborted');
      setPending(false);
    };
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    disabled: pending,
    maxSize: MAX_FILE_SIZE * 1024 * 1024,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/svg+xml': ['.svg'],
      'image/png': ['.png'],
    },
  });

  return (
    <section className="container">
      <div
        {...getRootProps()}
        className={cn(
          'center-flex min-h-80 cursor-pointer rounded-xl border-2 border-dashed transition-colors duration-200 ease-in-out',
          isDragActive && 'border-blue-600 bg-blue-50',
          !isDragActive && 'hover:bg-zinc-50',
          pending && 'cursor-not-allowed border-zinc-200 bg-zinc-50',
        )}
      >
        {pending ? (
          <div className="center-flex flex-col text-sm">
            <LoaderCircle
              size={32}
              className="animate-spin-fast text-zinc-400"
            />
            <p className="mt-2 text-center text-zinc-400">
              <span>Removing the background from the image...</span>
              <br />
              <span>{pendingMsg}</span>
            </p>
          </div>
        ) : (
          <div className="center-flex flex-col">
            <ImageUp
              size={58}
              strokeWidth={0.8}
              className="text-zinc-400"
            />

            <input
              {...getInputProps()}
              type="file"
              id="file-input"
              className="sr-only"
            />

            <div className="mt-5 text-center text-sm font-medium">
              {isDragActive ? (
                <>
                  <span>Drop it now</span>
                </>
              ) : (
                <>
                  <span>Drag your image here or </span>
                  <label
                    htmlFor="file-input"
                    className="cursor-pointer text-blue-600 hover:underline"
                  >
                    browse
                  </label>
                  <span> (Max 01)</span>
                </>
              )}
            </div>

            <p className="mt-1 text-sm uppercase text-zinc-400">
              {ALLOWED_IMG_EXTENSIONS.join(', ')}
            </p>
          </div>
        )}
      </div>
      <p className="mt-4 text-center text-sm text-zinc-500 sm:text-left">
        You can also paste an image URL (Ctrl + V)
      </p>
    </section>
  );
};
