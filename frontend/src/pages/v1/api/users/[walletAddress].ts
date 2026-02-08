// src/pages/api/users/[walletAddress].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { MongoUserRepository } from '../../../../infrastructure/persistence/mongodb/MongoUserRepository';
import { CreateOrUpdateUserProfile } from '../../../../application/useCases/user/CreateOrUpdateUserProfile';
import dbConnect from '../../../../lib/dbConnect';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { walletAddress } = req.query;
  await dbConnect();

  const userRepository = new MongoUserRepository();

  if (req.method === 'GET') {
    try {
      const user = await userRepository.findByWalletAddress(walletAddress as string);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching user', error });
    }
  }

  if (req.method === 'PUT') {
    try {
      const useCase = new CreateOrUpdateUserProfile(userRepository);
      const user = await useCase.execute({
        walletAddress: walletAddress as string,
        ...req.body
      });
      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json({ message: 'Error updating user', error });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
