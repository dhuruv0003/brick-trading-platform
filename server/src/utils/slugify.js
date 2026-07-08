const slugify = require('slug');

/**
 * Generate a URL-safe slug from a string
 */
const createSlug = (text) => {
  return slugify(text, { lower: true });
};

/**
 * Generate unique slug by appending random suffix if needed
 */
const createUniqueSlug = async (Model, text, excludeId = null) => {
  let slug = createSlug(text);
  let exists = true;
  let counter = 0;

  while (exists) {
    const query = { slug: counter === 0 ? slug : `${slug}-${counter}` };
    if (excludeId) query._id = { $ne: excludeId };
    const doc = await Model.findOne(query);
    if (!doc) {
      exists = false;
      slug = query.slug;
    } else {
      counter++;
    }
  }

  return slug;
};

module.exports = { createSlug, createUniqueSlug };
