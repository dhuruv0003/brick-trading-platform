const projectRepository = require('../repositories/ProjectRepository');
const Project = require('../models/Project');
const AppError = require('../utils/AppError');
const { createUniqueSlug } = require('../utils/slugify');

class ProjectService {
  async listPublished(query) {
    return projectRepository.findPublished(query);
  }

  async getBySlug(slug) {
    const project = await projectRepository.findBySlug(slug);
    if (!project) throw new AppError('Project not found.', 404);
    return project;
  }

  async listAdmin(query) {
    return projectRepository.findAdminProjects(query);
  }

  async create(payload) {
    const slug = await createUniqueSlug(Project, payload.title);
    return projectRepository.create({ ...payload, slug });
  }

  async update(id, payload) {
    const updates = { ...payload };
    if (updates.title) {
      updates.slug = await createUniqueSlug(Project, updates.title, id);
    }

    const project = await projectRepository.updateById(id, updates);
    if (!project) throw new AppError('Project not found.', 404);
    return project;
  }

  async delete(id) {
    const project = await projectRepository.deleteById(id);
    if (!project) throw new AppError('Project not found.', 404);
    return project;
  }
}

module.exports = new ProjectService();
