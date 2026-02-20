import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import CandidateSidebar from '@/components/CandidateSidebar';
import { BaseCrudService } from '@/integrations';
import { JobListings } from '@/entities';
import { Search, MapPin, Briefcase } from 'lucide-react';

export default function BrowseJobsPage() {
  const [jobs, setJobs] = useState<JobListings[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('');

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setIsLoading(true);
    const result = await BaseCrudService.getAll<JobListings>('jobs');
    setJobs(result.items);
    setIsLoading(false);
  };

  // Filter jobs based on search and filter
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = !searchTerm || 
      job.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.requiredSkills?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLevel = !filterLevel || job.experienceLevel === filterLevel;
    
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="flex min-h-screen bg-background">
      <CandidateSidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-[100rem] mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-heading font-bold text-foreground mb-2">Browse Jobs</h1>
            <p className="text-foreground/70 font-paragraph">Find your next opportunity</p>
          </div>

          {/* Search and Filter */}
          <div className="bg-card-background rounded-2xl p-6 mb-8 shadow-[0_10px_20px_rgba(0,0,0,0.2)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-foreground/50" />
                <input
                  type="text"
                  placeholder="Search by title, skills, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-background text-foreground rounded-xl border border-card-background focus:border-input-glow focus:outline-none focus:ring-2 focus:ring-input-glow/50 transition-all duration-300 font-paragraph"
                />
              </div>

              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="px-4 py-3 bg-background text-foreground rounded-xl border border-card-background focus:border-input-glow focus:outline-none focus:ring-2 focus:ring-input-glow/50 transition-all duration-300 font-paragraph"
              >
                <option value="">All Experience Levels</option>
                <option value="Entry Level">Entry Level</option>
                <option value="Mid Level">Mid Level</option>
                <option value="Senior Level">Senior Level</option>
                <option value="Lead">Lead</option>
              </select>
            </div>
          </div>

          {/* Jobs List */}
          <div className="min-h-[600px]">
            {isLoading ? null : filteredJobs.length === 0 ? (
              <div className="bg-card-background rounded-2xl p-12 text-center shadow-[0_10px_20px_rgba(0,0,0,0.2)]">
                <p className="text-foreground/70 font-paragraph">No jobs found matching your criteria</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredJobs.map((job, index) => (
                  <motion.div
                    key={job._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                  >
                    <Link to={`/candidate/job/${job._id}`}>
                      <div className="bg-card-background rounded-2xl p-6 shadow-[0_10px_20px_rgba(0,0,0,0.2)] hover:scale-105 transition-all duration-300 cursor-pointer">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="text-2xl font-heading font-semibold text-foreground mb-2">
                              {job.jobTitle}
                            </h3>
                            <div className="flex flex-wrap items-center gap-4 text-foreground/70 font-paragraph text-sm mb-3">
                              {job.companyName && (
                                <div className="flex items-center gap-2">
                                  <Briefcase className="w-4 h-4" />
                                  {job.companyName}
                                </div>
                              )}
                              {job.jobLocation && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4" />
                                  {job.jobLocation}
                                </div>
                              )}
                            </div>
                          </div>
                          {job.experienceLevel && (
                            <span className="px-3 py-1 bg-primary/20 text-primary rounded-lg text-sm font-paragraph font-medium">
                              {job.experienceLevel}
                            </span>
                          )}
                        </div>

                        {job.jobDescription && (
                          <p className="text-foreground/70 font-paragraph mb-4 line-clamp-2">
                            {job.jobDescription}
                          </p>
                        )}

                        {job.requiredSkills && (
                          <div className="flex flex-wrap gap-2">
                            {job.requiredSkills.split(',').slice(0, 5).map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-secondary/20 text-secondary rounded-lg text-sm font-paragraph"
                              >
                                {skill.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Link>
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
