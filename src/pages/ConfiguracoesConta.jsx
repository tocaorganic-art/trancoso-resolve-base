import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { User, Lock, Bell, Save, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const NOTIFICATION_PREFS = [
  {
    key: 'pedidos',
    label: 'Atualizações de pedidos e agendamentos',
    description: 'Avisos sobre confirmações, cancelamentos e novos pedidos de serviço.'
  },
  {
    key: 'mensagens',
    label: 'Novas mensagens',
    description: 'Notificações quando você receber mensagens de clientes ou prestadores.'
  },
  {
    key: 'marketing',
    label: 'Novidades e promoções',
    description: 'E-mails ocasionais sobre novidades da plataforma e ofertas da região.'
  }
];

export default function ConfiguracoesConta() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dados pessoais
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Alterar senha
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // Notificações
  const [prefs, setPrefs] = useState({ pedidos: true, mensagens: true, marketing: false });
  const [savingPrefs, setSavingPrefs] = useState(false);

  useEffect(() => {
    document.title = 'Configurações da Conta - Trancoso Resolve';
    base44.auth.me()
      .then((u) => {
        setUser(u);
        setFullName(u?.full_name || '');
        setPhone(u?.phone || '');
        if (u?.notification_preferences) {
          setPrefs((p) => ({ ...p, ...u.notification_preferences }));
        }
      })
      .catch(() => toast.error('Não foi possível carregar seus dados.'))
      .finally(() => setLoading(false));
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error('Informe seu nome completo.');
      return;
    }
    setSavingProfile(true);
    try {
      await base44.auth.updateMe({ full_name: fullName.trim(), phone });
      toast.success('Dados pessoais atualizados!');
    } catch {
      toast.error('Erro ao salvar. Tente novamente.');
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('A confirmação da nova senha não confere.');
      return;
    }
    setSavingPassword(true);
    try {
      await base44.auth.changePassword({
        userId: user.id,
        currentPassword,
        newPassword
      });
      toast.success('Senha alterada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err?.message?.includes('password')
        ? 'Senha atual incorreta. Verifique e tente novamente.'
        : 'Não foi possível alterar a senha. Verifique a senha atual.');
    } finally {
      setSavingPassword(false);
    }
  };

  const savePrefs = async (newPrefs) => {
    setPrefs(newPrefs);
    setSavingPrefs(true);
    try {
      await base44.auth.updateMe({ notification_preferences: newPrefs });
    } catch {
      toast.error('Erro ao salvar preferências.');
    } finally {
      setSavingPrefs(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-10 px-4">
      <div className="container mx-auto max-w-2xl space-y-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-3xl font-bold">Configurações da Conta</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie seus dados pessoais, senha e preferências de notificação.
          </p>
        </motion.div>

        {/* Dados pessoais */}
        <Card className="border-border shadow-warm-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <User className="w-5 h-5 text-primary" /> Dados Pessoais
            </CardTitle>
            <CardDescription>Atualize as informações exibidas na sua conta.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={saveProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome completo</Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Seu nome completo" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailDisplay">E-mail</Label>
                <Input id="emailDisplay" value={user?.email || ''} disabled />
                <p className="text-xs text-muted-foreground">O e-mail de acesso não pode ser alterado nesta página.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone / WhatsApp</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(73) 9 9999-9999" />
              </div>
              <Button type="submit" disabled={savingProfile} className="bg-brand-primary text-white hover:bg-orange-600">
                {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Salvar dados
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Alterar senha */}
        <Card className="border-border shadow-warm-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Lock className="w-5 h-5 text-primary" /> Alterar Senha
            </CardTitle>
            <CardDescription>Mantenha sua conta segura com uma senha forte.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={changePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Senha atual</Label>
                <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova senha</Label>
                <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} />
              </div>
              <Button type="submit" disabled={savingPassword} className="bg-brand-primary text-white hover:bg-orange-600">
                {savingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                Alterar senha
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Notificações */}
        <Card className="border-border shadow-warm-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Bell className="w-5 h-5 text-primary" /> Preferências de Notificação
            </CardTitle>
            <CardDescription>Escolha o que você quer receber por e-mail.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {NOTIFICATION_PREFS.map((pref) => (
              <div key={pref.key} className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-sm">{pref.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{pref.description}</p>
                </div>
                <Switch
                  checked={!!prefs[pref.key]}
                  onCheckedChange={(checked) => savePrefs({ ...prefs, [pref.key]: checked })}
                  aria-label={pref.label}
                />
              </div>
            ))}
            {savingPrefs && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin" /> Salvando preferências...
              </p>
            )}
            {!savingPrefs && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> Preferências salvas automaticamente.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}