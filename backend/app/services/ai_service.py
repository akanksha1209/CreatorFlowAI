import os
import json
import asyncio
import httpx
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

load_dotenv()


class AIService:
    def __init__(self):
        self.api_key = os.getenv("AI_API_KEY")

        # Primary model from .env
        self.model = os.getenv("AI_MODEL", "gemini-3.7-flash")

        self.base_url = os.getenv(
            "AI_BASE_URL",
            "https://generativelanguage.googleapis.com/v1beta/openai/"
        )

        # Fallback models
        self.fallback_models = [
            self.model,
            "gemini-3.6-flash",
            "gemini-3.5-flash",
            "gemini-2.5-flash",
            "gemini-2.5-flash-lite",
        ]

        # Remove duplicates while preserving order
        self.fallback_models = list(dict.fromkeys(self.fallback_models))

        if not self.api_key:
            raise ValueError("AI_API_KEY environment variable is required")

    async def _make_ai_request(
        self,
        prompt: str,
        system_prompt: str = None
    ) -> Dict[str, Any]:
        """
        Send a request to Gemini with retry and model fallback.
        """

        messages = []

        if system_prompt:
            messages.append({
                "role": "system",
                "content": system_prompt
            })

        messages.append({
            "role": "user",
            "content": prompt
        })

        last_error = None

        for model in self.fallback_models:

            payload = {
                "model": model,
                "messages": messages,
                "temperature": 0.7,
                "max_tokens": 4000
            }

            # Try each model up to 2 times
            for attempt in range(2):

                try:
                    print(
                        f"AI request: model={model}, "
                        f"attempt={attempt + 1}"
                    )

                    async with httpx.AsyncClient(timeout=45.0) as client:

                        response = await client.post(
                            f"{self.base_url}chat/completions",
                            headers={
                                "Authorization": f"Bearer {self.api_key}",
                                "Content-Type": "application/json"
                            },
                            json=payload
                        )

                    # Temporary server-side errors
                    if response.status_code in [429, 500, 502, 503, 504]:

                        print(
                            f"Model {model} returned "
                            f"{response.status_code}"
                        )

                        last_error = (
                            f"AI service error "
                            f"{response.status_code}: "
                            f"{response.text}"
                        )

                        # Wait before retrying
                        if attempt == 0:
                            await asyncio.sleep(2)
                            continue

                        # Move to next model
                        break

                    response.raise_for_status()

                    result = response.json()

                    # Make sure Gemini returned content
                    if not result.get("choices"):
                        raise Exception(
                            "AI returned no choices in response"
                        )

                    message = result["choices"][0].get("message", {})
                    content = message.get("content")

                    if not content:
                        raise Exception(
                            "AI returned empty content"
                        )

                    print(f"AI request successful using {model}")

                    return self._parse_response(content)

                except httpx.TimeoutException:
                    last_error = "AI service timeout"

                    print(
                        f"Timeout with {model}, "
                        f"attempt {attempt + 1}"
                    )

                    if attempt == 0:
                        await asyncio.sleep(2)
                        continue

                    break

                except httpx.HTTPStatusError as e:

                    last_error = (
                        f"AI service error "
                        f"{e.response.status_code}: "
                        f"{e.response.text}"
                    )

                    print(last_error)

                    if attempt == 0:
                        await asyncio.sleep(2)
                        continue

                    break

                except Exception as e:

                    last_error = f"AI service failed: {str(e)}"

                    print(last_error)

                    # Don't immediately abandon the request
                    if attempt == 0:
                        await asyncio.sleep(1)
                        continue

                    break

        # Every model failed
        raise Exception(
            f"All AI models failed. Last error: {last_error}"
        )

    def _parse_response(self, content: str) -> Dict[str, Any]:
        """
        Safely parse JSON returned by the AI.
        Handles markdown code fences and extra text.
        """

        content = content.strip()

        # Normal JSON
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            pass

        # Remove markdown code fences
        if content.startswith("```"):
            lines = content.splitlines()

            if lines and lines[0].startswith("```"):
                lines = lines[1:]

            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]

            cleaned = "\n".join(lines).strip()

            try:
                return json.loads(cleaned)
            except json.JSONDecodeError:
                pass

        # Try extracting the JSON object
        start = content.find("{")
        end = content.rfind("}")

        if start != -1 and end != -1 and end > start:

            json_text = content[start:end + 1]

            try:
                return json.loads(json_text)
            except json.JSONDecodeError:
                pass

        # If JSON cannot be parsed, preserve the response
        return {
            "response": content
        }

    async def analyze_topic(self, topic: str) -> Dict[str, Any]:
        """Analyze a topic and return structured analysis."""

        system_prompt = """
You are CreatorFlow AI, an expert content strategist.

Analyze the user's topic and create a practical content strategy.

IMPORTANT:
- Return ONLY valid JSON.
- Do not use markdown.
- Do not add explanations outside the JSON.
- Do not invent real-time trends or competitor research.
- If current trend data is unavailable, clearly say that trend relevance is an estimate based on general content patterns.
- Viral potential is an estimate, NOT a guarantee.
- Make the analysis specific to the user's topic.
- Do not use hard-coded assumptions about fashion, AI, education, or any other category.

Return exactly these fields:

{
    "topic": "original topic",
    "summary": "brief summary",
    "content_intent": "educational|entertainment|inspirational|promotional|news|tutorial|review|comparison",
    "target_audience": "specific target audience",
    "audience_reasoning": "why this audience fits",
    "best_platform": "instagram|youtube|both",
    "platform_reasoning": "why this platform fits",
    "best_format": "short_form|long_form|both",
    "format_reasoning": "why this format fits",
    "topic_potential": "assessment of topic potential",
    "viral_potential_score": 0,
    "viral_potential_reasoning": "reasoning for score",
    "trend_relevance": "current/general trend relevance assessment",
    "trend_reasoning": "reasoning and limitations",
    "competition_level": "low|medium|high",
    "content_gap": "potential content gap",
    "differentiation_strategy": "how the creator can stand out",
    "recommended_tone": "professional|casual|enthusiastic|authoritative|friendly|humorous",
    "recommended_length": "recommended content length",
    "key_points": [
        "point 1",
        "point 2",
        "point 3"
    ],
    "things_to_avoid": [
        "avoid 1",
        "avoid 2",
        "avoid 3"
    ]
}
"""

        prompt = f"""
Analyze this topic for CreatorFlow AI:

"{topic}"

Determine:

1. What type of content this topic is best suited for.
2. The most relevant target audience.
3. Whether Instagram, YouTube, or both are best.
4. Whether short-form, long-form, or both are best.
5. Topic potential.
6. Viral potential estimate from 0 to 100.
7. Why the topic may or may not perform well.
8. Trend relevance.
9. Competition level.
10. Potential content gaps.
11. Ways to differentiate.
12. Recommended tone.
13. Recommended length.
14. Key points.
15. Things to avoid.

Base the reasoning on audience psychology, content strategy,
platform characteristics, discoverability, engagement potential,
and the characteristics of the topic itself.

Remember:
The viral score is only an estimate and must never be presented
as a guarantee.
"""

        result = await self._make_ai_request(
            prompt,
            system_prompt
        )

        # If AI returned plain text instead of structured JSON
        if "response" in result and "summary" not in result:

            raise Exception(
                "AI returned an invalid analysis format. "
                "Expected structured JSON."
            )

        # Validate and normalize result
        try:
            viral_score = int(
                result.get("viral_potential_score", 50)
            )
        except (TypeError, ValueError):
            viral_score = 50

        viral_score = max(0, min(100, viral_score))

        validated_result = {
            "topic": topic,

            "summary": result.get(
                "summary",
                f"Analysis of {topic}"
            ),

            "content_intent": result.get(
                "content_intent",
                "educational"
            ),

            "target_audience": result.get(
                "target_audience",
                "People interested in this topic"
            ),

            "audience_reasoning": result.get(
                "audience_reasoning",
                "Based on the topic's relevance to the audience."
            ),

            "best_platform": result.get(
                "best_platform",
                "both"
            ),

            "platform_reasoning": result.get(
                "platform_reasoning",
                "Selected based on likely audience behavior."
            ),

            "best_format": result.get(
                "best_format",
                "short_form"
            ),

            "format_reasoning": result.get(
                "format_reasoning",
                "Selected based on topic complexity and engagement."
            ),

            "topic_potential": result.get(
                "topic_potential",
                "Moderate potential"
            ),

            "viral_potential_score": viral_score,

            "viral_potential_reasoning": result.get(
                "viral_potential_reasoning",
                "Estimated from topic characteristics and audience appeal."
            ),

            "trend_relevance": result.get(
                "trend_relevance",
                "Trend relevance cannot be verified without current trend data."
            ),

            "trend_reasoning": result.get(
                "trend_reasoning",
                "This is an estimate rather than verified real-time trend data."
            ),

            "competition_level": result.get(
                "competition_level",
                "medium"
            ),

            "content_gap": result.get(
                "content_gap",
                "A fresh perspective may create an opportunity."
            ),

            "differentiation_strategy": result.get(
                "differentiation_strategy",
                "Use a specific angle, examples, or original perspective."
            ),

            "recommended_tone": result.get(
                "recommended_tone",
                "friendly"
            ),

            "recommended_length": result.get(
                "recommended_length",
                "Medium"
            ),

            "key_points": result.get(
                "key_points",
                []
            ),

            "things_to_avoid": result.get(
                "things_to_avoid",
                []
            )
        }

        return validated_result

    async def generate_content(
        self,
        topic: str,
        analysis: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate complete content package."""

        system_prompt = """
You are CreatorFlow AI, an expert content creator.

Generate a complete content package based on the topic and analysis.

Return ONLY valid JSON with exactly these fields:

{
    "titles": ["title1", "title2", "title3", "title4", "title5"],
    "hooks": ["hook1", "hook2", "hook3", "hook4", "hook5"],
    "script": "complete script",
    "caption": "platform-specific caption",
    "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5", "hashtag6", "hashtag7", "hashtag8"],
    "cta": "call to action",
    "alternative_angles": [
        {
            "name": "angle1",
            "concept": "description",
            "why_it_could_work": "reason"
        },
        {
            "name": "angle2",
            "concept": "description",
            "why_it_could_work": "reason"
        },
        {
            "name": "angle3",
            "concept": "description",
            "why_it_could_work": "reason"
        }
    ],
    "future_ideas": [
        "idea1",
        "idea2",
        "idea3",
        "idea4",
        "idea5"
    ],
    "repurposing_suggestions": {
        "youtube_long_form": [],
        "instagram_reel": [],
        "carousel": [],
        "community_post": []
    }
}
"""

        analysis_summary = f"""
