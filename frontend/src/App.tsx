import './App.css';
import AppRouter from './layouts/AppRouter';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <>
      <AppRouter />
      <Toaster />
    </>
  );
}

export default App;
