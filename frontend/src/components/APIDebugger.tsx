import { useState } from 'react';
import { apiService } from '../services/api';
import { dashboardService } from '../services/dashboardService';

export default function APIDebugger() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState<string>('');

  const testAPI = async (endpoint: string, method: string) => {
    setLoading(endpoint);
    try {
      let result;
      switch (endpoint) {
        case 'projects':
          result = await apiService.getAllProjects();
          break;
        case 'news':
          result = await apiService.getAllNews();
          break;
        case 'dashboard-projects':
          result = await dashboardService.getAllProjects();
          break;
        case 'dashboard-news':
          result = await dashboardService.getAllNews();
          break;
        default:
          result = { error: true, message: 'Unknown endpoint' };
      }
      
      setResults(prev => ({
        ...prev,
        [endpoint]: result
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [endpoint]: { error: true, message: error.message, details: error }
      }));
    } finally {
      setLoading('');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">API Debugger</h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => testAPI('projects', 'GET')}
            disabled={loading === 'projects'}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading === 'projects' ? 'Loading...' : 'Test /projects'}
          </button>
          
          <button
            onClick={() => testAPI('news', 'GET')}
            disabled={loading === 'news'}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading === 'news' ? 'Loading...' : 'Test /news/getnews'}
          </button>
          
          <button
            onClick={() => testAPI('dashboard-projects', 'GET')}
            disabled={loading === 'dashboard-projects'}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
          >
            {loading === 'dashboard-projects' ? 'Loading...' : 'Test Dashboard Projects'}
          </button>
          
          <button
            onClick={() => testAPI('dashboard-news', 'GET')}
            disabled={loading === 'dashboard-news'}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50"
          >
            {loading === 'dashboard-news' ? 'Loading...' : 'Test Dashboard News'}
          </button>
        </div>
        
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Results:</h3>
          <div className="space-y-4">
            {Object.entries(results).map(([endpoint, result]) => (
              <div key={endpoint} className="border rounded p-4">
                <h4 className="font-medium text-gray-700 mb-2">{endpoint}:</h4>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
