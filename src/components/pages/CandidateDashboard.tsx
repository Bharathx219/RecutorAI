import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import CandidateSidebar from '@/components/CandidateSidebar';
import { BaseCrudService } from '@/integrations';
import { Applications } from '@/entities';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';

export default function CandidateDashboard() {
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

  // Calculate average match score
  const averageScore = applications.length > 0
    ? Math.round(applications.reduce((sum, app) => sum + (app.matchScore || 0), 0) / applications.length)
    : 0;

  return (
    <div className="flex min-h-screen bg-background">
      <CandidateSidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-[100rem] mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-heading font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-foreground/70 font-paragraph">Track your applications and AI match scores</p>
          </div>

          {/* AI Match Score Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card-background rounded-2xl p-8 mb-8 shadow-[0_10px_20px_rgba(0,0,0,0.2)]"
          >
            <h2 className="text-2xl font-heading font-semibold text-foreground mb-6">AI Resume Match Score</h2>
            
            <div className="flex items-center justify-center mb-8">
              <div className="relative w-48 h-48">
                {/* Circular Progress */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-background"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 88}`}
                    strokeDashoffset={`${2 * Math.PI * 88 * (1 - averageScore / 100)}`}
                    className={averageScore >= 70 ? 'text-progress-green' : 'text-primary'}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-5xl font-heading font-bold text-foreground">{averageScore}%</span>
                </div>
              </div>
            </div>

            <p className="text-center text-foreground/70 font-paragraph">
              Average match score across all applications
            </p>
          </motion.div>

          {/* Applications List */}
          <div className="mb-8">
            <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">Recent Applications</h2>
            
            <div className="min-h-[400px]">
              {isLoading ? null : applications.length === 0 ? (
                <div className="bg-card-background rounded-2xl p-12 text-center shadow-[0_10px_20px_rgba(0,0,0,0.2)]">
                  <p className="text-foreground/70 font-paragraph mb-4">No applications yet</p>
                  <Link
                    to="/candidate/browse-jobs"
                    className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-xl font-paragraph font-semibold hover:scale-105 transition-all duration-300 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                  >
                    Browse Jobs
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {applications.map((app, index) => (
                    <motion.div
                      key={app._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="bg-card-background rounded-2xl p-6 shadow-[0_10px_20px_rgba(0,0,0,0.2)] hover:scale-105 transition-all duration-300"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-heading font-semibold text-foreground mb-1">
                            {app.jobReference || 'Job Application'}
                          </h3>
                          <p className="text-foreground/70 font-paragraph text-sm">{app.candidateName}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-2xl font-heading font-bold ${
                            (app.matchScore || 0) >= 70 ? 'text-progress-green' : 'text-primary'
                          }`}>
                            {app.matchScore || 0}%
                          </span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <span className={`inline-block px-3 py-1 rounded-lg text-sm font-paragraph font-medium ${
                          app.applicationStatus === 'Approved' ? 'bg-progress-green/20 text-progress-green' :
                          app.applicationStatus === 'Rejected' ? 'bg-progress-red/20 text-progress-red' :
                          'bg-primary/20 text-primary'
                        }`}>
                          {app.applicationStatus || 'Pending'}
                        </span>
                      </div>

                      {/* AI Feedback */}
                      {app.strengths && (
                        <div className="mb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-4 h-4 text-progress-green" />
                            <span className="text-sm font-paragraph font-semibold text-progress-green">Strengths</span>
                          </div>
                          <p className="text-sm text-foreground/70 font-paragraph line-clamp-2">{app.strengths}</p>
                        </div>
                      )}

                      {app.missingSkills && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingDown className="w-4 h-4 text-progress-red" />
                            <span className="text-sm font-paragraph font-semibold text-progress-red">Areas to Improve</span>
                          </div>
                          <p className="text-sm text-foreground/70 font-paragraph line-clamp-2">{app.missingSkills}</p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
