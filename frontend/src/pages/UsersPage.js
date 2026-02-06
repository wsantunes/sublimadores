import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Trash2, Calendar, Shield } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function UsersPage({ user }) {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isAccessDialogOpen, setIsAccessDialogOpen] = useState(false);
  const [accessUntil, setAccessUntil] = useState('');
  
  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchUsers();
  }, [user, navigate]);
  
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('session_token');
      const response = await axios.get(`${BACKEND_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      toast.error('Erro ao carregar usuários');
    }
  };
  
  const handleRoleChange = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('session_token');
      await axios.put(`${BACKEND_URL}/api/users/${userId}/role`, { role: newRole }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Permissão atualizada com sucesso');
      fetchUsers();
    } catch (error) {
      toast.error('Erro ao atualizar permissão');
    }
  };
  
  const handleToggleActive = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem('session_token');
      await axios.put(`${BACKEND_URL}/api/users/${userId}/access`, 
        { is_active: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Usuário ${!currentStatus ? 'ativado' : 'desativado'} com sucesso`);
      fetchUsers();
    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
  };
  
  const handleOpenAccessDialog = (u) => {
    setSelectedUser(u);
    setAccessUntil(u.access_until || '');
    setIsAccessDialogOpen(true);
  };
  
  const handleUpdateAccessUntil = async () => {
    try {
      const token = localStorage.getItem('session_token');
      await axios.put(`${BACKEND_URL}/api/users/${selectedUser.user_id}/access`, 
        { access_until: accessUntil || '' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Data de acesso atualizada com sucesso');
      setIsAccessDialogOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao atualizar data de acesso');
    }
  };
  
  const handleDelete = async (userId) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) return;
    
    try {
      const token = localStorage.getItem('session_token');
      await axios.delete(`${BACKEND_URL}/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Usuário excluído com sucesso');
      fetchUsers();
    } catch (error) {
      toast.error('Erro ao excluir usuário');
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
          <h1 className="text-3xl md:text-4xl font-heading font-bold tracking-tight text-foreground">Usuários</h1>
          <p className="text-base text-muted-foreground mt-1">Gerencie permissões de acesso</p>
        </div>
        
        <div className="px-4 md:px-8 lg:px-12 py-8">
          <div className="bg-white border border-border rounded-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-surface border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground/70">Nome</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground/70">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground/70">Permissão</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground/70">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground/70">Acesso Até</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground/70">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isExpired = u.access_until && new Date(u.access_until) < new Date();
                  return (
                    <tr key={u.user_id} className="border-b border-border hover:bg-surface/50 transition-colors" data-testid="user-row">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {u.picture ? (
                            <img src={u.picture} alt={u.name} className="w-10 h-10 rounded-full" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="font-medium text-foreground">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{u.email}</td>
                      <td className="px-6 py-4">
                        <Select value={u.role} onValueChange={(value) => handleRoleChange(u.user_id, value)} disabled={u.user_id === user.user_id}>
                          <SelectTrigger className="w-32 rounded-sm bg-surface-highlight border-transparent" data-testid="role-select">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="viewer">Visualizador</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={u.is_active !== false}
                            onCheckedChange={() => handleToggleActive(u.user_id, u.is_active !== false)}
                            disabled={u.user_id === user.user_id}
                            data-testid="active-switch"
                          />
                          <span className={`text-xs font-medium uppercase tracking-wider ${u.is_active !== false ? 'text-success' : 'text-muted-foreground'}`}>
                            {u.is_active !== false ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          onClick={() => handleOpenAccessDialog(u)}
                          size="sm"
                          variant="outline"
                          className="rounded-sm text-xs"
                          disabled={u.user_id === user.user_id}
                          data-testid="access-date-button"
                        >
                          <Calendar size={14} className="mr-1" />
                          {u.access_until ? (
                            <span className={isExpired ? 'text-error' : ''}>
                              {new Date(u.access_until).toLocaleDateString('pt-BR')}
                            </span>
                          ) : (
                            'Ilimitado'
                          )}
                        </Button>
                      </td>
                      <td className="px-6 py-4">
                        {u.user_id !== user.user_id && (
                          <Button
                            onClick={() => handleDelete(u.user_id)}
                            size="sm"
                            variant="destructive"
                            className="rounded-sm"
                            data-testid="delete-user-button"
                          >
                            <Trash2 size={14} />
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <Dialog open={isAccessDialogOpen} onOpenChange={setIsAccessDialogOpen}>
            <DialogContent className="rounded-sm">
              <DialogHeader>
                <DialogTitle className="font-heading flex items-center gap-2">
                  <Shield className="text-primary" size={20} />
                  Controle de Acesso
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 mb-2 block">
                    Usuário: {selectedUser?.name}
                  </Label>
                  <p className="text-sm text-muted-foreground mb-4">{selectedUser?.email}</p>
                </div>
                
                <div>
                  <Label htmlFor="access-until" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">
                    Acesso Permitido Até
                  </Label>
                  <Input
                    id="access-until"
                    type="date"
                    value={accessUntil}
                    onChange={(e) => setAccessUntil(e.target.value)}
                    className="mt-1 rounded-sm bg-surface-highlight border-transparent focus:border-primary"
                    data-testid="access-until-input"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Deixe vazio para acesso ilimitado
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleUpdateAccessUntil}
                    className="flex-1 rounded-sm bg-primary text-white hover:bg-primary/90"
                    data-testid="save-access-button"
                  >
                    Salvar
                  </Button>
                  <Button
                    onClick={() => setIsAccessDialogOpen(false)}
                    variant="outline"
                    className="flex-1 rounded-sm"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}