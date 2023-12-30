import {convert} from 'html-to-text'
import winkNLP from 'wink-nlp';
import model from 'wink-eng-lite-web-model';
import type {
  Signal
} from 'solid-js';
import {
  createSignal
} from 'solid-js';

const nlp = winkNLP( model );
const its = nlp.its;

const removePunctuation = (text: string) => {
  return `${text}`
    .replace(/[/?…".,#!$%^&*;:{}=_`~()'’‘“”]/g, '')
    .replace(/\s{2,}/g, ' ');
};

export const shortUrl = (text: string) => {
  if (text === 'undefined') {
    return
  }
  if (text === '') {
    return
  }
  const theUrl = new URL(text);
  const newPath = removePunctuation(`${theUrl.hostname}${theUrl.pathname}`)
    .replace(/-/g, '')
    .toLowerCase();
  return newPath;
};

export const shortGuid = (input: string) => {
  try {
    const newShortGuid = shortUrl(input.replace(/\?.*$/,''))
    return newShortGuid
  } catch (error) {
    return input.replace(/\?.*$/,'')
  }
}

export const nHoursAgo = (hrs: number): number => Math.floor((Date.now() - hrs * 60 * 60 * 1000) / 1000);

export const prepNLPTask = function ( text: string ) {
    const tokens: string[] = [];
    nlp.readDoc(text)
        .tokens()
        // Use only words ignoring punctuations etc and from them remove stop words
        .filter( (t: any) => ( t.out(its.type) === 'word' && !t.out(its.stopWordFlag) ) )
        // Handle negation and extract stem of the word
        .each( (t: any) => tokens.push( (t.out(its.negationFlag)) ? '!' + t.out(its.stem) : t.out(its.stem) ) );
    return tokens;
  };

export function createStoredSignal<T>(
    key: string,
    defaultValue: T,
    storage = localStorage
  ): Signal<T> {
    const initialValue = storage.getItem(key) != undefined && storage.getItem(key) !== 'undefined'
      ? JSON.parse(`${storage.getItem(key)}`) as T
      : defaultValue;
    const [value, setValue] = createSignal<T>(initialValue);
    const setValueAndStore = ((arg: any) => {
      const v = setValue(arg);
      storage.setItem(key, JSON.stringify(v));
      return v;
    }) as typeof setValue;
    return [value, setValueAndStore];
  }


export const prepNostrPost = (post: any) => {
    return {
      mlText: prepNLPTask(convert(
        `${post.content}`
        .replace(/\d+/g, '')
        .replace(/#/g, ''),
        {
          ignoreLinks: true,
          ignoreHref: true,
          ignoreImage: true,
          linkBrackets: false,
          wordwrap: false
        }
      )
      )
      .filter((word: string) => word.length < 30)
      .filter((word: string) => word!='nostr')
      .filter((word: string) => word!='vmess')
      .join(' ')
      .toLowerCase() || '',
  
      links: convert(
        `${post.content}`,
        {
          ignoreLinks: true,
          ignoreHref: true,
          ignoreImage: true,
          linkBrackets: false,
          wordwrap: false
        }
        ).toLowerCase().match(/((file|http|https|ftp):\/\/[\w?=&.\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))/g),
      ...post
    }
  }