import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Search, Filter, Trash2, Copy, Bookmark, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useProjects } from '@/hooks/useProjects';
import { Project } from '@/types';

export const History = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const { projects, fetchProjects, removeProject, toggleSave, loading } = useProjects();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.topic.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || project.best_platform === filter;
    return matchesSearch && matchesFilter;
  });

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this project?')) {
      await removeProject(id);
    }
  };

  const handleDuplicate = (project: Project) => {
    navigate(`/new?topic=${encodeURIComponent(project.topic)}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">History</h1>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'instagram' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('instagram')}
          >
            Instagram
          </Button>
          <Button
            variant={filter === 'youtube' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('youtube')}
          >
            YouTube
          </Button>
        </div>
      </div>

      {/* Projects List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No projects yet"
          description="Your content projects will appear here once you create them."
        />
      ) : (
        <div className="grid gap-4">
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => navigate(`/analysis/${project.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">{project.topic}</h3>
                    <p className="text-sm text-muted-foreground">
                      {project.summary?.slice(0, 100)}...
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <Badge variant="outline" className="capitalize">
                        {project.best_platform}
                      </Badge>
                      <Badge variant="secondary" className="capitalize">
                        {project.best_format?.replace('_', ' ')}
                      </Badge>
                      {project.viral_potential_score && (
                        <span className="text-xs text-muted-foreground">
                          Viral: {project.viral_potential_score}/100
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicate(project);
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSave(project.id);
                      }}
                    >
                      <Bookmark className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(project.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
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