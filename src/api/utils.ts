export const apiUrl = (url: string) => {
  if (url.startsWith("/")) {
    url = url.substring(1);
  }
  if (!url.endsWith("/")) {
    url = `${url}/`;
  }
  return `/api/${url}`;
};
