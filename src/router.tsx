import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Navigate to="/altar" replace />} />
          <Route path="altar" element={null} />
          <Route path="incense" element={null} />
          <Route path="offerings" element={null} />
          <Route path="paper" element={null} />
          <Route path="family" element={null} />
          <Route path="memorial" element={null} />
          <Route path="prayers" element={null} />
          <Route path="ritual" element={null} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
