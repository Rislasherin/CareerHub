import { RegisterCollegeRequestDto } from "@application/dtos/auth/collage/Request/register.collage.request.dto";
import { RegisterCollegeResponseDto } from "@application/dtos/auth/collage/Response/register.college.response.sto";

export interface IRegisterOrganizationUseCase {
    execute(
        dto:RegisterCollegeRequestDto
    ): Promise<RegisterCollegeResponseDto>
}
