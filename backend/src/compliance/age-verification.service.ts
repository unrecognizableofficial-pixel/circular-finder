import { Injectable } from "@nestjs/common";

@Injectable()
export class AgeVerificationService {
  verify(age?: number | null) {
    return {
      isEligible: (age ?? 0) >= 13,
      requiredAge: 13
    };
  }
}
