/** 请求后端api接口路径fix */
export const apiUrl = (url: string) => {
  if (url.startsWith("/")) {
    url = url.substring(1);
  }
  if (!url.endsWith("/")) {
    url = `${url}/`;
  }
  return `/api/${url}`;
};
