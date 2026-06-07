import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Index from "./pages/Index";

const App = () => (
  <BrowserRouter>
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: 'rgba(15, 20, 40, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(129,140,248,0.25)',
          color: '#e2e8f8',
        },
      }}
    />
    <Routes>
      <Route path="/" element={<Index />} />
    </Routes>
  </BrowserRouter>
);

export default App;
