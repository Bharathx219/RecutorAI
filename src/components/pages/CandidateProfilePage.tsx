import { useState } from 'react';
import { motion } from 'framer-motion';
import CandidateSidebar from '@/components/CandidateSidebar';
import { User, Mail, FileText, Save, UploadCloud, Loader2 } from 'lucide-react';
import { extractPdfTextFromFile } from '@/integrations';

export default function CandidateProfilePage() {
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john.doe@example.com');
  const [bio, setBio] = useState('Experienced software developer with a passion for AI and machine learning.');
  const [resumeFileName, setResumeFileName] = useState('');
  const [extractedResumeText, setExtractedResumeText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setExtractError('');
    setExtractedResumeText('');

    if (!file) {
      setResumeFileName('');
      return;
    }

    const looksLikePdf =
      file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

    if (!looksLikePdf) {
      setResumeFileName('');
      setExtractError('Please upload a PDF file only.');
      return;
    }

    setResumeFileName(file.name);
    setIsExtracting(true);

    try {
      const extracted = await extractPdfTextFromFile(file);

      if (!extracted) {
        setExtractError('Could not extract readable text from this PDF. Try a text-based PDF.');
      } else {
        setExtractedResumeText(extracted);
      }
    } catch {
      setExtractError('Failed to process PDF. Please try another file.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <CandidateSidebar />

      <main className="flex-1 p-8">
        <div className="max-w-[100rem] mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-heading font-bold text-foreground mb-2">Profile</h1>
            <p className="text-foreground/70 font-paragraph">Manage your profile and upload your resume</p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card-background rounded-2xl p-8 shadow-[0_10px_20px_rgba(0,0,0,0.2)]"
          >
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-paragraph font-medium text-foreground mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-background text-foreground rounded-xl border border-card-background focus:border-input-glow focus:outline-none focus:ring-2 focus:ring-input-glow/50 transition-all duration-300 font-paragraph"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-paragraph font-medium text-foreground mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-background text-foreground rounded-xl border border-card-background focus:border-input-glow focus:outline-none focus:ring-2 focus:ring-input-glow/50 transition-all duration-300 font-paragraph"
                />
              </div>

              <div>
                <label htmlFor="resumeFile" className="block text-sm font-paragraph font-medium text-foreground mb-2 flex items-center gap-2">
                  <UploadCloud className="w-4 h-4" />
                  Upload Resume (PDF)
                </label>
                <input
                  id="resumeFile"
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleResumeUpload}
                  className="w-full px-4 py-3 bg-background text-foreground rounded-xl border border-card-background file:mr-4 file:rounded-lg file:border-0 file:bg-primary/20 file:px-3 file:py-2 file:text-primary file:font-semibold focus:border-input-glow focus:outline-none focus:ring-2 focus:ring-input-glow/50 transition-all duration-300 font-paragraph"
                />
                {resumeFileName && (
                  <p className="mt-2 text-sm text-foreground/70 font-paragraph">
                    Selected: {resumeFileName}
                  </p>
                )}
                {isExtracting && (
                  <div className="mt-3 bg-primary/10 border border-primary/30 rounded-xl p-3 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    <span className="text-primary text-sm font-paragraph">Extracting text from PDF...</span>
                  </div>
                )}
                {extractError && (
                  <p className="mt-2 text-sm text-red-400 font-paragraph">{extractError}</p>
                )}
              </div>

              <div>
                <label htmlFor="resumeText" className="block text-sm font-paragraph font-medium text-foreground mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Extracted Resume Text
                </label>
                <textarea
                  id="resumeText"
                  value={extractedResumeText}
                  onChange={(e) => setExtractedResumeText(e.target.value)}
                  rows={8}
                  placeholder="Extracted resume content will appear here after uploading a PDF."
                  className="w-full px-4 py-3 bg-background text-foreground rounded-xl border border-card-background focus:border-input-glow focus:outline-none focus:ring-2 focus:ring-input-glow/50 transition-all duration-300 font-paragraph resize-y"
                />
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-paragraph font-medium text-foreground mb-2">
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-background text-foreground rounded-xl border border-card-background focus:border-input-glow focus:outline-none focus:ring-2 focus:ring-input-glow/50 transition-all duration-300 font-paragraph resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-xl font-paragraph font-semibold hover:scale-105 transition-all duration-300 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <Save className="w-5 h-5" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