Topic: {topic}
Content Intent: {analysis.get('content_intent')}
Target Audience: {analysis.get('target_audience')}
Best Platform: {analysis.get('best_platform')}
Best Format: {analysis.get('best_format')}
Recommended Tone: {analysis.get('recommended_tone')}
Recommended Length: {analysis.get('recommended_length')}
Key Points: {', '.join(analysis.get('key_points', []))}
Things to Avoid: {', '.join(analysis.get('things_to_avoid', []))}
"""

        prompt = f"""
Create a complete content package for:

{analysis_summary}

Generate:

1. Five different titles.
2. Five different hooks.
3. A complete script appropriate for the recommended format.
4. A platform-appropriate caption.
5. 8-15 relevant hashtags.
6. A suitable CTA.
7. Three alternative content angles.
8. Five future content ideas.
9. Repurposing suggestions.

Everything must be specific to the topic.
Do not use generic filler.
"""

        result = await self._make_ai_request(
            prompt,
            system_prompt
        )

        if "response" in result and "titles" not in result:
            raise Exception(
                "AI returned an invalid content format."
            )

        return {
            "titles": result.get("titles", []),
            "hooks": result.get("hooks", []),
            "script": result.get("script", ""),
            "caption": result.get("caption", ""),
            "hashtags": result.get("hashtags", []),
            "cta": result.get("cta", ""),
            "alternative_angles": result.get(
                "alternative_angles",
                []
            ),
            "future_ideas": result.get(
                "future_ideas",
                []
            ),
            "repurposing_suggestions": result.get(
                "repurposing_suggestions",
                {}
            )
        }

    async def chat_with_context(
        self,
        project_id: int,
        user_message: str,
        chat_history: List[Dict],
        project_context: Dict
    ) -> Dict[str, Any]:
        """Handle chat with project context."""

        system_prompt = """
