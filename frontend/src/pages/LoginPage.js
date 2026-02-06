import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

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
  
  const handleGoogleLogin = () => {
    const redirectUrl = window.location.origin + '/auth/callback';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
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
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest">
              <span className="bg-white px-2 text-muted-foreground">Ou</span>
            </div>
          </div>
          
          <Button
            onClick={handleGoogleLogin}
            variant="outline"
            className="w-full rounded-sm border-border hover:bg-surface uppercase tracking-wider font-medium"
            data-testid="google-login-button"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Entrar com Google
          </Button>
        </div>
      </div>
    </div>
  );
}