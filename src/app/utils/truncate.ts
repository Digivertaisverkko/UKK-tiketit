// Lyhennä pitkiä merkkijonoja vaihtoehtoisesti sanaraja huomioiden.
export function truncate( str: string, length: number, useWordBoundary: boolean ){
  if (typeof str !== 'string') {
    return str;
  }
  if (str.length <= length) { return str; }
  const subString = str.slice(0, length-1);
  return (useWordBoundary
    ? subString.slice(0, subString.lastIndexOf(" "))
    : subString) + "...";
};
