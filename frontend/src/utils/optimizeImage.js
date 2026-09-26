export const optimizeImage = (url, width = 1000) => {
  if (typeof url !== 'string' || !url.includes('/image/upload/')) return url;
  const transform = `f_auto,q_auto,w_${Math.max(320, Math.min(1600, width))},c_limit`;
  return url.replace('/image/upload/', `/image/upload/${transform}/`);
};
