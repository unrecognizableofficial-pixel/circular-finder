import { Injectable } from "@nestjs/common";
import type { RequestUser } from "@/common/interfaces/request-user.interface";
import { WardrobeService } from "@/modules/wardrobe/wardrobe.service";

@Injectable()
export class StylingService {
  constructor(private readonly wardrobeService: WardrobeService) {}

  async outfits(user: RequestUser) {
    return this.wardrobeService.listOutfits(user);
  }
}
