// A light story told by Granny Salma between worlds (like the stories in Merge Gardens / Merge Mansion,
// but short and gentle). Each beat shows once; it can be replayed from the Album screen.
import { load, save } from './save';

export interface Beat {
  id: string;
  when: 'before' | 'after';   // before playing the level, or after winning it
  level: number;
  emoji: string;              // who is speaking / the scene
  pages: { en: string; ar: string }[];
}

export const STORY: Beat[] = [
  { id: 'w1-start', when: 'before', level: 1, emoji: '👵', pages: [
    { en: 'Hello, little gardener! I\'m Granny Salma. My old garden has gone quiet and empty…',
      ar: 'أهلًا أيها البستاني الصغير! أنا الجدة سلمى. حديقتي القديمة أصبحت هادئة وفارغة…' },
    { en: 'Put two seeds together and they grow. Will you help me bring the meadow back to life?',
      ar: 'ضع بذرتين معًا فتكبران. هل تساعدني في إعادة الحياة إلى المرج؟' }
  ] },
  { id: 'w1-end', when: 'after', level: 10, emoji: '🌻', pages: [
    { en: 'Look at the meadow! Bees are humming again. Thank you!',
      ar: 'انظر إلى المرج! النحل يطن من جديد. شكرًا لك!' },
    { en: 'But behind the hill, my rock garden is full of stones. Shall we go and see?',
      ar: 'لكن خلف التل، حديقة الصخور مليئة بالحجارة. هل نذهب لنرى؟' }
  ] },
  { id: 'w2-start', when: 'before', level: 11, emoji: '👵', pages: [
    { en: 'These rocks are too heavy to move. We\'ll have to grow our plants around them.',
      ar: 'هذه الصخور ثقيلة جدًا ولا يمكن تحريكها. سنزرع نباتاتنا حولها.' }
  ] },
  { id: 'w2-end', when: 'after', level: 20, emoji: '🌳', pages: [
    { en: 'Trees between the rocks! It looks wonderful, even the snails are happy.',
      ar: 'أشجار بين الصخور! يبدو المكان رائعًا، حتى الحلزونات سعيدة.' },
    { en: 'Brrr… the wind is getting cold. My pond garden must be frozen by now.',
      ar: 'برررر… الرياح أصبحت باردة. لا بد أن حديقة البركة تجمدت الآن.' }
  ] },
  { id: 'w3-start', when: 'before', level: 21, emoji: '❄️', pages: [
    { en: 'Oh dear, my best plants are stuck in the ice! Grow something right next to them to warm them up.',
      ar: 'يا إلهي، أفضل نباتاتي عالقة في الجليد! ازرع شيئًا بجانبها مباشرة لتدفئها.' }
  ] },
  { id: 'w3-end', when: 'after', level: 30, emoji: '🍎', pages: [
    { en: 'The ice is gone and the apple trees are blooming! You did it!',
      ar: 'ذاب الجليد وأزهرت أشجار التفاح! لقد نجحت!' },
    { en: 'My whole garden is alive again, thanks to you. Come and visit My Garden any time. 💚',
      ar: 'حديقتي كلها عادت للحياة بفضلك. تعال وزر حديقتي في أي وقت. 💚' }
  ] }
];

export const beatFor = (when: Beat['when'], level: number) => STORY.find(b => b.when === when && b.level === level);

export function seen(id: string): boolean { return (load().story ?? []).includes(id); }

export function markSeen(id: string) {
  const d = load();
  d.story = [...new Set([...(d.story ?? []), id])];
  save(d);
}
