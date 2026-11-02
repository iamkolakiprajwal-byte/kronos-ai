import { AIPlanResponse, UserScheduleContext } from "./types";

export interface AIProvider {
  name: string;
  generatePlan(
    userPrompt: string,
    context: UserScheduleContext
  ): Promise<AIPlanResponse>;
}
