/**
 * Simple slugify utility used by Category model.
 * Converts a string like "Home & Living" → "home-living"
 */
const slugify = (str) => {
  return str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^\w\s-]/g, '')   // remove non-word chars
    .replace(/[\s_-]+/g, '-')   // replace spaces/underscores with -
    .replace(/^-+|-+$/g, '');   // trim leading/trailing -
};

module.exports = slugify;
