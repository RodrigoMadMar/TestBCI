import { BCI_SYSTEM_PROMPT } from './bci-context';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';

interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ClaudeOptions {
  maxTokens?: number;
  systemPrompt?: string;
}

export async function callClaude(
  prompt: string,
  options: ClaudeOptions = {}
): Promise<string> {
  const { maxTokens = 4096, systemPrompt = BCI_SYSTEM_PROMPT } = options;

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }] as ClaudeMessage[],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error ${response.status}: ${error}`);
  }

  const data = await response.json();
  return data.content[0].text as string;
}

export async function callClaudeStream(
  prompt: string,
  options: ClaudeOptions = {}
): Promise<ReadableStream> {
  const { maxTokens = 4096, systemPrompt = BCI_SYSTEM_PROMPT } = options;

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      stream: true,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }] as ClaudeMessage[],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API stream error ${response.status}: ${error}`);
  }

  return response.body!;
}
