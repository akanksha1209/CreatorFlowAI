import { useEffect, useState } from 'react';
import { Settings as SettingsIcon, Save, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

const DEFAULT_SETTINGS = { creatorName: '', preferredLanguage: 'en', defaultTone: 'professional', contentStyle: 'educational', theme: 'light' };
const STORAGE_KEY = 'creatorflow.settings';

export const Settings = () => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
  }, [settings.theme]);

  const update = <K extends keyof typeof DEFAULT_SETTINGS>(key: K, value: typeof DEFAULT_SETTINGS[K]) => {
    setSettings(current => ({ ...current, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSaved(true);
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem(STORAGE_KEY);
    setSaved(false);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3"><SettingsIcon className="h-6 w-6 text-primary" /><h1 className="text-2xl font-bold">Settings</h1></div>
      <Card><CardHeader><CardTitle>Profile</CardTitle></CardHeader><CardContent className="space-y-4">
        <div className="space-y-2"><Label htmlFor="creatorName">Creator Name</Label><Input id="creatorName" placeholder="Your name" value={settings.creatorName} onChange={e => update('creatorName', e.target.value)} /></div>
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Preferences</CardTitle></CardHeader><CardContent className="space-y-4">
        <div className="space-y-2"><Label htmlFor="language">Preferred Language</Label><Select value={settings.preferredLanguage} onValueChange={v => update('preferredLanguage', v)}><SelectTrigger id="language"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="en">English</SelectItem><SelectItem value="es">Spanish</SelectItem><SelectItem value="fr">French</SelectItem><SelectItem value="de">German</SelectItem><SelectItem value="pt">Portuguese</SelectItem><SelectItem value="hi">Hindi</SelectItem></SelectContent></Select></div>
        <div className="space-y-2"><Label htmlFor="tone">Default Tone</Label><Select value={settings.defaultTone} onValueChange={v => update('defaultTone', v)}><SelectTrigger id="tone"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="professional">Professional</SelectItem><SelectItem value="casual">Casual</SelectItem><SelectItem value="enthusiastic">Enthusiastic</SelectItem><SelectItem value="authoritative">Authoritative</SelectItem><SelectItem value="friendly">Friendly</SelectItem><SelectItem value="humorous">Humorous</SelectItem></SelectContent></Select></div>
        <div className="space-y-2"><Label htmlFor="style">Content Style</Label><Select value={settings.contentStyle} onValueChange={v => update('contentStyle', v)}><SelectTrigger id="style"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="educational">Educational</SelectItem><SelectItem value="entertainment">Entertainment</SelectItem><SelectItem value="inspirational">Inspirational</SelectItem><SelectItem value="promotional">Promotional</SelectItem></SelectContent></Select></div>
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Appearance</CardTitle></CardHeader><CardContent className="flex items-center justify-between"><Label htmlFor="theme">Dark Mode</Label><Switch id="theme" checked={settings.theme === 'dark'} onCheckedChange={checked => update('theme', checked ? 'dark' : 'light')} /></CardContent></Card>
      <div className="flex items-center gap-3"><Button onClick={handleSave}><Save className="h-4 w-4" />Save Settings</Button><Button variant="outline" onClick={handleReset}><RotateCcw className="h-4 w-4" />Reset</Button>{saved && <Badge variant="success">Saved on this device</Badge>}</div>
    </div>
  );
};
