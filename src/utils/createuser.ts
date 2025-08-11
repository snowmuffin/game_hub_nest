import { Repository } from 'typeorm';
import { User } from '../entities/shared/user.entity';

interface SteamProfile {
  steam_id: string;
  username: string;
  email?: string | null;
}

export async function createuser(
  profile: SteamProfile,
  userRepository: Repository<User>,
): Promise<User> {
  if (!profile.steam_id || !profile.username) {
    throw new Error('Invalid profile data received from Steam');
  }

  // Find user by steam_id
  let user = await userRepository.findOne({
    where: { steam_id: profile.steam_id },
  });

  // Create user if not found
  if (!user) {
    user = userRepository.create({
      steam_id: profile.steam_id,
      username: profile.username,
      email: profile.email || undefined,
      score: 0, // Initialize score with a default value of 0
      created_at: new Date(), // Set current timestamp for created_at
      updated_at: new Date(), // Set current timestamp for updated_at
    });
    await userRepository.save(user);
  }

  return user;
}
