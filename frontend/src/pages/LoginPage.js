import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

export default function LoginPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ email: '', password: '', name: '' });
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/login`, loginData, {
        withCredentials: true
      });
      localStorage.setItem('session_token', response.data.session_token);
      navigate('/dashboard', { state: { user: response.data.user } });
      toast.success('Login realizado com sucesso!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/register`, registerData, {
        withCredentials: true
      });
      localStorage.setItem('session_token', response.data.session_token);
      navigate('/dashboard', { state: { user: response.data.user } });
      toast.success('Conta criada com sucesso!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao criar conta');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-heading font-bold tracking-tight text-foreground mb-2">Sublima</h1>
          <p className="text-base text-muted-foreground">Sua galeria de modelos para sublimação</p>
        </div>
        
        <div className="bg-white border border-border rounded-sm p-6 shadow-sm">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login" className="rounded-sm" data-testid="login-tab">Entrar</TabsTrigger>
              <TabsTrigger value="register" className="rounded-sm" data-testid="register-tab">Criar Conta</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                    className="mt-1 rounded-sm bg-surface-highlight border-transparent focus:border-primary"
                    data-testid="login-email-input"
                  />
                </div>
                <div>
                  <Label htmlFor="login-password" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">Senha</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                    className="mt-1 rounded-sm bg-surface-highlight border-transparent focus:border-primary"
                    data-testid="login-password-input"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-sm bg-primary text-white hover:bg-primary/90 uppercase tracking-wider font-medium"
                  data-testid="login-submit-button"
                >
                  {isLoading ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Label htmlFor="register-name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">Nome</Label>
                  <Input
                    id="register-name"
                    type="text"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    required
                    className="mt-1 rounded-sm bg-surface-highlight border-transparent focus:border-primary"
                    data-testid="register-name-input"
                  />
                </div>
                <div>
                  <Label htmlFor="register-email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    required
                    className="mt-1 rounded-sm bg-surface-highlight border-transparent focus:border-primary"
                    data-testid="register-email-input"
                  />
                </div>
                <div>
                  <Label htmlFor="register-password" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">Senha</Label>
                  <Input
                    id="register-password"
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    required
                    className="mt-1 rounded-sm bg-surface-highlight border-transparent focus:border-primary"
                    data-testid="register-password-input"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-sm bg-primary text-white hover:bg-primary/90 uppercase tracking-wider font-medium"
                  data-testid="register-submit-button"
                >
                  {isLoading ? 'Criando...' : 'Criar Conta'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}