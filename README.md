🚀 RecruiterAI
Intelligent AI-Powered Hiring Automation Platform
RecruiterAI is a modern AI-driven recruitment system that automates resume screening, skill matching, and interview question generation.
It enables recruiters to post jobs and instantly receive AI-analyzed candidate insights, reducing manual screening effort and accelerating hiring decisions.

🌍 Problem Statement
Nowadays, companies receive hundreds of resumes for a single job posting. Recruiters spend hours manually:
Screening resumes
Matching skills
Shortlisting candidates
Preparing interview questions
This process is slow, repetitive, and inefficient.

💡 Solution
RecruiterAI automates the recruitment workflow using Artificial Intelligence and MongoDB.
The platform:
Allows recruiters to post jobs
Accepts PDF resumes from candidates
Extracts and analyzes resume content
Calculates skill match score
Generates AI-powered interview questions
Displays everything in a real-time dashboard

🏗 Tech Stack
Frontend
React.js
Tailwind CSS
Modern Dark UI
Responsive Dashboard Design
Backend
Node.js
Express.js
REST APIs
Database
MongoDB (NoSQL document database)
AI Integration
OpenAI GPT API
Resume skill extraction
Interview question generation
Other Tools
PDF parsing library
JWT Authentication
RESTful API architecture

⚙️ How It Works
1️⃣ Recruiter Posts Job
Job title
Description
Required skills
Experience level
Stored in MongoDB jobs collection.
2️⃣ Candidate Applies
Uploads resume (PDF)
Resume text extracted using PDF parser
Application stored in MongoDB applications collection
3️⃣ AI Resume Analysis
After resume upload:
AI extracts candidate skills
Compares with job required skills
Calculates Match Score:
Match % =
(Number of matched skills / Total required skills) × 100
Score stored in database.
4️⃣ AI Interview Question Generation
System sends:
Job description
Required skills
Candidate resume text
AI generates:
Technical questions
Scenario-based questions
Behavioral questions
Skill-gap improvement questions
Saved inside application document.
5️⃣ Recruiter Dashboard
Displays:
Active jobs
Total applicants
Average match score
Candidate-specific AI insights
All data fetched dynamically from MongoDB.

🗂 Database Structure
Users Collection
userId
name
email
role (recruiter/candidate)
Jobs Collection
jobId
recruiterId
title
description
requiredSkills[]
createdAt
Applications Collection
applicationId
jobId
candidateId
resumeText
extractedSkills[]
matchScore
aiGeneratedQuestions[]
createdAt
🔥 Key Features
AI-based resume screening
Automated skill matching
Intelligent interview question generation
Real-time recruiter dashboard
PDF resume parsing
Role-based authentication
Scalable MongoDB architecture
📈 Impact
RecruiterAI reduces manual resume screening time by up to 70% by:
Automating skill extraction
Providing match percentage
Preparing AI-based interview questions instantly
🔮 Future Enhancements
AI-based resume ranking leaderboard
Video interview AI evaluation
Email automation
Skill heatmap analytics
Bias detection in job descriptions.