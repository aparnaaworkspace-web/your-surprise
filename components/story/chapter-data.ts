export type ChapterInfo = {
  id: number;
  quote: string;
};

export const chapters: ChapterInfo[] = [
  {
    id: 1,
    quote: "Love doesn't always begin with a reason, sometimes it simply begins.",
  },
  {
    id: 2,
    quote: "Some songs don't play in our ears, they play in our memory.",
  },
  {
    id: 3,
    quote: 'Not a memory, just a dream waiting for another lifetime.',
  },
  {
    id: 4,
    quote: 'Distance is just a test to see how far love can travel.',
  },
  {
    id: 5,
    quote: 'Love is a game, that two can play and both win',
  },
];

export function getChapter(id: number) {
  return chapters.find((chapter) => chapter.id === id);
}
