import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import CandidateSidebar from '@/components/CandidateSidebar';
import { BaseCrudService, analyzeResumeSmart, extractPdfTextFromFile } from '@/integrations';
import { JobListings, Applications } from '@/entities';
import { MapPin, Briefcase, ArrowLeft, Loader2, Upload } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { getSessionUser } from '@/lib/session';

export default function JobDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobListings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeFileName, setResumeFileName] = useState('');
  const [resumeExtractedText, setResumeExtractedText] = useState('');
  const [extractError, setExtractError] = useState('');

  useEffect(() => {
    loadJob();
  }, [id]);

  const loadJob = async () => {
    if (!id) return;
    setIsLoading(true);
    const data = await BaseCrudService.getById<JobListings>('jobs', id);
    setJob(data);
    setIsLoading(false);
  };

  const handleResumeFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setResumeFile(file);
    setResumeExtractedText('');
    setExtractError('');
    setResumeFileName('');

    if (!file) return;

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setExtractError('Please upload a PDF file only.');
      return;
    }

    try {
      setResumeFileName(file.name);
      const extracted = await extractPdfTextFromFile(file);
      if (!extracted) {
        setExtractError('Could not extract text from this PDF right now. Try a clearer PDF or re-upload.');
        return;
      }
      setResumeExtractedText(extracted);
    } catch {
      setExtractError('Failed to read this PDF file. Please try another file.');
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job || !resumeFile || !resumeExtractedText) return;
    const session = getSessionUser();

    setIsApplying(true);

    await new Promise((resolve) => setTimeout(resolve, 1200));

    const analysis = await analyzeResumeSmart({
      resumeText: resumeExtractedText,
      requiredSkills: job.requiredSkills || '',
    });

    await BaseCrudService.create<Applications>('applications', {
      _id: crypto.randomUUID(),
      recruiterId: job.recruiterId,
      candidateId: session?.userId,
      candidateName: session?.name || 'Candidate',
      resume: '',
      resumeFileName,
      resumeExtractedText: resumeExtractedText.slice(0, 6000),
      resumeSummary: analysis.summary,
      jobReference: job.jobTitle,
      jobRequiredSkills: job.requiredSkills || '',
      applicationStatus: 'Pending',
      matchScore: analysis.matchScore,
      strengths: analysis.strengths.join('. '),
      matchedSkills: analysis.matchedSkills.join(', '),
      missingSkills: analysis.missingSkills.join(', '),
    });

    setIsApplying(false);
    navigate('/candidate/applications');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <CandidateSidebar />
        <main className="flex-1 p-8">
          <div className="max-w-[100rem] mx-auto min-h-[600px] flex items-center justify-center">
            <LoadingSpinner />
          </div>
        </main>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex min-h-screen bg-background">
        <CandidateSidebar />
        <main className="flex-1 p-8">
          <div className="max-w-[100rem] mx-auto">
            <div className="bg-card-background rounded-2xl p-12 text-center shadow-[0_10px_20px_rgba(0,0,0,0.2)]">
              <p className="text-foreground/70 font-paragraph mb-4">Job not found</p>
              <button
                onClick={() => navigate('/candidate/browse-jobs')}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-paragraph font-semibold hover:scale-105 transition-all duration-300 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]"
              >
                Back to Jobs
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <CandidateSidebar />

      <main className="flex-1 p-8">
        <div className="max-w-[100rem] mx-auto">
          <button
            onClick={() => navigate('/candidate/browse-jobs')}
            className="flex items-center gap-2 text-foreground/70 hover:text-primary transition-colors duration-300 font-paragraph mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Jobs
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card-background rounded-2xl p-8 mb-6 shadow-[0_10px_20px_rgba(0,0,0,0.2)]"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-4xl font-heading font-bold text-foreground mb-4">{job.jobTitle}</h1>
                <div className="flex flex-wrap items-center gap-4 text-foreground/70 font-paragraph mb-4">
                  {job.companyName && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5" />
                      {job.companyName}
                    </div>
                  )}
                  {job.jobLocation && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      {job.jobLocation}
                    </div>
                  )}
                </div>
              </div>
              {job.experienceLevel && (
                <span className="px-4 py-2 bg-primary/20 text-primary rounded-xl font-paragraph font-medium">
                  {job.experienceLevel}
                </span>
              )}
            </div>

            {job.jobDescription && (
              <div className="mb-6">
                <h2 className="text-xl font-heading font-semibold text-foreground mb-3">Job Description</h2>
                <p className="text-foreground/70 font-paragraph leading-relaxed">{job.jobDescription}</p>
              </div>
            )}

            {job.requiredSkills && (
              <div className="mb-6">
                <h2 className="text-xl font-heading font-semibold text-foreground mb-3">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.requiredSkills.split(',').map((skill, idx) => (
                    <span key={idx} className="px-4 py-2 bg-secondary/20 text-secondary rounded-xl font-paragraph">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {!showApplicationForm && (
              <button
                onClick={() => setShowApplicationForm(true)}
                className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-paragraph font-semibold hover:scale-105 transition-all duration-300 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]"
              >
                Apply Now
              </button>
            )}
          </motion.div>

          {showApplicationForm && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-card-background rounded-2xl p-8 shadow-[0_10px_20px_rgba(0,0,0,0.2)]"
            >
              <h2 className="text-2xl font-heading font-semibold text-foreground mb-6">Submit Application</h2>

              <form onSubmit={handleApply} className="space-y-6">
                <div>
                  <label htmlFor="resume" className="block text-sm font-paragraph font-medium text-foreground mb-2">
                    Upload Resume (PDF)
                  </label>
                  <input
                    id="resume"
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleResumeFileChange}
                    required
                    className="w-full px-4 py-3 bg-background text-foreground rounded-xl border border-card-background file:mr-4 file:rounded-lg file:border-0 file:bg-primary/20 file:px-3 file:py-2 file:text-primary file:font-semibold focus:border-input-glow focus:outline-none focus:ring-2 focus:ring-input-glow/50 transition-all duration-300 font-paragraph"
                  />
                  {resumeFileName && (
                    <p className="mt-2 text-sm text-foreground/70 font-paragraph">
                      <Upload className="w-4 h-4 inline mr-2" />
                      {resumeFileName}
                    </p>
                  )}
                  {extractError && (
                    <p className="mt-2 text-sm text-progress-red font-paragraph">{extractError}</p>
                  )}
                </div>

                {resumeExtractedText && (
                  <div className="bg-background/50 border border-background rounded-xl p-4">
                    <p className="text-sm font-heading text-foreground mb-2">Extracted Resume Preview</p>
                    <p className="text-sm text-foreground/70 font-paragraph leading-relaxed">
                      {resumeExtractedText.slice(0, 280)}
                      {resumeExtractedText.length > 280 ? '...' : ''}
                    </p>
                  </div>
                )}

                {isApplying && (
                  <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    <span className="text-primary font-paragraph">Analyzing resume and scoring application...</span>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={isApplying || !resumeExtractedText}
                    className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-paragraph font-semibold hover:scale-105 transition-all duration-300 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isApplying ? 'Submitting...' : 'Submit Application'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowApplicationForm(false)}
                    disabled={isApplying}
                    className="px-8 py-3 bg-transparent text-primary border-2 border-primary rounded-xl font-paragraph font-semibold hover:scale-105 transition-all duration-300 hover:bg-card-background disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
