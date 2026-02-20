import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import RecruiterSidebar from '@/components/RecruiterSidebar';
import { BaseCrudService } from '@/integrations';
import { JobListings, Applications } from '@/entities';
import { Briefcase, Users, TrendingUp } from 'lucide-react';

export default function RecruiterDashboard() {
  const [jobs, setJobs] = useState<JobListings[]>([]);
  const [applications, setApplications] = useState<Applications[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [jobsResult, appsResult] = await Promise.all([
      BaseCrudService.getAll<JobListings>('jobs'),
      BaseCrudService.getAll<Applications>('applications')
    ]);
    setJobs(jobsResult.items);
    setApplications(appsResult.items);
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <RecruiterSidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-[100rem] mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-heading font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-foreground/70 font-paragraph">Overview of your recruitment activities</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-card-background rounded-2xl p-6 shadow-[0_10px_20px_rgba(0,0,0,0.2)]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-foreground/70 font-paragraph text-sm">Active Jobs</p>
                  <p className="text-3xl font-heading font-bold text-foreground">{jobs.length}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-card-background rounded-2xl p-6 shadow-[0_10px_20px_rgba(0,0,0,0.2)]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-foreground/70 font-paragraph text-sm">Total Applicants</p>
                  <p className="text-3xl font-heading font-bold text-foreground">{applications.length}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-card-background rounded-2xl p-6 shadow-[0_10px_20px_rgba(0,0,0,0.2)]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-progress-green/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-progress-green" />
                </div>
                <div>
                  <p className="text-foreground/70 font-paragraph text-sm">Avg Match Score</p>
                  <p className="text-3xl font-heading font-bold text-foreground">
                    {applications.length > 0
                      ? Math.round(applications.reduce((sum, app) => sum + (app.matchScore || 0), 0) / applications.length)
                      : 0}%
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Recent Jobs */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-heading font-semibold text-foreground">Recent Job Posts</h2>
              <Link
                to="/recruiter/post-job"
                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-paragraph font-semibold hover:scale-105 transition-all duration-300 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]"
              >
                Post New Job
              </Link>
            </div>

            <div className="min-h-[300px]">
              {isLoading ? null : jobs.length === 0 ? (
                <div className="bg-card-background rounded-2xl p-12 text-center shadow-[0_10px_20px_rgba(0,0,0,0.2)]">
                  <p className="text-foreground/70 font-paragraph mb-4">No jobs posted yet</p>
                  <Link
                    to="/recruiter/post-job"
                    className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-xl font-paragraph font-semibold hover:scale-105 transition-all duration-300 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                  >
                    Post Your First Job
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {jobs.slice(0, 4).map((job, index) => (
                    <motion.div
                      key={job._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="bg-card-background rounded-2xl p-6 shadow-[0_10px_20px_rgba(0,0,0,0.2)] hover:scale-105 transition-all duration-300"
                    >
                      <h3 className="text-xl font-heading font-semibold text-foreground mb-2">
                        {job.jobTitle}
                      </h3>
                      <p className="text-foreground/70 font-paragraph text-sm mb-3">
                        {job.companyName} • {job.jobLocation}
                      </p>
                      {job.experienceLevel && (
                        <span className="inline-block px-3 py-1 bg-primary/20 text-primary rounded-lg text-sm font-paragraph font-medium">
                          {job.experienceLevel}
                        </span>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link to="/recruiter/applicants">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-gradient-to-br from-primary to-secondary rounded-2xl p-8 shadow-[0_10px_20px_rgba(0,0,0,0.2)] hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                <Users className="w-12 h-12 text-primary-foreground mb-4" />
                <h3 className="text-2xl font-heading font-bold text-primary-foreground mb-2">
                  View Applicants
                </h3>
                <p className="text-primary-foreground/90 font-paragraph">
                  Review candidates and generate interview questions
                </p>
              </motion.div>
            </Link>

            <Link to="/recruiter/post-job">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-card-background rounded-2xl p-8 shadow-[0_10px_20px_rgba(0,0,0,0.2)] hover:scale-105 transition-all duration-300 cursor-pointer border-2 border-primary/30"
              >
                <Briefcase className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-2xl font-heading font-bold text-foreground mb-2">
                  Post New Job
                </h3>
                <p className="text-foreground/70 font-paragraph">
                  Create a new job listing and start receiving applications
                </p>
              </motion.div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
