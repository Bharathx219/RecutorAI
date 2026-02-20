// HPI 1.7-G
import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { 
  Briefcase, 
  Users, 
  Sparkles, 
  ScanLine, 
  BrainCircuit, 
  MessageSquareCode, 
  ArrowRight, 
  CheckCircle2, 
  ChevronRight,
  Cpu,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Image } from '@/components/ui/image';

// --- Utility Components ---

const SectionDivider = () => (
  <div className="w-full flex justify-center items-center py-12 opacity-20">
    <div className="h-px w-full max-w-[200px] bg-gradient-to-r from-transparent via-primary to-transparent" />
    <div className="w-2 h-2 rounded-full bg-primary mx-4" />
    <div className="h-px w-full max-w-[200px] bg-gradient-to-r from-transparent via-primary to-transparent" />
  </div>
);

const GridBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#1E293B_1px,transparent_1px),linear-gradient(to_bottom,#1E293B_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
    <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-primary/5 via-transparent to-transparent blur-3xl" />
  </div>
);

// --- Feature Card Component ---

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  index: number;
}

const FeatureCard = ({ icon: Icon, title, description, index }: FeatureCardProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative p-8 rounded-3xl bg-card-background border border-white/5 hover:border-primary/30 transition-colors duration-500 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10">
        <div className="w-14 h-14 rounded-2xl bg-background border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_30px_-10px_rgba(59,130,246,0.3)]">
          <Icon className="w-7 h-7 text-primary" />
        </div>
        
        <h3 className="text-2xl font-heading font-bold text-foreground mb-4 group-hover:text-primary transition-colors duration-300">
          {title}
        </h3>
        
        <p className="text-foreground/60 font-paragraph leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

// --- Sticky Scroll Section Component ---

interface StepProps {
  number: string;
  title: string;
  description: string;
  highlights: string[];
  icon: React.ElementType;
  imageSrc: string;
}

const StickyStep = ({ step, index }: { step: StepProps; index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-40% 0px -40% 0px" });

  return (
    <div ref={ref} className="min-h-[80vh] flex items-center justify-center py-20">
      <motion.div 
        className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full max-w-7xl mx-auto px-6 ${isInView ? 'opacity-100 blur-0' : 'opacity-40 blur-sm'} transition-all duration-700`}
      >
        {/* Text Content */}
        <div className={`order-2 ${index % 2 === 0 ? 'lg:order-1' : 'lg:order-2'}`}>
          <div className="flex items-center gap-4 mb-6">
            <span className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-heading font-bold text-xl border border-primary/20">
              {step.number}
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-primary/20 to-transparent" />
          </div>
          
          <h3 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-6 leading-tight">
            {step.title}
          </h3>
          
          <p className="text-lg text-foreground/70 font-paragraph leading-relaxed mb-8">
            {step.description}
          </p>

          <ul className="space-y-4">
            {step.highlights.map((highlight) => (
              <li key={highlight} className="flex items-center gap-3 text-foreground/80 font-paragraph">
                <CheckCircle2 className="w-5 h-5 text-secondary" />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Visual Content */}
        <div className={`order-1 ${index % 2 === 0 ? 'lg:order-2' : 'lg:order-1'}`}>
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 bg-card-background shadow-2xl group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
            <Image
              src={step.imageSrc}
              alt={step.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              width={800}
            />
            
            {/* Floating UI Element */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="absolute bottom-8 left-8 right-8 bg-background/90 backdrop-blur-md p-6 rounded-2xl border border-white/10 z-20"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/20 rounded-xl text-primary">
                  <step.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-heading text-primary uppercase tracking-wider mb-1">System Status</p>
                  <p className="text-sm font-paragraph text-foreground">Processing data stream...</p>
                </div>
                <div className="ml-auto">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <div className="w-2 h-2 rounded-full bg-primary/50" />
                    <div className="w-2 h-2 rounded-full bg-primary/30" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- Main Page Component ---

export default function HomePage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const yHero = useTransform(scrollYProgress, [0, 0.2], [0, 200]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  const steps: StepProps[] = [
    {
      number: "01",
      title: "Post a Job",
      description: "Create complete role briefs in minutes with AI-assisted job drafting, clear requirements, and structured screening criteria.",
      highlights: [
        "Role templates for faster publishing",
        "Skills and experience auto-suggestions",
        "One-click posting workflow"
      ],
      icon: Briefcase,
      imageSrc: "https://static.wixstatic.com/media/1c3c9f_7237333dd54a441aabd30b20c3e6e050~mv2.png?originWidth=768&originHeight=576"
    },
    {
      number: "02",
      title: "Screen Top Candidates",
      description: "Our AI ranks applications by relevance, experience, and fit so your team can focus on high-intent interviews first.",
      highlights: [
        "Semantic resume understanding",
        "Fast shortlist generation",
        "Reduced manual review effort"
      ],
      icon: ScanLine,
      imageSrc: "https://static.wixstatic.com/media/1c3c9f_3cd154f7e47b417cb0f01a59c821fa46~mv2.png?originWidth=768&originHeight=576"
    },
    {
      number: "03",
      title: "Run Better Interviews",
      description: "Generate role-specific interview plans with technical, behavioral, and scenario-based questions tuned to each candidate profile.",
      highlights: [
        "Structured interview kits",
        "Role-specific question sets",
        "Consistent evaluation prompts"
      ],
      icon: MessageSquareCode,
      imageSrc: "https://static.wixstatic.com/media/1c3c9f_e2e23d38bc314261a25164e6945ee9d0~mv2.png?originWidth=768&originHeight=576"
    }
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary-foreground overflow-clip">
      
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="max-w-[120rem] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-heading font-bold tracking-tight">RecruiterAI</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/login" className="text-sm font-paragraph font-medium text-foreground/70 hover:text-primary transition-colors">
              Login
            </Link>
            <Link 
              to="/register" 
              className="group relative px-6 py-2.5 bg-card-background overflow-hidden rounded-xl border border-white/10 transition-all hover:border-primary/50"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative text-sm font-paragraph font-semibold text-foreground group-hover:text-white transition-colors">
                Get Started
              </span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-24">
        <GridBackground />
        
        <div className="max-w-[120rem] mx-auto px-6 relative z-10 w-full">
          <motion.div 
            style={{ y: yHero, opacity: opacityHero }}
            className="flex flex-col items-center text-center max-w-5xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-xs font-heading tracking-wider text-foreground/80 uppercase">AI Hiring Platform</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-6xl md:text-8xl font-heading font-bold leading-[0.9] tracking-tight mb-8"
            >
              Smarter Hiring <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-gradient">
                Starts Here
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl font-paragraph text-foreground/60 max-w-2xl mb-12 leading-relaxed"
            >
              A modern hiring workspace for recruiters and candidates. Screen faster, shortlist better, and run stronger interviews.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-6 w-full max-w-lg"
            >
              <Link to="/register?role=recruiter" className="flex-1 group relative block w-full px-8 py-4 bg-primary rounded-xl overflow-hidden transition-all hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.5)]">
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <div className="relative flex items-center justify-center gap-3 text-white font-paragraph font-semibold">
                  <Briefcase className="w-5 h-5" />
                  <span>Hire Talent</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
              
              <Link to="/register?role=candidate" className="flex-1 group block w-full px-8 py-4 bg-transparent border border-white/20 rounded-xl hover:bg-white/5 transition-all">
                <div className="flex items-center justify-center gap-3 text-foreground font-paragraph font-semibold">
                  <Users className="w-5 h-5" />
                  <span>Find Jobs</span>
                </div>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-20 pointer-events-none" />
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-white/5 bg-card-background/30 backdrop-blur-sm">
        <div className="max-w-[120rem] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Candidates Screened", value: "10k+", icon: Users },
              { label: "Time Saved", value: "85%", icon: Zap },
              { label: "Match Accuracy", value: "98%", icon: ShieldCheck },
              { label: "Questions Generated", value: "50k+", icon: BrainCircuit },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center justify-center text-center group">
                <div className="mb-3 p-3 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="w-6 h-6" />
                </div>
                <h4 className="text-3xl font-heading font-bold text-foreground mb-1">{stat.value}</h4>
                <p className="text-sm font-paragraph text-foreground/50 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section - Sticky Scroll */}
      <section className="relative py-32">
        <div className="max-w-[120rem] mx-auto px-6 mb-24 text-center">
          <h2 className="text-4xl md:text-6xl font-heading font-bold mb-6">
            A Better <span className="text-primary">Hiring Workflow</span>
          </h2>
          <p className="text-xl text-foreground/60 max-w-2xl mx-auto font-paragraph">
            A clear three-step process for posting roles, screening candidates, and conducting high-quality interviews.
          </p>
        </div>

        <div className="relative">
          {/* Connecting Line */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent hidden lg:block" />
          
          {steps.map((step, index) => (
            <StickyStep key={index} step={step} index={index} />
          ))}
        </div>
      </section>

      <SectionDivider />

      {/* Features Grid */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 skew-y-3 transform origin-top-left pointer-events-none" />
        
        <div className="max-w-[120rem] mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
                Engineered for <span className="text-secondary">Excellence</span>
              </h2>
              <p className="text-lg text-foreground/70 font-paragraph">
                Built to help teams hire faster without sacrificing quality.
              </p>
            </div>
            <Link to="/register" className="flex items-center gap-2 text-primary font-heading font-bold hover:gap-4 transition-all">
              View All Features <ChevronRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              index={0}
              icon={Cpu}
              title="Neural Matching"
              description="Our AI goes beyond keywords, understanding context, soft skills, and potential to find the perfect cultural fit."
            />
            <FeatureCard 
              index={1}
              icon={ShieldCheck}
              title="Bias Elimination"
              description="Algorithmic fairness protocols ensure every candidate is evaluated purely on merit and capability."
            />
            <FeatureCard 
              index={2}
              icon={Zap}
              title="Instant Analysis"
              description="Process hundreds of applications in seconds. Let AI handle the noise while you focus on the talent."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative">
        <div className="max-w-[120rem] mx-auto px-6">
          <div className="relative rounded-[3rem] overflow-hidden bg-gradient-to-br from-primary/20 to-card-background border border-white/10 p-12 md:p-24 text-center">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('https://static.wixstatic.com/media/1c3c9f_42fe818fd466444a932876783da5151b~mv2.png?originWidth=768&originHeight=576')] opacity-10 bg-cover bg-center mix-blend-overlay" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-full bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="relative z-10 max-w-4xl mx-auto">
              <h2 className="text-5xl md:text-7xl font-heading font-bold mb-8 tracking-tight">
                Ready to Upgrade Your <br />
                <span className="text-white">Hiring OS?</span>
              </h2>
              <p className="text-xl text-foreground/80 font-paragraph mb-12 max-w-2xl mx-auto">
                Join teams and job seekers using RecruiterAI to make hiring faster and decisions smarter.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <Link to="/register" className="px-10 py-5 bg-white text-background rounded-xl font-heading font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                  Get Started Now
                </Link>
                <Link to="/login" className="px-10 py-5 bg-transparent border border-white/20 text-white rounded-xl font-heading font-bold text-lg hover:bg-white/10 transition-colors">
                  Go to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-background pt-24 pb-12">
        <div className="max-w-[120rem] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-heading font-bold">RecruiterAI</span>
              </div>
              <p className="text-foreground/60 font-paragraph max-w-md leading-relaxed mb-8">
                RecruiterAI streamlines hiring with AI-powered screening, role-based shortlisting, and structured interview preparation.
              </p>
              <div className="flex gap-4">
                {/* Social placeholders */}
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-colors cursor-pointer">
                    <div className="w-4 h-4 bg-current rounded-sm" />
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h5 className="text-lg font-heading font-bold mb-6 text-white">Platform</h5>
              <ul className="space-y-4 font-paragraph text-foreground/60">
                <li><Link to="/login" className="hover:text-primary transition-colors">Login</Link></li>
                <li><Link to="/register" className="hover:text-primary transition-colors">Register</Link></li>
                <li><Link to="#" className="hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link to="#" className="hover:text-primary transition-colors">Enterprise</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="text-lg font-heading font-bold mb-6 text-white">Contact</h5>
              <ul className="space-y-4 font-paragraph text-foreground/60">
                <li>hello@recruiterai.com</li>
                <li>support@recruiterai.com</li>
                <li className="pt-4 text-xs uppercase tracking-widest opacity-50">Hackathon Project 2026</li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-foreground/40 font-paragraph">
            <p>© 2026 RecruiterAI. All rights reserved.</p>
            <div className="flex gap-8">
              <Link to="#" className="hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link to="#" className="hover:text-foreground transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}



