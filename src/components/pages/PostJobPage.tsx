import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import RecruiterSidebar from '@/components/RecruiterSidebar';
import { BaseCrudService } from '@/integrations';
import { JobListings } from '@/entities';
import { Save } from 'lucide-react';
import { getSessionUser } from '@/lib/session';

export default function PostJobPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    jobTitle: '',
    companyName: '',
    jobLocation: '',
    experienceLevel: 'Mid Level',
    jobDescription: '',
    requiredSkills: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    const session = getSessionUser();

    if (!session || session.role !== 'recruiter') {
      setError('Please sign in as a recruiter to post jobs');
      setIsSubmitting(false);
      navigate('/login');
      return;
    }

    try {
      await BaseCrudService.create<JobListings>('jobs', {
        _id: crypto.randomUUID(),
        recruiterId: session.userId,
        ...formData,
      });
      navigate('/recruiter/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post job');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <RecruiterSidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-[100rem] mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-heading font-bold text-foreground mb-2">Post a Job</h1>
            <p className="text-foreground/70 font-paragraph">Create a new job listing</p>
          </div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card-background rounded-2xl p-8 shadow-[0_10px_20px_rgba(0,0,0,0.2)]"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Job Title */}
              <div>
                <label htmlFor="jobTitle" className="block text-sm font-paragraph font-medium text-foreground mb-2">
                  Job Title *
                </label>
                <input
                  id="jobTitle"
                  name="jobTitle"
                  type="text"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full px-4 py-3 bg-background text-foreground rounded-xl border border-card-background focus:border-input-glow focus:outline-none focus:ring-2 focus:ring-input-glow/50 transition-all duration-300 font-paragraph"
                />
              </div>

              {/* Company Name */}
              <div>
                <label htmlFor="companyName" className="block text-sm font-paragraph font-medium text-foreground mb-2">
                  Company Name *
                </label>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  placeholder="e.g. TechCorp Inc."
                  className="w-full px-4 py-3 bg-background text-foreground rounded-xl border border-card-background focus:border-input-glow focus:outline-none focus:ring-2 focus:ring-input-glow/50 transition-all duration-300 font-paragraph"
                />
              </div>

              {/* Location */}
              <div>
                <label htmlFor="jobLocation" className="block text-sm font-paragraph font-medium text-foreground mb-2">
                  Location *
                </label>
                <input
                  id="jobLocation"
                  name="jobLocation"
                  type="text"
                  value={formData.jobLocation}
                  onChange={handleChange}
                  required
                  placeholder="e.g. San Francisco, CA or Remote"
                  className="w-full px-4 py-3 bg-background text-foreground rounded-xl border border-card-background focus:border-input-glow focus:outline-none focus:ring-2 focus:ring-input-glow/50 transition-all duration-300 font-paragraph"
                />
              </div>

              {/* Experience Level */}
              <div>
                <label htmlFor="experienceLevel" className="block text-sm font-paragraph font-medium text-foreground mb-2">
                  Experience Level *
                </label>
                <select
                  id="experienceLevel"
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-background text-foreground rounded-xl border border-card-background focus:border-input-glow focus:outline-none focus:ring-2 focus:ring-input-glow/50 transition-all duration-300 font-paragraph"
                >
                  <option value="Entry Level">Entry Level</option>
                  <option value="Mid Level">Mid Level</option>
                  <option value="Senior Level">Senior Level</option>
                  <option value="Lead">Lead</option>
                </select>
              </div>

              {/* Job Description */}
              <div>
                <label htmlFor="jobDescription" className="block text-sm font-paragraph font-medium text-foreground mb-2">
                  Job Description *
                </label>
                <textarea
                  id="jobDescription"
                  name="jobDescription"
                  value={formData.jobDescription}
                  onChange={handleChange}
                  required
                  rows={6}
                  placeholder="Describe the role, responsibilities, and what you're looking for..."
                  className="w-full px-4 py-3 bg-background text-foreground rounded-xl border border-card-background focus:border-input-glow focus:outline-none focus:ring-2 focus:ring-input-glow/50 transition-all duration-300 font-paragraph resize-none"
                />
              </div>

              {/* Required Skills */}
              <div>
                <label htmlFor="requiredSkills" className="block text-sm font-paragraph font-medium text-foreground mb-2">
                  Required Skills *
                </label>
                <input
                  id="requiredSkills"
                  name="requiredSkills"
                  type="text"
                  value={formData.requiredSkills}
                  onChange={handleChange}
                  required
                  placeholder="e.g. React, Node.js, TypeScript, AWS (comma-separated)"
                  className="w-full px-4 py-3 bg-background text-foreground rounded-xl border border-card-background focus:border-input-glow focus:outline-none focus:ring-2 focus:ring-input-glow/50 transition-all duration-300 font-paragraph"
                />
                <p className="text-foreground/50 font-paragraph text-sm mt-2">
                  Separate skills with commas
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-xl font-paragraph font-semibold hover:scale-105 transition-all duration-300 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <Save className="w-5 h-5" />
                  {isSubmitting ? 'Posting...' : 'Post Job'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/recruiter/dashboard')}
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-transparent text-primary border-2 border-primary rounded-xl font-paragraph font-semibold hover:scale-105 transition-all duration-300 hover:bg-card-background disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
              {error && <p className="text-sm text-progress-red font-paragraph">{error}</p>}
            </form>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