You are CreatorFlow AI, an AI assistant helping a content creator.

You have access to the project topic, analysis, generated content,
and recent conversation.

Help with:

- Improving titles
- Improving hooks
- Rewriting scripts
- Making content shorter
- Making content longer
- Changing tone
- Adapting content for Instagram
- Adapting content for YouTube
- Converting short-form to long-form
- Converting long-form to short-form
- Brainstorming
- Improving CTAs
- Improving captions
- Hashtag suggestions

Return ONLY valid JSON:

{
    "response": "conversational response",
    "updated_content": null
}

If content was modified, updated_content should contain:

{
    "titles": [],
    "hooks": [],
    "script": "",
    "caption": "",
    "hashtags": [],
    "cta": ""
}
"""

        history_text = "\n".join([
            f"{msg.get('type', 'user').title()}: "
            f"{msg.get('content', '')}"
            for msg in chat_history[-10:]
        ])

        prompt = f"""
Project Context:

Topic:
{project_context.get('topic')}

Analysis:
{json.dumps(
    project_context.get('analysis', {}),
    indent=2
)}

Recent Conversation:
{history_text}

Current User Message:
"{user_message}"

Respond helpfully and update the content when requested.
"""

        result = await self._make_ai_request(
            prompt,
            system_prompt
        )

        return {
            "response": result.get(
                "response",
                "I'm here to help you refine your content!"
            ),
            "updated_content": result.get(
                "updated_content"
            )
        }