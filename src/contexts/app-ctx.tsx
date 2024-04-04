import {
  useMemo,
  useState,
  createContext,
  useEffect,
  useCallback,
  useContext,
} from 'react';
import { toast } from 'sonner';
import { removeBackground } from '@imgly/background-removal';
import { saveAs } from 'file-saver';
import { ALLOWED_IMG_EXTENSIONS } from '@/constants/files';

const AppCtx = createContext<{
  pending: boolean;
  pasteHandler: (e: ClipboardEvent) => void;
  uploadFromUrl: (url: string) => Promise<void>;
} | null>(null);

const useApp = () => {
  const ctx = useContext(AppCtx);
  if (!ctx) throw Error('useApp must be used within an AppProvider');
  return ctx;
};

function AppProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [pending, setPending] = useState(false);

  const pasteHandler = useCallback(async (e: ClipboardEvent) => {
    const url: string | null = e.clipboardData?.getData('text') || null;

    if (url == null) return;

    try {
      setPending(true);

      // Make a request to the URL and check if the response Content-Type (mine/type) is apart of the allowed image extensions
      const res = await fetch(url).catch(() => {
        throw new TypeError('Failed to fetch image URL');
      });

      if (!res.ok) {
        toast.error('Invalid image URL provided');
        return;
      }

      const contentType = res.headers.get('Content-Type');

      if (!contentType) {
        console.error('No Content-Type header found');
        toast.error('Invalid image URL provided');
        return;
      }

      const ext = contentType.split('/')[1]; // image/png -> png

      if (!ALLOWED_IMG_EXTENSIONS.includes(ext as any)) {
        toast.error('Only JPEG, PNG, and SVG files are allowed');
        return;
      }

      const blob = await res.blob();
      const debut = Date.now();
      const removedBg = await removeBackground(blob);
      const duration = Math.ceil((Date.now() - debut) / 1000);

      toast('Background successfully removed', {
        description: `Duration: ${duration}s`,
        duration: 5 * 1000 * 60,
        action: {
          label: 'Close',
          onClick: () => null,
        },
      });

      saveAs(removedBg, `RmBg-${Date.now()}.${ext}`);
    } catch (e) {
      if (e instanceof TypeError) toast.error('Invalid image URL provided');
      else toast.error('An error occurred');
    } finally {
      setPending(false);
    }
  }, []);

  const uploadFromUrl = useCallback(async (url: string) => {
    try {
      setPending(true);

      const res = await fetch(url).catch(() => {
        throw new TypeError('Failed to fetch image URL');
      });

      if (!res.ok) {
        toast.error('Invalid image URL provided');
        return;
      }

      const contentType = res.headers.get('Content-Type');

      if (!contentType) {
        console.error('No Content-Type header found');
        toast.error('Invalid image URL provided');
        return;
      }

      const ext = contentType.split('/')[1]; // image/png -> png

      if (!ALLOWED_IMG_EXTENSIONS.includes(ext as any)) {
        toast.error('Only JPEG, PNG, and SVG files are allowed');
        return;
      }

      const blob = await res.blob();
      const debut = Date.now();
      const removedBg = await removeBackground(blob);
      const duration = Math.ceil((Date.now() - debut) / 1000);

      toast('Background successfully removed', {
        description: `Duration: ${duration}s`,
        duration: 5 * 1000 * 60,
        action: {
          label: 'Close',
          onClick: () => null,
        },
      });

      saveAs(removedBg, `RmBg-${Date.now()}.${ext}`);
    } catch (e) {
      if (e instanceof TypeError) toast.error('Invalid image URL provided');
      else toast.error('An error occurred');
    } finally {
      setPending(false);
    }
  }, []);

  const sharedValues = useMemo(
    () => ({
      pending,
      pasteHandler,
      uploadFromUrl,
    }),
    [pending],
  );

  useEffect(() => {
    window.addEventListener('paste', pasteHandler);
    return () => window.removeEventListener('paste', pasteHandler);
  }, []);

  return <AppCtx.Provider value={sharedValues}>{children}</AppCtx.Provider>;
}

export { AppProvider, useApp };
