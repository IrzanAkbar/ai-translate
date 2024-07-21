import axios from 'axios';
import { FromLanguage } from '../scenes/TranslatorApp/useTranslate';
import { Language } from './language';

const headers = {
  'Content-Type': 'application/json',
  'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
  'Referer': 'https://omniplex.ai/'
};

interface Input {
  fromLanguage: FromLanguage;
  toLanguage: Language;
  text: string;
}

function concatenateSentences(strings: string[]): string {
  return strings.join('. ') + '.';
}

const translatorPromptRules = [
  'You are AI in charge of translating text',
  'For every input you receive limit yourself to ONLY translate it',
  'The original language is surrounded by `{{` and `}}`',
  'You can also receive {{auto}} which means that you have to detect the language',
  'You can translate to any language',
  'The language you translate is surrounded by `[[` and `]]`'
];
const profile = concatenateSentences(translatorPromptRules);

export async function translate({ fromLanguage, text, toLanguage }: Input) {
  if (fromLanguage === toLanguage) return text;

  const data = {
    messages: [
      {
        role: 'system',
        content: profile
      },
      {
        role: 'user',
        content: `${text} {{${fromLanguage}}} [[${toLanguage}]]`
      }
    ],
    model: 'gpt-4o',
    temperature: 1,
    max_tokens: 1256,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0
  };

  try {
    const response = await axios.post('https://omniplex.ai/api/chat', data, { headers });
    return response.data.choices[0]?.message?.content || 'Translation error: No content found';
  } catch (error) {
    console.error('Translation error:', error);
    throw new Error('Translation error');
  }
}
