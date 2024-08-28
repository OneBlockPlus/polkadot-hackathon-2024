import OpenAI from 'openai';
import { UnsplashService } from './unsplashService';
import { IdeaSuggestion } from '../../data-model/idea-suggestion';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export class OpenAiService {
  static async generateTemplate(description: string) {
    const unsplashImageUrl = await UnsplashService.searchImages(description).then((images) => images[0].urls.full);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a HTML generation assistant. You only return HTML content. This content does not require html, head or body tags as those are already added manually.' },
        {
          role: 'user',
          content: `Generate a HTML template with a header and 2 paragraphs for a DAO based on the following description: ${description}. Also add an img tag underneath for the following url ${unsplashImageUrl}`
        }
      ]
    });

    return completion;
  }

  static async generateGoal(goalDescription: string, daoDescription: string) {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a assistent to phrase goals well and give them a proper name. You only return a stringified json object that can be parsed with JSON.parse that has a title and description. No markdown or any other fluff.' },
        {
          role: 'user',
          content: `Generate a goal with name and description based on the following description: ${goalDescription}. Take into account the desciption of the charity: ${daoDescription}`
        }
      ]
    });

    return completion;
  }

  static async generateIdeas(goalDescription: string, daoDescription: string): Promise<IdeaSuggestion[]> {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a idea generation assistant. You return 3 ideas based on a goal description as an array with a title and description for each. Omit any markdown, it should be a JSON that Javascript can JSON.parse directly.' },
        {
          role: 'user',
          content: `Generate 3 realistic ideas a charity with the following description ${daoDescription} could try to implement to achieve the following goal: ${goalDescription}. `
        }
      ]
    });

    const ideas = JSON.parse(completion.choices[0].message.content);

    const mappedIdeas = await Promise.all(
      ideas.map(async (item) => {
        const images = await UnsplashService.searchImages(item.description);
        return {
          ...item,
          imageUrl: images[0].urls.regular
        };
      })
    );

    return mappedIdeas;
  }

  static async generateCategories(query: string): Promise<string> {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an assistant that turns a text into meaningful categories for image search. You return 3 categories separated by a comma. Omit any markdown or other fluff.' },
        {
          role: 'user',
          content: `Transform this query into useful categories for making an image search ${query}.`
        }
      ]
    });

    return completion.choices[0].message.content;
  }
}
