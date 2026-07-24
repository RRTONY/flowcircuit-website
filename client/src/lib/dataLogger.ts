// Simple utility to log assessment data for validation purposes.
// In a real app, this would send data to a backend API (e.g., Supabase, Firebase).

export interface AssessmentLog {
  timestamp: string;
  sessionId: string;
  answers: Record<number, string | { role: string; text: string }[]>;
  scores: Record<string, number>;
  dominantRole: string;
  birthData?: {
    date: string;
    time: string;
    city: string;
  };
  peerReview?: boolean;
  teamId?: string;
}

export const logAssessmentData = (data: AssessmentLog) => {
  // For now, we'll just log to the console with a specific prefix so we can grep it later.
  // In a production environment, this would be:
  // await fetch('/api/log-assessment', { method: 'POST', body: JSON.stringify(data) });
  
  console.log("--- ASSESSMENT DATA LOG ---");
  console.log(JSON.stringify(data, null, 2));
  console.log("---------------------------");
  
  // Store in local storage for "My Past Results" feature
  const history = JSON.parse(localStorage.getItem("assessmentHistory") || "[]");
  history.push(data);
  localStorage.setItem("assessmentHistory", JSON.stringify(history));
};

export const getAssessmentHistory = (): AssessmentLog[] => {
  return JSON.parse(localStorage.getItem("assessmentHistory") || "[]");
};
