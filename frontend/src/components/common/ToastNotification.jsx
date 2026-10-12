import React from 'react';
import { Bell, X, ArrowRight, Eye, Award, Video } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';

export const ToastNotification = () => {
  const { toastNotification, closeToast } = useNotifications();
  const navigate = useNavigate();

  if (!toastNotification) return null;

  const getIcon = () => {
    switch (toastNotification.type) {
      case 'APPLICATION_VIEWED':
        return <Eye className="w-5 h-5 text-indigo-500" />;
      case 'APPLICATION_SHORTLISTED':
        return <Award className="w-5 h-5 text-emerald-500" />;
      case 'INTERVIEW_SCHEDULED':
        return <Video className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  const handleAction = () => {
    closeToast();
    if (toastNotification.relatedApplicationId) {
      navigate('/candidate/applications');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-white rounded-2xl shadow-2xl border border-slate-200/80 p-4 transition-all animate-bounce-subtle">
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 truncate">
              {toastNotification.title}
            </h4>
            <button
              onClick={closeToast}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="mt-1 text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {toastNotification.message}
          </p>
          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              onClick={handleAction}
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              <span>View ATS Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToastNotification;
