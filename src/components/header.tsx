import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { LoaderCircle, Upload } from 'lucide-react';
import { useApp } from '@/contexts/app-ctx';
import { Button } from './ui/button';
import { Input } from './ui/input';

export const Header = () => {
  const [url, setUrl] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const { pending, pasteHandler, uploadFromUrl } = useApp();

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!url) return;

    try {
      await uploadFromUrl(url);
    } catch (e) {
      console.error(e);
      toast.error('An error occurred');
    } finally {
      setUrl('');
      setShowDialog(false);
    }
  };

  useEffect(() => {
    if (showDialog) window.removeEventListener('paste', pasteHandler);
    else window.addEventListener('paste', pasteHandler);
  }, [showDialog]);

  return (
    <header className="border-b">
      <div className="container flex items-center justify-between py-3">
        <h1 className="inline-block text-lg font-semibold leading-10">RmBg</h1>
        <Dialog
          open={showDialog}
          onOpenChange={setShowDialog}
        >
          <DialogTrigger asChild>
            <Button
              // disabled
              variant="outline"
            >
              <Upload
                size={16}
                className="mr-2"
              />
              <span>Upload from URL</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload from URL</DialogTitle>
            </DialogHeader>

            <form
              autoComplete="off"
              id="paste-url-form"
              onSubmit={submitHandler}
            >
              <Input
                type="url"
                value={url}
                placeholder="https://example.com/image.jpg"
                onChange={(e) => setUrl(e.target.value)}
              />
            </form>

            <DialogFooter>
              <DialogClose asChild>
                <Button
                  variant="ghost"
                  disabled={pending}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                form="paste-url-form"
                disabled={!url || pending}
              >
                {pending ? (
                  <>
                    <LoaderCircle
                      size={16}
                      className="animate-spin-fast mr-1.5"
                    />
                    <span>Processing</span>
                  </>
                ) : (
                  <span>Upload & RmBg</span>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
};
