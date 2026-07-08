const BaseRepository = require('./BaseRepository');
const Project = require('../models/Project');

class ProjectRepository extends BaseRepository {
  constructor() {
    super(Project);
  }

  async findPublished(query) {
    const filter = { isPublished: true };
    if (query.category) filter.category = query.category;
    if (query.featured) filter.isFeatured = true;

    return this.findMany(filter, query, { sort: { isFeatured: -1, completionDate: -1 } });
  }

  async findBySlug(slug) {
    return this.findOne({ slug, isPublished: true });
  }

  async findAdminProjects(query) {
    const filter = {};
    if (query.search) filter.title = { $regex: query.search, $options: 'i' };
    return this.findMany(filter, query, { });
  }
}

module.exports = new ProjectRepository();
