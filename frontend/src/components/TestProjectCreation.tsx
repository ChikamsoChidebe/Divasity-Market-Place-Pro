import React, { useState } from 'react';
import { useProjectStore } from '../store/projectStore';

const TestProjectCreation: React.FC = () => {
  const { createProject, isLoading, error } = useProjectStore();
  const [formData, setFormData] = useState({
    title: 'Test Project',
    shortDescription: 'A test project for debugging',
    description: 'This is a detailed description of the test project to verify that project creation works correctly.',
    category: 'Technology',
    goalAmount: '10000',
    duration: '30',
    expectedROI: '15',
    riskLevel: 'medium'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProject({
        ...formData,
        goalAmount: parseFloat(formData.goalAmount),
        expectedROI: parseFloat(formData.expectedROI),
        daysLeft: parseInt(formData.duration),
        status: 'draft' as const,
        currentAmount: 0,
        backers: 0,
        creatorId: 'test-user-id',
        creatorName: 'Test User',
        images: [],
        tags: ['test'],
        milestones: [],
        updates: []
      });
      alert('Project created successfully!');
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Test Project Creation</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          Error: {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Goal Amount</label>
          <input
            type="number"
            value={formData.goalAmount}
            onChange={(e) => setFormData({...formData, goalAmount: e.target.value})}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-purple-600 text-white p-2 rounded hover:bg-purple-700 disabled:opacity-50"
        >
          {isLoading ? 'Creating...' : 'Create Test Project'}
        </button>
      </form>
    </div>
  );
};

export default TestProjectCreation;
