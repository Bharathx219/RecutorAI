import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Briefcase, FileText, User, Sparkles } from 'lucide-react';

export default function CandidateSidebar() {
  const location = useLocation();

  const navItems = [
    { path: '/candidate/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/candidate/browse-jobs', label: 'Browse Jobs', icon: Briefcase },
    { path: '/candidate/applications', label: 'My Applications', icon: FileText },
    { path: '/candidate/profile', label: 'Profile', icon: User },
  ];

  return (
    <aside className="w-64 bg-card-background min-h-screen border-r border-background/50 flex flex-col">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-3 p-6 border-b border-background/50">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-primary-foreground" />
        </div>
        <h1 className="text-xl font-heading font-bold text-foreground">RecruiterAI</h1>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-paragraph font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                      : 'text-foreground/70 hover:bg-background hover:text-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-background/50">
        <Link
          to="/"
          className="text-foreground/70 hover:text-primary transition-colors duration-300 font-paragraph text-sm"
        >
          ← Back to Home
        </Link>
      </div>
    </aside>
  );
}
