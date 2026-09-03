import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, ArrowLeft, FolderUp } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

export default function UploadPage({ user }) {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [importProgress, setImportProgress] = useState(null);
  const [batchCategoryId, setBatchCategoryId] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    category_id: '',
    event_id: '',
    image_data: ''
  });
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      const token = localStorage.getItem('session_token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [categoriesRes, eventsRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/categories`, { headers }),
        axios.get(`${BACKEND_URL}/api/events`, { headers })
      ]);
      
      setCategories(categoriesRes.data);
      setEvents(eventsRes.data);
    } catch (error) {
      toast.error('Erro ao carregar dados');
    }
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem muito grande. Máximo: 5MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, image_data: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleDirectoryImport = async (e) => {
    const files = Array.from(e.target.files || []).filter((file) => file.type.startsWith('image/'));
    e.target.value = '';

    if (files.length === 0) {
      toast.error('Nenhuma imagem encontrada na pasta');
      return;
    }

    const oversizedFile = files.find((file) => file.size > 5 * 1024 * 1024);
    if (oversizedFile) {
      toast.error(`A imagem ${oversizedFile.name} excede o limite de 5MB`);
      return;
    }

    setIsLoading(true);
    setImportProgress({ current: 0, total: files.length });

    try {
      const token = localStorage.getItem('session_token');
      const headers = { Authorization: `Bearer ${token}` };
      const categoryMap = new Map(categories.map((category) => [category.name.toLowerCase(), category.category_id]));
      let imported = 0;

      for (const file of files) {
        let categoryId = batchCategoryId || null;
        let categoryName = batchCategoryId
          ? categories.find((category) => category.category_id === batchCategoryId)?.name || ''
          : '';

        if (!categoryId) {
          // Sem categoria fixada: usa a estrutura de pastas selecionada.
          // webkitRelativePath = "<pastaRaiz>/arquivo.jpg" (sem subpasta) ou
          // "<pastaRaiz>/<subpasta.../>arquivo.jpg" (com subpastas).
          const pathParts = (file.webkitRelativePath || file.name).split('/');
          if (pathParts.length > 2) {
            categoryName = pathParts.slice(1, -1).join(' / ');
          } else if (pathParts.length === 2) {
            categoryName = pathParts[0];
          }

          if (categoryName) {
            const categoryKey = categoryName.toLowerCase();
            categoryId = categoryMap.get(categoryKey);
            if (!categoryId) {
              const categoryResponse = await axios.post(`${BACKEND_URL}/api/categories`, {
                name: categoryName,
                description: 'Criada durante importação de diretório'
              }, { headers });
              categoryId = categoryResponse.data.category_id;
              categoryMap.set(categoryKey, categoryId);
            }
          }
        }

        await axios.post(`${BACKEND_URL}/api/images`, {
          title: file.name.replace(/\.[^/.]+$/, ''),
          description: categoryName ? `Importada de ${categoryName}` : null,
          tags: [],
          category_id: categoryId,
          event_id: null,
          image_data: await readFileAsDataUrl(file)
        }, { headers });

        imported += 1;
        setImportProgress({ current: imported, total: files.length });
      }

      toast.success(`${imported} imagem(ns) importada(s) com sucesso`);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao importar diretório');
    } finally {
      setIsLoading(false);
      setImportProgress(null);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.image_data) {
      toast.error('Selecione uma imagem');
      return;
    }
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('session_token');
      const payload = {
        title: formData.title,
        description: formData.description || null,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : [],
        category_id: formData.category_id || null,
        event_id: formData.event_id || null,
        image_data: formData.image_data
      };
      
      await axios.post(`${BACKEND_URL}/api/images`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Imagem enviada com sucesso!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao enviar imagem');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('session_token');
      await axios.post(`${BACKEND_URL}/api/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.removeItem('session_token');
      navigate('/login');
    } catch (error) {
      localStorage.removeItem('session_token');
      navigate('/login');
    }
  };
  
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar user={user} onLogout={handleLogout} />
      
      <div className="flex-1 md:ml-64">
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-border px-4 md:px-8 lg:px-12 py-6">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="ghost"
            className="mb-4 rounded-sm"
            data-testid="back-button"
          >
            <ArrowLeft size={18} className="mr-2" />
            Voltar
          </Button>
          <h1 className="text-3xl md:text-4xl font-heading font-bold tracking-tight text-foreground">Upload de Imagem</h1>
          <p className="text-base text-muted-foreground mt-1">Adicione novos modelos à galeria</p>
        </div>
        
        <div className="px-4 md:px-8 lg:px-12 py-8">
          <div className="max-w-2xl bg-white border border-border rounded-sm p-6">
            <div className="mb-8 border-b border-border pb-6">
              <div className="flex items-center gap-3 mb-2">
                <FolderUp size={20} className="text-primary" />
                <h2 className="font-heading font-semibold text-lg">Importar diretório</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Por padrão, cada pasta (ou subpasta) vira uma categoria com o mesmo nome.
                Se preferir, escolha abaixo uma categoria fixa para todo o lote.
              </p>
              <div className="mb-4">
                <Label htmlFor="batch-category" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">
                  Categoria do lote (opcional)
                </Label>
                <select
                  id="batch-category"
                  value={batchCategoryId}
                  onChange={(e) => setBatchCategoryId(e.target.value)}
                  className="mt-1 w-full rounded-sm bg-surface-highlight border border-transparent focus:border-primary px-3 py-2 text-sm"
                  disabled={isLoading}
                  data-testid="batch-category-select"
                >
                  <option value="">Detectar automaticamente pelo nome da pasta</option>
                  {categories.map((cat) => (
                    <option key={cat.category_id} value={cat.category_id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                type="file"
                accept="image/*"
                multiple
                webkitdirectory=""
                directory=""
                onChange={handleDirectoryImport}
                disabled={isLoading}
                className="rounded-sm"
                data-testid="directory-input"
              />
              {importProgress && (
                <p className="text-sm text-muted-foreground mt-3">
                  Importando {importProgress.current} de {importProgress.total} imagens...
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="image" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">Imagem</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  required
                  className="mt-1 rounded-sm"
                  data-testid="image-input"
                />
                {formData.image_data && (
                  <img src={formData.image_data} alt="Preview" className="mt-4 max-w-full h-48 object-contain border border-border rounded-sm" />
                )}
              </div>
              
              <div>
                <Label htmlFor="title" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">Título</Label>
                <Input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="mt-1 rounded-sm bg-surface-highlight border-transparent focus:border-primary"
                  data-testid="title-input"
                />
              </div>
              
              <div>
                <Label htmlFor="description" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="mt-1 rounded-sm bg-surface-highlight border-transparent focus:border-primary"
                  data-testid="description-input"
                />
              </div>
              
              <div>
                <Label htmlFor="tags" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">Tags (separadas por vírgula)</Label>
                <Input
                  id="tags"
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="floral, geométrico, colorido"
                  className="mt-1 rounded-sm bg-surface-highlight border-transparent focus:border-primary"
                  data-testid="tags-input"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">Categoria</Label>
                  <select
                    id="category"
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="mt-1 w-full rounded-sm bg-surface-highlight border border-transparent focus:border-primary px-3 py-2 text-sm"
                    data-testid="category-select"
                  >
                    <option value="">Nenhuma</option>
                    {categories.map((cat) => (
                      <option key={cat.category_id} value={cat.category_id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="event" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">Evento</Label>
                  <select
                    id="event"
                    value={formData.event_id}
                    onChange={(e) => setFormData({ ...formData, event_id: e.target.value })}
                    className="mt-1 w-full rounded-sm bg-surface-highlight border border-transparent focus:border-primary px-3 py-2 text-sm"
                    data-testid="event-select"
                  >
                    <option value="">Nenhum</option>
                    {events.map((evt) => (
                      <option key={evt.event_id} value={evt.event_id}>
                        {evt.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-sm bg-primary text-white hover:bg-primary/90 uppercase tracking-wider font-medium"
                data-testid="upload-submit-button"
              >
                {isLoading ? 'Enviando...' : 'Enviar Imagem'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}