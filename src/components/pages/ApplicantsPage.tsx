import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RecruiterSidebar from '@/components/RecruiterSidebar';
import { BaseCrudService, generateInterviewQuestionSetSmart } from '@/integrations';
import { Applications, InterviewQuestions } from '@/entities';
import { X, Sparkles, Loader2, FileText } from 'lucide-react';
import { getSessionUser } from '@/lib/session';

export default function ApplicantsPage() {
  const [applications, setApplications] = useState<Applications[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState<Applications | null>(null);
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestions | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setIsLoading(true);
    const result = await BaseCrudService.getAll<Applications>('applications');
    setApplications(result.items);
    setIsLoading(false);
  };

  const loadExistingQuestions = async (applicationId?: string) => {
    if (!applicationId) return null;
    const questionResult = await BaseCrudService.getAll<InterviewQuestions>('interviewquestions');
    return questionResult.items.find((item) => item.applicationReference === applicationId) ?? null;
  };

  const generateInterviewQuestions = async (applicant: Applications) => {
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    const session = getSessionUser();

    const generated = await generateInterviewQuestionSetSmart({
      candidateName: applicant.candidateName,
      jobTitle: applicant.jobReference,
      requiredSkills: applicant.jobRequiredSkills,
      matchedSkills: applicant.matchedSkills,
      missingSkills: applicant.missingSkills,
      resumeSummary: applicant.resumeSummary,
      variationSeed: `${applicant._id || ''}|${applicant.candidateId || ''}|${Date.now()}`,
    });

    const questions: InterviewQuestions = {
      _id: crypto.randomUUID(),
      recruiterId: session?.userId,
      candidateId: applicant.candidateId,
      applicationReference: applicant._id,
      candidateName: applicant.candidateName,
      technicalQuestions: generated.technicalQuestions,
      behavioralQuestions: generated.behavioralQuestions,
      scenarioQuestions: generated.scenarioQuestions,
      notes: generated.notes,
      generatedDate: new Date().toISOString(),
    };

    await BaseCrudService.create<InterviewQuestions>('interviewquestions', questions);
    setInterviewQuestions(questions);
    setIsGenerating(false);
  };

  const handleApplicantClick = async (applicant: Applications) => {
    setSelectedApplicant(applicant);
    setInterviewQuestions(null);
    const existing = await loadExistingQuestions(applicant._id);
    if (existing) setInterviewQuestions(existing);
  };

  const closePanel = () => {
    setSelectedApplicant(null);
    setInterviewQuestions(null);
  };

  const splitList = (value?: string): string[] =>
    (value || '')
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);

  return (
    <div className="flex min-h-screen bg-background">
      <RecruiterSidebar />

      <main className="flex-1 p-8 relative">
        <div className="max-w-[100rem] mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-heading font-bold text-foreground mb-2">Applicants</h1>
            <p className="text-foreground/70 font-paragraph">Review resumes, match insights, and interview questions</p>
          </div>

          <div className="bg-card-background rounded-2xl shadow-[0_10px_20px_rgba(0,0,0,0.2)] overflow-hidden min-h-[600px]">
            {isLoading ? null : applications.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-foreground/70 font-paragraph">No applicants yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-background border-b border-background/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-paragraph font-semibold text-foreground">Candidate</th>
                      <th className="px-6 py-4 text-left text-sm font-paragraph font-semibold text-foreground">Job</th>
                      <th className="px-6 py-4 text-left text-sm font-paragraph font-semibold text-foreground">Resume</th>
                      <th className="px-6 py-4 text-left text-sm font-paragraph font-semibold text-foreground">Match Score</th>
                      <th className="px-6 py-4 text-left text-sm font-paragraph font-semibold text-foreground">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-paragraph font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app, index) => (
                      <motion.tr
                        key={app._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="border-b border-background/30 hover:bg-background/50 transition-colors duration-300 cursor-pointer"
                        onClick={() => handleApplicantClick(app)}
                      >
                        <td className="px-6 py-4 font-paragraph text-foreground">{app.candidateName}</td>
                        <td className="px-6 py-4 font-paragraph text-foreground/70">{app.jobReference}</td>
                        <td className="px-6 py-4 font-paragraph text-foreground/70">{app.resumeFileName || 'Uploaded PDF'}</td>
                        <td className="px-6 py-4">
                          <span className={`text-lg font-heading font-bold ${(app.matchScore || 0) >= 70 ? 'text-progress-green' : 'text-primary'}`}>
                            {app.matchScore || 0}%
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-lg text-sm font-paragraph font-medium ${
                            app.applicationStatus === 'Approved' ? 'bg-progress-green/20 text-progress-green' :
                            app.applicationStatus === 'Rejected' ? 'bg-progress-red/20 text-progress-red' :
                            'bg-primary/20 text-primary'
                          }`}>
                            {app.applicationStatus || 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApplicantClick(app);
                            }}
                            className="text-primary hover:text-secondary transition-colors duration-300 font-paragraph text-sm font-semibold"
                          >
                            View Details
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {selectedApplicant && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closePanel}
                className="fixed inset-0 bg-black/50 z-40"
              />

              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed right-0 top-0 h-full w-full max-w-2xl bg-card-background shadow-2xl z-50 overflow-y-auto"
              >
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-3xl font-heading font-bold text-foreground mb-2">{selectedApplicant.candidateName}</h2>
                      <p className="text-foreground/70 font-paragraph">{selectedApplicant.jobReference}</p>
                    </div>
                    <button onClick={closePanel} className="p-2 hover:bg-background rounded-xl transition-colors duration-300">
                      <X className="w-6 h-6 text-foreground/70" />
                    </button>
                  </div>

                  <div className="bg-background rounded-xl p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-foreground/70 font-paragraph">AI Match Score</span>
                      <span className={`text-4xl font-heading font-bold ${(selectedApplicant.matchScore || 0) >= 70 ? 'text-progress-green' : 'text-primary'}`}>
                        {selectedApplicant.matchScore || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-background/50 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${(selectedApplicant.matchScore || 0) >= 70 ? 'bg-progress-green' : 'bg-primary'}`}
                        style={{ width: `${selectedApplicant.matchScore || 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-background rounded-xl p-6 mb-6">
                    <h3 className="text-lg font-heading font-semibold text-foreground mb-2">Resume Summary</h3>
                    <p className="text-foreground/70 font-paragraph leading-relaxed">
                      {selectedApplicant.resumeSummary || 'No summary available.'}
                    </p>
                    <p className="text-xs text-foreground/50 font-paragraph mt-3">
                      File: {selectedApplicant.resumeFileName || 'Uploaded PDF'}
                    </p>
                  </div>

                  {splitList(selectedApplicant.matchedSkills).length > 0 && (
                    <div className="bg-progress-green/10 border border-progress-green/20 rounded-xl p-6 mb-6">
                      <h3 className="text-lg font-heading font-semibold text-progress-green mb-3">Matched Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {splitList(selectedApplicant.matchedSkills).map((skill) => (
                          <span key={skill} className="px-3 py-1 bg-progress-green/20 text-progress-green rounded-lg text-sm font-paragraph">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedApplicant.missingSkills && (
                    <div className="bg-progress-red/10 border border-progress-red/20 rounded-xl p-6 mb-6">
                      <h3 className="text-lg font-heading font-semibold text-progress-red mb-3">Missing Skills</h3>
                      <p className="text-foreground/70 font-paragraph leading-relaxed">{selectedApplicant.missingSkills}</p>
                    </div>
                  )}

                  {!interviewQuestions && (
                    <button
                      onClick={() => generateInterviewQuestions(selectedApplicant)}
                      disabled={isGenerating}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-paragraph font-semibold hover:scale-105 transition-all duration-300 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Generating Questions...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          Generate Interview Questions
                        </>
                      )}
                    </button>
                  )}

                  {interviewQuestions && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-6"
                    >
                      <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 flex items-center gap-3">
                        <Sparkles className="w-5 h-5 text-primary" />
                        <span className="text-primary font-paragraph font-semibold">AI-Generated Interview Questions</span>
                      </div>

                      {interviewQuestions.notes && (
                        <div className="bg-background rounded-xl p-6">
                          <h3 className="text-xl font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            Interview Context
                          </h3>
                          <p className="text-foreground/70 font-paragraph leading-relaxed whitespace-pre-line">
                            {interviewQuestions.notes}
                          </p>
                        </div>
                      )}

                      {interviewQuestions.technicalQuestions && (
                        <div className="bg-background rounded-xl p-6">
                          <h3 className="text-xl font-heading font-semibold text-foreground mb-4">Technical Questions</h3>
                          <p className="text-foreground/70 font-paragraph leading-relaxed whitespace-pre-line">
                            {interviewQuestions.technicalQuestions}
                          </p>
                        </div>
                      )}

                      {interviewQuestions.behavioralQuestions && (
                        <div className="bg-background rounded-xl p-6">
                          <h3 className="text-xl font-heading font-semibold text-foreground mb-4">Behavioral Questions</h3>
                          <p className="text-foreground/70 font-paragraph leading-relaxed whitespace-pre-line">
                            {interviewQuestions.behavioralQuestions}
                          </p>
                        </div>
                      )}

                      {interviewQuestions.scenarioQuestions && (
                        <div className="bg-background rounded-xl p-6">
                          <h3 className="text-xl font-heading font-semibold text-foreground mb-4">Scenario Questions</h3>
                          <p className="text-foreground/70 font-paragraph leading-relaxed whitespace-pre-line">
                            {interviewQuestions.scenarioQuestions}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
