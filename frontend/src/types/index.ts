export interface TopicAnalysis {
  id: number;
  topic: string;
  summary: string;
  content_intent: string;
  target_audience: string;
  audience_reasoning: string;
  best_platform: string;
  platform_reasoning: string;
  best_format: string;
  format_reasoning: string;
  topic_potential: string;
  viral_potential_score: number;
  viral_potential_reasoning: string;
  trend_relevance: string;
  trend_reasoning: string;
  competition_level: string;
  content_gap: string;
  differentiation_strategy: string;
  recommended_tone: string;
  recommended_length: string;
  key_points: string[];
  things_to_avoid: string[];
}

export interface GeneratedContent {
  project_id: number;
  titles: string[];
  hooks: string[];
  script: string;
  caption: string;
  hashtags: string[];
  cta: string;
  alternative_angles: Array<{
    name: string;
    concept: string;
    why_it_could_work: string;
  }>;
  future_ideas: string[];
  repurposing_suggestions: {
    youtube_long_form: string[];
    instagram_reel: string[];
    carousel: string[];
    community_post: string[];
  };
}

export interface ChatMessage {
  id: number;
  message_type: 'user' | 'ai';
  content: string;
  created_at: string;
}

export interface Project {
  id: number;
  topic: string;
  summary?: string;
  content_intent?: string;
  target_audience?: string;
  audience_reasoning?: string;
  best_platform?: string;
  platform_reasoning?: string;
  best_format?: string;
  format_reasoning?: string;
  topic_potential?: string;
  viral_potential_score?: number;
  viral_potential_reasoning?: string;
  trend_relevance?: string;
  trend_reasoning?: string;
  competition_level?: string;
  content_gap?: string;
  differentiation_strategy?: string;
  recommended_tone?: string;
  recommended_length?: string;
  key_points?: string[];
  things_to_avoid?: string[];
  created_at: string;
  updated_at?: string;
  is_saved?: boolean;
}

export interface ProjectVersion {
  id: number;
  project_id: number;
  version_number: number;
  titles: string[];
  hooks: string[];
  script: string;
  caption: string;
  hashtags: string[];
  cta: string;
  alternative_angles: Array<{
    name: string;
    concept: string;
    why_it_could_work: string;
  }>;
  future_ideas: string[];
  repurposing_suggestions: {
    youtube_long_form: string[];
    instagram_reel: string[];
    carousel: string[];
    community_post: string[];
  };
  created_at: string;
}

export interface ProjectHistory {
  project: Project;
  versions: ProjectVersion[];
  chat_messages: ChatMessage[];
}

export interface SavedProject {
  id: number;
  project_id: number;
  is_favorite: boolean;
  created_at: string;
}

export interface UserSettings {
  creator_name: string;
  preferred_language: string;
  default_tone: string;
  content_style: string;
  theme: string;
}