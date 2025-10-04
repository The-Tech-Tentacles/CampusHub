import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { Notices } from './pages/Notices';
import { Forms } from './pages/Forms';
import { Courses } from './pages/Courses';

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/notices" element={<Notices />} />
          <Route path="/forms" element={<Forms />} />
          <Route path="/courses" element={<Courses />} />
          {/* Add more routes as needed */}
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
