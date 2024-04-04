import { z } from 'zod';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { LoaderCircle, Upload } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { useApp } from '@/contexts/app-ctx';
import { Button } from './ui/button';
import { Input } from './ui/input';

const urlSchema = z.object({
  url: z
    .string()
    .min(1, { message: 'URL is required' })
    .regex(
      /^(http|https):\/\/([^<>/:\\?*]{1,256})\.?([^\s]{2,64})(:[0-9]*)?(\/[^<>\s]*)?(\?[^<>\s]*)?$/,
      { message: 'Invalid URL provided' },
    ),
});

export const Header = () => {
  const [showDialog, setShowDialog] = useState(false);
  const { pending, pasteHandler, uploadFromUrl } = useApp();

  const form = useForm<z.infer<typeof urlSchema>>({
    resolver: zodResolver(urlSchema),
    defaultValues: {
      url: '',
    },
  });

  async function submitHandler({ url }: z.infer<typeof urlSchema>) {
    try {
      await uploadFromUrl(url);
    } catch (e) {
      console.error(e);
      toast.error('An error occurred');
    } finally {
      form.reset();
      setShowDialog(false);
    }
  }

  useEffect(() => {
    if (!showDialog) form.reset();
  }, [showDialog]);

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
              <span>Upload from URL (BETA)</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload from URL (BETA)</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                autoComplete="off"
                id="paste-url-form"
                onSubmit={form.handleSubmit(submitHandler)}
              >
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/image.jpg"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>

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
                disabled={pending}
              >
                {pending ? (
                  <>
                    <LoaderCircle
                      size={16}
                      className="mr-1.5 animate-spin-fast"
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
