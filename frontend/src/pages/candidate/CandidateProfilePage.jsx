import React, { useState, useEffect } from 'react';
import { User, FileText, Upload, Save, CheckCircle, Plus, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export const CandidateProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const [headline, setHeadline] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [resumes, setResumes] = useState([]);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (user) {
      const prof = user.candidateProfile;
      if (prof) {
        setHeadline(prof.headline || '');
        setLocation(prof.location || '');
        setBio(prof.bio || '');
        if (prof.skills) {
          try {
            setSkills(JSON.parse(prof.skills));
          } catch (e) {
            setSkills(prof.skills.split(',').map((s) => s.trim()));
          }
        }
      }
      fetchResumes();
    }
  }, [user]);

  const fetchResumes = async () => {
    try {
      const res = await api.get('/auth/resumes');
      if (res.success) {
        setResumes(res.resumes);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setMessage(null);
    try {
      const res = await api.patch('/auth/profile', {
        headline,
        location,
        bio,
        skills,
      });
      if (res.success) {
        setMessage('Profile updated successfully!');
        await refreshUser();
      }
    } catch (err) {
      alert(err.message || 'Profile update failed');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Only PDF resume files are supported.');
      return;
    }

    setUploadingResume(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const res = await api.upload('/auth/resumes', formData);
      if (res.success) {
        fetchResumes();
      }
    } catch (err) {
      alert(err.message || 'Resume upload failed');
    } finally {
      setUploadingResume(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Candidate Profile & Resume
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Keep your skills, bio, and resume updated for automated recruiter evaluations.
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSaveProfile} className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-card space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Professional Headline
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Senior Full Stack Engineer (React, Node, Cloud)"
              className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Location / Preference
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Seattle, WA (Open to Remote)"
              className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">
            Bio & Professional Summary
          </label>
          <textarea
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Briefly describe your expertise, key metrics, and projects..."
            className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Skills Tag Manager */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">
            Technical Skills & Technologies
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              placeholder="Add skill (e.g. TypeScript, Docker, GraphQL)"
              className="flex-1 p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-blue-600 transition-colors"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="hover:text-rose-600"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={savingProfile}
          className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{savingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
        </button>
      </form>

      {/* Resume Management Section */}
      <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-card space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Resume Documents</h3>
            <p className="text-xs text-slate-500">
              Upload your latest resume in PDF format for 1-click applications.
            </p>
          </div>

          <div>
            <input
              type="file"
              id="profileResumeUpload"
              accept="application/pdf"
              onChange={handleResumeUpload}
              className="hidden"
            />
            <label
              htmlFor="profileResumeUpload"
              className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-blue-600 transition-colors shadow-sm"
            >
              <Upload className="w-4 h-4" />
              <span>{uploadingResume ? 'Uploading...' : 'Upload PDF'}</span>
            </label>
          </div>
        </div>

        {resumes.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-xs text-slate-500">
            No resume uploaded yet. Click above to upload your PDF resume.
          </div>
        ) : (
          <div className="space-y-3">
            {resumes.map((r) => (
              <div
                key={r.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{r.originalFilename}</h4>
                    <p className="text-slate-400 text-[11px]">
                      Uploaded on {new Date(r.uploadedAt).toLocaleDateString()} • {(r.fileSize / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Ready for Applications
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateProfilePage;
