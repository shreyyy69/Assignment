import { useState, useEffect } from 'react';
import { LoginPage } from './pages/LoginPage';
import { LessonPlanner } from './pages/LessonPlanner';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';

type User = {
  email: string;
  isAuthenticated: boolean;
};

function App() {
  const [user, setUser] = useState<User>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : {
      email: '',
      isAuthenticated: false,
    };
  });

  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(user));
  }, [user]);

  const handleLogin = (email: string) => {
    setUser({
      email,
      isAuthenticated: true,
    });
  };

  return (
    <ThemeProvider defaultTheme="light" storageKey="ui-theme">
      <div className="min-h-screen bg-background">
        {!user.isAuthenticated ? (
          <LoginPage onLogin={handleLogin} />
        ) : (
          <LessonPlanner user={user} />
        )}
      </div>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;