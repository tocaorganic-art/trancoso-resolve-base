export function createPageUrl(pageName: string, queryString?: string) {
    const path = '/' + pageName.replace(/ /g, '-');
    if (queryString) {
        return path + queryString;
    }
    return path;
}