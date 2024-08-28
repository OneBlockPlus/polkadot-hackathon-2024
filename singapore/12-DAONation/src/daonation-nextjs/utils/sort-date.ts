import { parseISO, isValid, compareDesc } from 'date-fns';

export const sortDate = (array: unknown[], sortByFieldName = '') => {
  return array.sort((a, b) => {
    const dateA = parseISO(a[sortByFieldName]);
    const dateB = parseISO(b[sortByFieldName]);

    if (!isValid(dateA) && !isValid(dateB)) return 0;
    if (!isValid(dateA)) return 1; // place invalid dates at the end
    if (!isValid(dateB)) return -1; // place invalid dates at the end

    return compareDesc(dateA, dateB);
  });
};


export const sortDateDesc = (array: unknown[], sortByFieldName = '') => {
  return array.sort((a, b) => {
    const dateA = (a[sortByFieldName]);
    const dateB = (b[sortByFieldName]);

    if (!isValid(dateA) && !isValid(dateB)) return 0;
    if (!isValid(dateA)) return 1; // place invalid dates at the end
    if (!isValid(dateB)) return -1; // place invalid dates at the end

    return compareDesc(dateA, dateB);
  });
};