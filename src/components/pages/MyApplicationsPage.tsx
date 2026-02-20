import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CandidateSidebar from '@/components/CandidateSidebar';
import { BaseCrudService } from '@/integrations';
import { Applications } from '@/entities';
import { TrendingUp, TrendingDown, ExternalLink, FileText } from 'lucide-react';

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<Applications[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setIsLoading(true);
    const result = await BaseCrudService.getAll<Applications>('applications');
    setApplications(result.items);
    setIsLoading(false);
  };

  const hasExternalResume = (value?: string) =>
    !!value && (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:'));

  return (
    <div className="flex min-h-screen bg-background">
      <CandidateSidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-[100rem] mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-heading font-bold text-foreground mb-2">My Applications</h1>
            <p className="text-foreground/70 font-paragraph">Track your job applications and AI feedback</p>
          </div>

          {/* Applications List */}
          <div className="min-h-[600px]">
            {isLoading ? null : applications.length === 0 ? (
              <div className="bg-card-background rounded-2xl p-12 text-center shadow-[0_10px_20px_rgba(0,0,0,0.2)]">
                <p className="text-foreground/70 font-paragraph mb-4">No applications yet</p>
                <a
                  href="/candidate/browse-jobs"
                  className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-xl font-paragraph font-semibold hover:scale-105 transition-all duration-300 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                >
                  Browse Jobs
                </a>
              </div>
            ) : (
              <div className="space-y-6">
                {applications.map((app, index) => (
                  <motion.div
                    key={app._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="bg-card-background rounded-2xl p-6 shadow-[0_10px_20px_rgba(0,0,0,0.2)] hover:scale-105 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-2xl font-heading font-semibold text-foreground mb-2">
                          {app.jobReference || 'Job Application'}
                        </h3>
                        <p className="text-foreground/70 font-paragraph">{app.candidateName}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm text-foreground/70 font-paragraph mb-1">Match Score</div>
                          <div className={`text-3xl font-heading font-bold ${
                            (app.matchScore || 0) >= 70 ? 'text-progress-green' : 'text-primary'
                          }`}>
                            {app.matchScore || 0}%
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="mb-6">
                      <span className={`inline-block px-4 py-2 rounded-xl text-sm font-paragraph font-medium ${
                        app.applicationStatus === 'Approved' ? 'bg-progress-green/20 text-progress-green' :
                        app.applicationStatus === 'Rejected' ? 'bg-progress-red/20 text-progress-red' :
                        'bg-primary/20 text-primary'
                      }`}>
                        Status: {app.applicationStatus || 'Pending'}
                      </span>
                    </div>

                    {/* AI Feedback Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Strengths */}
                      {app.strengths && (
                        <div className="bg-progress-green/10 rounded-xl p-4 border border-progress-green/20">
                          <div className="flex items-center gap-2 mb-3">
                            <TrendingUp className="w-5 h-5 text-progress-green" />
                            <span className="font-paragraph font-semibold text-progress-green">Strengths</span>
                          </div>
                          <p className="text-foreground/70 font-paragraph text-sm leading-relaxed">
                            {app.strengths}
                          </p>
                        </div>
                      )}

                      {/* Missing Skills */}
                      {app.missingSkills && (
                        <div className="bg-progress-red/10 rounded-xl p-4 border border-progress-red/20">
                          <div className="flex items-center gap-2 mb-3">
                            <TrendingDown className="w-5 h-5 text-progress-red" />
                            <span className="font-paragraph font-semibold text-progress-red">Areas to Improve</span>
                          </div>
                          <p className="text-foreground/70 font-paragraph text-sm leading-relaxed">
                            {app.missingSkills}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Resume Link */}
                    {app.resumeFileName && (
                      <div className="mt-4 pt-4 border-t border-background/50">
                        <div className="inline-flex items-center gap-2 text-foreground/70 font-paragraph text-sm">
                          <FileText className="w-4 h-4" />
                          Uploaded: {app.resumeFileName}
                        </div>
                      </div>
                    )}

                    {hasExternalResume(app.resume) && (
                      <div className="mt-4 pt-4 border-t border-background/50">
                        <a
                          href={app.resume!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-primary hover:text-secondary transition-colors duration-300 font-paragraph text-sm"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View Resume
                        </a>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
