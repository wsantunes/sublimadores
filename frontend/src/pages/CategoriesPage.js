import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

export default function CategoriesPage({ user }) {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  
  useEffect(() => {
    fetchCategories();
  }, []);
  
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('session_token');
      const response = await axios.get(`${BACKEND_URL}/api/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(response.data);
    } catch (error) {
      toast.error('Erro ao carregar categorias');
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('session_token');
      
      if (editingCategory) {
        await axios.put(`${BACKEND_URL}/api/categories/${editingCategory.category_id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Categoria atualizada com sucesso');
      } else {
        await axios.post(`${BACKEND_URL}/api/categories`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Categoria criada com sucesso');
      }
      
      setIsDialogOpen(false);
      setEditingCategory(null);
      setFormData({ name: '', description: '' });
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao salvar categoria');
    }
  };
  
  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description || '' });
    setIsDialogOpen(true);
  };
  
  const handleDelete = async (categoryId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta categoria?')) return;
    
    try {
      const token = localStorage.getItem('session_token');
      await axios.delete(`${BACKEND_URL}/api/categories/${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Categoria excluída com sucesso');
      fetchCategories();
    } catch (error) {
      toast.error('Erro ao excluir categoria');
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
  
  const canEdit = user?.role === 'admin' || user?.role === 'editor';
  const canDelete = user?.role === 'admin';
  
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar user={user} onLogout={handleLogout} />
      
      <div className="flex-1 md:ml-64">
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-border px-4 md:px-8 lg:px-12 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-heading font-bold tracking-tight text-foreground">Categorias</h1>
              <p className="text-base text-muted-foreground mt-1">Organize suas imagens por categorias</p>
            </div>
            {canEdit && (
              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) {
                  setEditingCategory(null);
                  setFormData({ name: '', description: '' });
                }
              }}>
                <DialogTrigger asChild>
                  <Button className="rounded-sm bg-primary text-white hover:bg-primary/90" data-testid="add-category-button">
                    <Plus size={18} className="mr-2" />
                    Nova Categoria
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-sm">
                  <DialogHeader>
                    <DialogTitle className="font-heading">{editingCategory ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">Nome</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="mt-1 rounded-sm bg-surface-highlight border-transparent focus:border-primary"
                        data-testid="category-name-input"
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
                        data-testid="category-description-input"
                      />
                    </div>
                    <Button type="submit" className="w-full rounded-sm bg-primary text-white hover:bg-primary/90" data-testid="category-submit-button">
                      {editingCategory ? 'Atualizar' : 'Criar'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
        
        <div className="px-4 md:px-8 lg:px-12 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <div key={category.category_id} className="bg-white border border-border rounded-sm p-6 hover:shadow-lg transition-all duration-200" data-testid="category-card">
                <h3 className="text-xl font-heading font-semibold text-foreground mb-2">{category.name}</h3>
                {category.description && (
                  <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
                )}
                <div className="flex gap-2">
                  {canEdit && (
                    <Button
                      onClick={() => handleEdit(category)}
                      size="sm"
                      variant="outline"
                      className="rounded-sm flex-1"
                      data-testid="edit-category-button"
                    >
                      <Edit size={14} className="mr-1" />
                      Editar
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      onClick={() => handleDelete(category.category_id)}
                      size="sm"
                      variant="destructive"
                      className="rounded-sm"
                      data-testid="delete-category-button"
                    >
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}