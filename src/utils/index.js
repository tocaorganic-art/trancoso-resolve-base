export function createPageUrl(pageName, queryString) {
  return `/${pageName.replace(/ /g, '-')}${queryString || ''}`;
}
