import { JobContext } from '@livekit/agents';
import { voice } from '@livekit/agents';
import { IAgent } from '../interfaces/IAgent';


export abstract class BaseAgent implements IAgent {
  
  constructor(protected readonly interviewId: string) {}

  public async start(ctx: JobContext): Promise<void> {
    // 1. Connect to the LiveKit Room
    await ctx.connect();
    console.log(`[BaseAgent] Connected to room: ${ctx.room.name}`);

    // 2. Setup specific Agent logic (implemented by child classes)
    const agent = await this.setupAgent();

    // 3. Wait for participant to join
    const participant = await ctx.waitForParticipant();
    console.log(`[BaseAgent] Participant joined: ${participant.identity}`);

    // 4. Start the voice agent session in the room
    await agent.session.start({ agent, room: ctx.room });

    // 5. Trigger initial greeting
    agent.session.generateReply({
      instructions: "Greet the candidate and ask them to introduce themselves."
    });
  }

  protected abstract setupAgent(): Promise<voice.Agent>;
}
