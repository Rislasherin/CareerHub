import 'dotenv/config';
import { cli, WorkerOptions, defineAgent } from '@livekit/agents';
import mongoose from 'mongoose';
import { InterviewerAgent } from './agents/InterviewerAgent';

/**
 * LiveKit Worker Entrypoint
 * Responsibility: Listens for LiveKit Jobs and dispatches the correct IAgent.
 */

// Connect to MongoDB using the URI from your .env
mongoose.connect(process.env.MONGODB_URI as string).then(() => {
  console.log('✅ [Worker] Connected to MongoDB');
});

// 1. Export the Agent Definition so LiveKit's child processes can load it
export default defineAgent({
  entry: async (ctx) => {
    const roomName = ctx.room?.name || '';
    console.log(`[Worker] Received job for room: ${roomName}`);
    
    // Extract the database ID from the LiveKit room name (e.g., "interview-abc123")
    const interviewId = roomName.replace('interview-', '');
    
    // DIP: We inject the concrete agent here. 
    const agent = new InterviewerAgent(interviewId);
    
    await agent.start(ctx);
  },
});

// 2. Start the worker process (only if this file is run directly by Node)
if (require.main === module) {
  // Quick sanity check to ensure the env variables are actually loaded in this process!
  if (!process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET) {
    console.error("❌ ERROR: Missing LIVEKIT_API_KEY or LIVEKIT_API_SECRET in your .env file!");
    process.exit(1);
  }

  cli.runApp(
    new WorkerOptions({ 
      agent: __filename, // Points to this exact file
      apiKey: process.env.LIVEKIT_API_KEY,
      apiSecret: process.env.LIVEKIT_API_SECRET,
      wsURL: process.env.LIVEKIT_URL,
    })
  );
}
