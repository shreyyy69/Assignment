import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { GraduationCap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LoginPageProps {
  onLogin: (email: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (email.toLowerCase() === 'demouser' && password === 'demopass') {
      onLogin(email);
    } else {
      toast({
        title: 'Invalid credentials',
        description: 'Use demouser/demopass to sign in',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <GraduationCap className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Lesson Planner</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to create and manage your lesson plans
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
            />
          </div>
          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Demo credentials: demouser / demopass
        </p>
      </Card>
    </div>
  );
}