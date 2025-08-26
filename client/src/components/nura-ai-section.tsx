import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

interface NuraAISectionProps {
  title: string;
  description: string;
  children: ReactNode;
  variant?: 'default' | 'compact';
}

export default function NuraAISection({ 
  title, 
  description, 
  children, 
  variant = 'default' 
}: NuraAISectionProps) {
  if (variant === 'compact') {
    return (
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 border-indigo-200 dark:border-indigo-800">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <Sparkles className="text-white h-4 w-4" />
            </div>
            <span className="text-indigo-900 dark:text-indigo-100">{title}</span>
            <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 text-xs">
              AI-Powered
            </Badge>
          </CardTitle>
          <p className="text-sm text-indigo-700 dark:text-indigo-300">{description}</p>
        </CardHeader>
        <CardContent className="pt-0">
          {children}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 border-indigo-200 dark:border-indigo-800">
      <CardHeader>
        <CardTitle className="flex items-center space-x-3 text-xl">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Sparkles className="text-white h-5 w-5" />
          </div>
          <span className="text-indigo-900 dark:text-indigo-100">{title}</span>
          <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
            AI-Powered
          </Badge>
        </CardTitle>
        <p className="text-indigo-700 dark:text-indigo-300">{description}</p>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}