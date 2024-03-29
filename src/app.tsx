import { Header } from '@/components/header';
import { UploadArea } from '@/components/upload-area';
import { AppProvider } from '@/contexts/app-ctx';

export function App() {
  return (
    <AppProvider>
      <Header />

      <main className="py-10">
        <UploadArea />
      </main>
    </AppProvider>
  );
}
