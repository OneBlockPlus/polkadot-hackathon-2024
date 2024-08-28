import { IdeaSuggestion } from '../data-model/idea-suggestion';

export class AiService {
  static async generateTemplate(daoDescription: string) {
    const response = await fetch('/api/ai/generateTemplate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        daoDescription
      })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch completion');
    }

    const data = await response.json();
    return data;
  }

  static async generateGoal(goalDescription: string, daoDescription): Promise<{ content: string }> {
    const response = await fetch('/api/ai/generateGoal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        goalDescription,
        daoDescription
      })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch completion');
    }

    const data = await response.json();
    return data;
  }

  static async generateIdeas(goalDescription: string, daoDescription: string): Promise<IdeaSuggestion[]> {
    const response = await fetch('/api/ai/generateIdeas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        goalDescription,
        daoDescription
      })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch completion');
    }

    const data = await response.json();
    return data;
  }
}
