export function truncate(str: string, max = 5) {
  return str.length > max ? `${str.slice(0, max)}…` : str;
}
