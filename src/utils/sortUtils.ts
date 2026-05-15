import { Onske } from '../types';

export const sortWishes = (onsker: Onske[]): Onske[] =>
  [...onsker].sort((a, b) => {
    const aSection = a.favoritt ? 0 : 1;
    const bSection = b.favoritt ? 0 : 1;
    if (aSection !== bSection) return aSection - bSection;
    return (a.sortOrder ?? Number.MAX_SAFE_INTEGER) - (b.sortOrder ?? Number.MAX_SAFE_INTEGER);
  });

export const nextSortOrder = (onsker: Onske[], erFavoritt: boolean): number => {
  const sectionItems = onsker.filter(o => !!o.favoritt === erFavoritt);
  if (sectionItems.length === 0) return 0;
  const maxOrder = Math.max(...sectionItems.map(o => o.sortOrder ?? -1));
  return maxOrder + 1;
};
