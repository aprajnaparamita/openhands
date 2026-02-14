import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { commissionApi } from '../../api/commissions';
import { uploadToCloudinary } from '../../utils/upload';
import { CreateCommissionData } from '../../types/commission';

// Components for steps
const StepIndicator = ({ step, totalSteps }: { step: number; totalSteps: number }) => {
  return (
    <nav aria-label="Progress">
      <ol className="flex items-center justify-center mb-8">
        {[...Array(totalSteps)].map((_, idx) => (
          <li key={idx} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                step > idx + 1
                  ? 'bg-green-500 text-white'
                  : step === idx + 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}
              aria-current={step === idx + 1 ? 'step' : undefined}
            >
              {step > idx + 1 ? (
                <span className="sr-only">Completed Step {idx + 1}</span>
              ) : (
                <span className="sr-only">Step {idx + 1}</span>
              )}
              <span aria-hidden="true">{step > idx + 1 ? '✓' : idx + 1}</span>
            </div>
            {idx < totalSteps - 1 && (
              <div
                className={`w-16 h-1 transition-colors mx-2 ${
                  step > idx + 1 ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                }`}
                aria-hidden="true"
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export const CreateCommission: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<CreateCommissionData>({
    title: '',
    description: '',
    price: 0,
    deadline: '',
    tags: [],
    requirements: [],
    referenceImages: [],
  });
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTag, setCurrentTag] = useState('');
  const [currentReq, setCurrentReq] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'price' ? parseFloat(value) || 0 : value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault();
      if (!formData.tags?.includes(currentTag.trim())) {
        setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), currentTag.trim()] }));
      }
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags?.filter(tag => tag !== tagToRemove) }));
  };

  const handleAddReq = () => {
    if (currentReq.trim()) {
      setFormData(prev => ({ ...prev, requirements: [...(prev.requirements || []), currentReq.trim()] }));
      setCurrentReq('');
    }
  };

  const handleReqKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddReq();
    }
  };

  const removeReq = (index: number) => {
    setFormData(prev => ({ ...prev, requirements: prev.requirements?.filter((_, i) => i !== index) }));
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let imageUrls: string[] = [];
      if (files.length > 0) {
        imageUrls = await Promise.all(
          files.map((file) => uploadToCloudinary(file))
        );
      }

      const commission = await commissionApi.create({
        ...formData,
        referenceImages: imageUrls,
      });

      navigate(`/commissions/${commission.id}`);
    } catch (error) {
      console.error('Failed to create commission:', error);
      alert('Failed to create commission. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Project Basics</h3>
      <div>
        <label htmlFor="title" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Project Title</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="e.g. Cyberpunk Character Portrait"
          required
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={5}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="Describe your vision in detail..."
          required
        />
      </div>
      <div>
        <label htmlFor="tags" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Tags (Press Enter to add)</label>
        <input
          type="text"
          id="tags"
          value={currentTag}
          onChange={(e) => setCurrentTag(e.target.value)}
          onKeyDown={handleAddTag}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="e.g. 2D, Anime, Concept Art"
        />
        <div className="flex flex-wrap gap-2 mt-2" aria-live="polite">
          {formData.tags?.map((tag, idx) => (
            <span key={idx} className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full flex items-center">
              {tag}
              <button 
                onClick={() => removeTag(tag)} 
                className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                aria-label={`Remove tag ${tag}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Requirements & References</h3>
      <div>
        <label htmlFor="requirements" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Specific Requirements</label>
        <div className="flex gap-2">
          <input
            type="text"
            id="requirements"
            value={currentReq}
            onChange={(e) => setCurrentReq(e.target.value)}
            onKeyDown={handleReqKeyDown}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="e.g. Must be delivered in PSD format"
          />
          <button
            type="button"
            onClick={handleAddReq}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
          >
            Add
          </button>
        </div>
        <ul className="mt-3 space-y-2" aria-live="polite">
          {formData.requirements?.map((req, idx) => (
            <li key={idx} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-2 rounded border border-gray-200 dark:border-gray-600">
              <span className="text-sm text-gray-700 dark:text-gray-300">{req}</span>
              <button 
                onClick={() => removeReq(idx)} 
                className="text-red-500 hover:text-red-700 dark:hover:text-red-400 text-sm"
                aria-label={`Remove requirement: ${req}`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Reference Images</label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
          <div className="space-y-1 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="flex text-sm text-gray-600 dark:text-gray-400">
              <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                <span>Upload files</span>
                <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple accept="image/*" onChange={handleFileChange} />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF up to 10MB</p>
          </div>
        </div>
        {files.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Selected files:</p>
            <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-300">
              {files.map((file, idx) => (
                <li key={idx}>{file.name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Logistics</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Budget (SOL)</label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 dark:text-gray-400 sm:text-sm">◎</span>
            </div>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className="pl-7 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
              min="0"
              step="0.1"
              placeholder="0.00"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Deadline</label>
          <input
            type="date"
            name="deadline"
            value={formData.deadline}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            required
          />
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Review Project</h3>
      <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600 space-y-4">
        <div>
          <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</h4>
          <p className="text-lg font-medium text-gray-900 dark:text-white">{formData.title}</p>
        </div>
        <div>
          <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</h4>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{formData.description}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Budget</h4>
            <p className="text-gray-900 dark:text-white font-semibold">◎ {formData.price} SOL</p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Deadline</h4>
            <p className="text-gray-900 dark:text-white">{formData.deadline}</p>
          </div>
        </div>
        {formData.tags && formData.tags.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tags</h4>
            <div className="flex flex-wrap gap-2 mt-1">
              {formData.tags.map(tag => (
                <span key={tag} className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">{tag}</span>
              ))}
            </div>
          </div>
        )}
        {formData.requirements && formData.requirements.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Requirements</h4>
            <ul className="list-disc pl-5 mt-1 text-sm text-gray-700 dark:text-gray-300">
              {formData.requirements.map((req, i) => <li key={i}>{req}</li>)}
            </ul>
          </div>
        )}
        {files.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Attachments</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">{files.length} file(s) selected</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-colors duration-200">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
          <h2 className="text-2xl font-bold text-white">Create New Project</h2>
          <p className="text-blue-100 mt-1">Step {step} of 4</p>
        </div>
        
        <div className="p-8">
          <StepIndicator step={step} totalSteps={4} />

          <form onSubmit={(e) => e.preventDefault()}>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}

            <div className="mt-10 flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                disabled={step === 1 || isSubmitting}
                className={`px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors ${
                  step === 1 ? 'invisible' : ''
                }`}
              >
                Back
              </button>
              
              {step < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors shadow-sm flex items-center ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    'Launch Project'
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
