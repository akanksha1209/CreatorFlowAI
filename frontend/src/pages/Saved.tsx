import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, BookmarkX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { useProjects } from '@/hooks/useProjects';

export const Saved = () => {
  const navigate = useNavigate();
  const { projects, fetchProjects, toggleSave, loading, error } = useProjects();

  useEffect(() => {
    fetchProjects(undefined, true);
  }, [fetchProjects]);

  const savedProjects = projects;

  const handleUnsave = async (id: number) => {
    await toggleSave(id);
    await fetchProjects(undefined, true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Saved Projects</h1>

      {error ? (
        <ErrorState message={error} onRetry={() => fetchProjects(undefined, true)} />
      ) : loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : savedProjects.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved projects"
          description="Save your favorite projects for quick access."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {savedProjects.map((project) => (
            <Card
              key={project.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => navigate(`/analysis/${project.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{project.topic}</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUnsave(project.id);
                    }}
                  >
                    <BookmarkX className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {project.best_platform}
                  </Badge>
                  <Badge variant="secondary" className="capitalize">
                    {project.best_format?.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {formatDate(project.created_at)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};