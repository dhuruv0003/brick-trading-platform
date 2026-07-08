const userRepository = require('../repositories/UserRepository');
const AppError = require('../utils/AppError');

class UserService {
  async listAdmin(query) {
    return userRepository.findAdminUsers(query);
  }

  async create(payload) {
    const user = await userRepository.create(payload);
    user.password = undefined;
    return user;
  }

  async update(id, payload) {
    const updates = { ...payload };
    delete updates.password; // Password changes must go through AuthService.changePassword

    const user = await userRepository.updateById(id, updates);
    if (!user) throw new AppError('User not found.', 404);
    return user;
  }

  async delete(id, requestingUserId) {
    if (id === requestingUserId.toString()) {
      throw new AppError('You cannot delete your own account.', 400);
    }

    const user = await userRepository.deleteById(id);
    if (!user) throw new AppError('User not found.', 404);
    return user;
  }
}

module.exports = new UserService();
