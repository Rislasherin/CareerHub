export interface IDeleteResumeUseCase {
    execute(studentId:string): Promise<void>;
}

