export interface IAIWorkerOrchestratorUseCase {
  startWorker(url: string, token: string, sessionId:string): Promise<void>;
  stopWorker?(): Promise<void>;
}
