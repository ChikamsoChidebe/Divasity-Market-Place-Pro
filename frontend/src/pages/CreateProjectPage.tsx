import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Upload, 
  Plus, 
  X, 
  Banknote, 
  Calendar, 
  Target,
  Image as ImageIcon,
  FileText,
  Save,
  Eye
} from 'lucide-react';
import ImageUpload from '../components/ImageUpload';
import { useProjectStore } from '../store/projectStore';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';

export default function CreateProjectPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { createProject, isLoading } = useProjectStore();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', // Changed from title to match API
    description: '',
    category: '',
    expectedRaiseAmount: '', // Changed from goalAmount to match API
    startDate: '',
    endDate: ''
    // Removed fields not in API: shortDescription, riskLevel, expectedROI, tags, images, milestones
  });

  const categories = [
    'Technology',
    'Healthcare', 
    'Renewable Energy',
    'Education',
    'Finance',
    'Entertainment',
    'Food & Beverage',
    'Fashion',
    'Art & Design',
    'Sports & Fitness'
  ];

  const steps = [
    { id: 1, name: 'Basic Info', description: 'Project details and description' },
    { id: 2, name: 'Funding & Timeline', description: 'Financial goals and project timeline' },
    { id: 3, name: 'Review', description: 'Final review and submission' }
    // Removed Media and Milestones steps as they're not in the API
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Removed unused handlers for tags and milestones as they're not in the API
  // const handleTagAdd = (tag: string) => { ... }
  // const handleTagRemove = (tagToRemove: string) => { ... }
  // const handleMilestoneChange = (index: number, field: string, value: string) => { ... }
  // const addMilestone = () => { ... }
  // const removeMilestone = (index: number) => { ... }

  const handleSubmit = async () => {
    try {
      const projectData = {
        name: formData.name,
        category: formData.category,
        expectedRaiseAmount: formData.expectedRaiseAmount,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate
      };

      await createProject(projectData);
      toast.success('Project created successfully!');
      
      // Navigate to my projects to see the new project
      navigate('/creator/my-projects');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create project');
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.name && formData.description && formData.category;
      case 2:
        return formData.expectedRaiseAmount && formData.startDate && formData.endDate;
      case 3:
        return true; // Review step
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/creator/dashboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
          
          <div className="flex items-center space-x-4">
            <button className="btn-secondary flex items-center space-x-2">
              <Save className="w-4 h-4" />
              <span>Save Draft</span>
            </button>
            <button className="btn-secondary flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.id 
                    ? 'bg-purple-600 border-purple-600 text-white' 
                    : 'border-gray-300 text-gray-500'
                }`}>
                  {step.id}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-purple-600' : 'text-gray-500'
                  }`}>
                    {step.name}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-purple-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <motion.div
          key={currentStep}
          className="card p-8"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Details</h2>
                <p className="text-gray-600">Tell us about your innovative project</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="input-field"
                  placeholder="Enter your project name"
                  maxLength={100}
                />
                <p className="text-xs text-gray-500 mt-1">{formData.name.length}/100 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="input-field"
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detailed Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="input-field h-32"
                  placeholder="Provide a detailed description of your project, its goals, and impact"
                />
              </div>

              {/* Tags removed as not in API */}
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full"
                    >
                      {tag}
                      <button
                        onClick={() => handleTagRemove(tag)}
                        className="ml-2 text-purple-600 hover:text-purple-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Add tags (press Enter)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleTagAdd(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div> */}
            </div>
          )}

          {/* Step 2: Funding & Timeline */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Funding & Timeline</h2>
                <p className="text-gray-600">Set your financial goals and project timeline</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Raise Amount (₦) *
                </label>
                <div className="relative">
                  <Banknote className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={formData.expectedRaiseAmount}
                    onChange={(e) => handleInputChange('expectedRaiseAmount', e.target.value)}
                    className="input-field pl-10"
                    placeholder="0"
                    min="1000"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Amount in Nigerian Naira</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="input-field"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className="input-field"
                    min={formData.startDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              {/* ROI and Risk Level removed as not in API */}
              {/* <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected ROI (%) *
                  </label>
                  <div className="relative">
                    <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={formData.expectedROI}
                      onChange={(e) => handleInputChange('expectedROI', e.target.value)}
                      className="input-field pl-10"
                      placeholder="15"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Risk Level
                  </label>
                  <select
                    value={formData.riskLevel}
                    onChange={(e) => handleInputChange('riskLevel', e.target.value)}
                    className="input-field"
                  >
                    <option value="low">Low Risk</option>
                    <option value="medium">Medium Risk</option>
                    <option value="high">High Risk</option>
                  </select>
                </div>
              </div> */}
            </div>
          )}

          {/* Media and Milestones steps removed as not in API */}
          {/* Step 3: Media - Removed */}
          {/* Step 4: Milestones - Removed */}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Submit</h2>
                <p className="text-gray-600">Review your project details before submission</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Summary</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-600">Name:</span> {formData.name}</p>
                      <p><span className="text-gray-600">Category:</span> {formData.category}</p>
                      <p><span className="text-gray-600">Description:</span> {formData.description.substring(0, 100)}...</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Funding & Timeline</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-600">Expected Raise:</span> ₦{parseFloat(formData.expectedRaiseAmount || '0').toLocaleString()}</p>
                      <p><span className="text-gray-600">Start Date:</span> {formData.startDate}</p>
                      <p><span className="text-gray-600">End Date:</span> {formData.endDate}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <FileText className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-purple-900">Before You Submit</h4>
                    <ul className="text-sm text-purple-800 mt-2 space-y-1">
                      <li>• Your project will be reviewed by our team within 2-3 business days</li>
                      <li>• You'll receive an email notification once the review is complete</li>
                      <li>• You can edit your project until it's approved and goes live</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-8 border-t border-gray-200">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {currentStep < steps.length ? (
              <button
                onClick={nextStep}
                disabled={!isStepValid()}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next Step
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isLoading || !isStepValid()}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating...' : 'Submit Project'}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
