import {JobContext} from '@livekit/agents'

export interface IAgent {
	start(ctx: JobContext): Promise<void>;
}