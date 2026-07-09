import { connectDB } from "./src/infrastructure/database/mongoose/connect";
import { GetHRInterviewsUseCase } from "./src/application/usecases/hr/interview-management/implementations/GetHRInterviews.usecase";
import { InterviewRepository } from "./src/infrastructure/repositories/interview.repository";
import { StudentRepository } from "./src/infrastructure/repositories/student.repository";
import { InterviewerRepository } from "./src/infrastructure/repositories/InterviewerRepository";

async function run() {
    await connectDB();
    const useCase = new GetHRInterviewsUseCase(
        new InterviewRepository(),
        new StudentRepository(),
        new InterviewerRepository()
    );
    try {
        const res = await useCase.execute("6a433fa79155e4fc4611ee1c");
        console.log("SUCCESS:", JSON.stringify(res, null, 2));
    } catch (e) {
        console.error("ERROR IN USECASE:", e);
    }
    process.exit(0);
}
run();
