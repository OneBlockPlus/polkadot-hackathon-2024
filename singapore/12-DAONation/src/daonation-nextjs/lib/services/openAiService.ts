import OpenAI from 'openai';
import { UnsplashService } from './unsplashService';
import { IdeaSuggestion } from '../../data-model/idea-suggestion';
import { TemplateType } from '../../data-model/template-type';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export class OpenAiService {
  static async generateTemplate(description: string, templateType: TemplateType) {
    const randomImageIndex = Math.floor(Math.random() * 9);

    let unsplashImageUrl;
    let instructions: string;

    switch (templateType) {
      case 'Mission statement':
        unsplashImageUrl = await UnsplashService.searchImages(description).then((images) => images[randomImageIndex].urls.full);
        instructions = `Generate a HTML template with an img tag above for the following url ${unsplashImageUrl}, then an h2 header of "Our mission" and 2 paragraphs for a DAO based on the following description: ${description}. Have it wrapped in a div with the class mission-statement`;
        break;
      case 'Impact stories':
        const portrait1 = await UnsplashService.searchImages('face female', 1).then((images) => images[0].urls.small);
        const portrait2 = await UnsplashService.searchImages('face male', 1).then((images) => images[0].urls.small);
        const portrait3 = await UnsplashService.searchImages('face female', 3).then((images) => images[1].urls.small);

        instructions = `Generate a HTML template with an h2 header of "Impact stories" and 3 blocks that have each have an example personal story, with a short first name, job title or tagline (like but not exactly as mother of 2, army veteran, employee,...), img and the story itself which should be around 80 words, by a person in contact with the charity for a DAO based on the following description: ${description}.
                        Each block should follow the following structure: <div class="impact-story><div><img/><h3>{name}</h3><h4>tagline</h4></div><p>{story}</p> </div>"
                        The first should be female and have ${portrait1} as the img href, the middle one should be male and have ${portrait2} as the img href. The last one should be a female employee and have ${portrait3} as the img href.
                        Have it wrapped in a div with the class impact-stories`;

        break;
      case 'Charity activities':
        const image1 = await UnsplashService.searchImages(description, 1).then((images) => images[0].urls.small);
        const image2 = await UnsplashService.searchImages(description, 2).then((images) => images[1].urls.small);
        const image3 = await UnsplashService.searchImages(description, 3).then((images) => images[2].urls.small);
        const image4 = await UnsplashService.searchImages(description, 4).then((images) => images[3].urls.small);

        instructions = `Generate a HTML template with an h2 header of "Our activities" and 4 that each describe an activity with a name and activity description for a DAO based on the following description: ${description}.
                        Each block should follow the following structure: <div class="activity"><div><h3>{name}</h3><p>{activity description}</p></div><img /></div>
                        The first block should have ${image1} as img href, the second should have ${image2} as img href, the third one shoud have ${image3} as img href, the last one should have ${image4}
                        Have it wrapped in a div with the class our-activities`;
        break;
      case 'Contact information':
        const linkedIn = '/linkedin.svg';
        const twitter = '/twitter.svg';
        const facebook = '/facebook.svg';
        const instagram = '/instagram.svg';
        instructions = `Generate a HTML template with an h2 header of "Connect with us" and 4 social media icons, the icons should be wrapped in a social-media-icons class.
                        Each should have the following structure: <div class="social-media-icon"><img></div>
                        The href for LinkedIn should be ${linkedIn}, The href for twitter should be ${twitter}, The href for facebook should be ${facebook}, The href for instagram should be ${instagram}
                        Have it wrapped in a div with the class connect-with-us`;
        break;

      default:
        instructions = templateType;
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a HTML generation assistant. You only return HTML content, no markdown or anything else. This content does not require html, head or body tags as those are already added manually.' },
        {
          role: 'user',
          content: instructions
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
