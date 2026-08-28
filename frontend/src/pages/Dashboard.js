import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import ImageGallery from '@/components/ImageGallery';
import FilterBar from '@/components/FilterBar';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

export default function Dashboard({ user }) {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('all');
  const [eventId, setEventId] = useState('all');
  
  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('session_token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const params = {};
      if (search) params.search = search;
      if (categoryId !== 'all') params.category_id = categoryId;
      if (eventId !== 'all') params.event_id = eventId;
      
      const [imagesRes, categoriesRes, eventsRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/images`, { headers, params }),
        axios.get(`${BACKEND_URL}/api/categories`, { headers }),
        axios.get(`${BACKEND_URL}/api/events`, { headers })
      ]);
      
      setImages(imagesRes.data);
      setCategories(categoriesRes.data);
      setEvents(eventsRes.data);
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, [search, categoryId, eventId]);
  
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('session_token');
      await axios.post(`${BACKEND_URL}/api/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      localStorage.removeItem('session_token');
      navigate('/login');
      toast.success('Logout realizado com sucesso');
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('session_token');
      navigate('/login');
    }
  };
  
  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta imagem?')) return;
    
    try {
      const token = localStorage.getItem('session_token');
      await axios.delete(`${BACKEND_URL}/api/images/${imageId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Imagem excluída com sucesso');
      fetchData();
    } catch (error) {
      toast.error('Erro ao excluir imagem');
    }
  };
  
  return (
    <div className="flex min-h-screen bg-background" data-testid="dashboard">
      <Sidebar user={user} onLogout={handleLogout} />
      
      <div className="flex-1 md:ml-64">
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-border px-4 md:px-8 lg:px-12 py-6">
          <h1 className="text-3xl md:text-4xl font-heading font-bold tracking-tight text-foreground">Galeria</h1>
          <p className="text-base text-muted-foreground mt-1">Navegue pelos modelos de sublimação</p>
        </div>
        
        <div className="px-4 md:px-8 lg:px-12 py-8">
          <FilterBar
            search={search}
            onSearchChange={setSearch}
            categoryId={categoryId}
            onCategoryChange={setCategoryId}
            eventId={eventId}
            onEventChange={setEventId}
            categories={categories}
            events={events}
          />
          
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-pulse text-muted-foreground">Carregando...</div>
            </div>
          ) : (
            <ImageGallery
              images={images}
              onDelete={handleDeleteImage}
              userRole={user?.role}
            />
          )}
        </div>
      </div>
    </div>
  );
}