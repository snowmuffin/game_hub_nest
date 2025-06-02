import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as dotenv from 'dotenv';
@Injectable()
export class RewardService {
    constructor(private readonly httpService: HttpService) {}

    async getRewards(userId: any) {
        const steamId = await this.getSteamIdByUserId(userId);
        const serverKey = process.env.SPACE_ENGINEERS_SERVER_API_KEY;
        const url = `https://space-engineers.com/api/?object=votes&element=claim&key=${serverKey}&steamid=${steamId}`;

        try {
            const response = await firstValueFrom(this.httpService.get(url));
            if (response.data === 1) {
                const claimUrl = `https://space-engineers.com/api/?action=post&object=votes&element=claim&key=${serverKey}&steamid=${steamId}`;
                const claimResponse = await firstValueFrom(this.httpService.get(claimUrl));
                if (claimResponse.data === 1) {
                    await this.giveReward(steamId);
                    return { status: 2, message: 'Reward claimed and given.' };
                } else if (claimResponse.data === 0) {
                    return { status: 1, message: 'Vote has not been claimed yet.' };
                } else {
                    return { status: -1, message: 'Unknown claim response.' };
                }
            }
            if (response.data === 2) {
                return { status: 2, message: 'Vote has already been claimed.' };
            }
            if (response.data === 0) {
                return { status: 0, message: 'Vote not found.' };
            }
            return { status: -1, message: 'Unknown response.' };
        } catch (error) {
            throw new Error('Failed to check vote status');
        }
    }

    private async getSteamIdByUserId(userId: any): Promise<string> {
        // TODO: 공용으로 쓰게 옮겨야함
        return 'STEAM_ID_FROM_DB';
    }

    async giveReward(steamId: string) {

        return true;
    }
}
