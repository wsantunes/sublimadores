import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const hasProcessed = useRef(false);
  
  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;
    
    const processSession = async () => {
      try {
        const hash = location.hash;
        const params = new URLSearchParams(hash.substring(1));
        const sessionId = params.get('session_id');
        
        if (!sessionId) {
          navigate('/login');
          return;
        }
        
        const response = await axios.get(`${BACKEND_URL}/api/auth/session`, {
          headers: { 'X-Session-ID': sessionId },
          withCredentials: true
        });
        
        localStorage.setItem('session_token', response.data.session_token);
        navigate('/dashboard', { state: { user: response.data.user }, replace: true });
      } catch (error) {
        console.error('Session processing failed:', error);
        navigate('/login');
      }
    };
    
    processSession();
  }, [navigate, location]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-pulse text-muted-foreground mb-2">Processando autenticação...</div>
      </div>
    </div>
  );
}