import { PlanType } from "@domain/enums/PlanType.enum";

export interface ICreateSubscriptionUseCase {
    execute(collegeId:string,planType:PlanType): Promise<{gatewaySubscriptionId:string}>;
}