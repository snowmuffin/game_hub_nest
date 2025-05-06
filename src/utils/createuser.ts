import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

export async function createuser(
  profile: any,
  userRepository: Repository<User>
): Promise<User> {
  if (!profile.steam_id || !profile.username) {
    throw new Error('Invalid profile data received from Steam');
  }

  // Find user by steam_id
  let user = await userRepository.findOne({ where: { steam_id: profile.steam_id } });

  // Create user if not found
  if (!user) {
    user = userRepository.create({
      steam_id: profile.steam_id,
      username: profile.username,
      email: profile.email,
    });
    await userRepository.save(user);
  }

  return user;
}