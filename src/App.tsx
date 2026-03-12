import { useState } from 'react'
import AdminLayout from './components/AdminLayout'
import DocsEditor from './components/DocsEditor'
import DocsList from './components/DocsList'
import DocViewer from './components/DocViewer'
import Dashboard from './components/Dashboard'

function App() {
  const [activeView, setActiveView] = useState('dashboard');

  const renderView = () => {
    if (activeView.startsWith('doc:')) {
      const docId = activeView.split(':')[1];
      return <DocViewer docId={docId} />;
    }

    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'docs-editor':
        return <DocsEditor />;
      case 'docs-list':
        return <DocsList />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AdminLayout activeView={activeView} setActiveView={setActiveView}>
      {renderView()}
    </AdminLayout>
  )
}

export default App
