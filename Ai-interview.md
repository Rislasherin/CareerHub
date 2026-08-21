THE COMPLETE ARCHITECTURE

                    CAREERHUB
                       │
        ┌──────────────┴──────────────┐
        │                             │
       HR                          Student
        │                             │
        ▼                             ▼
   Job Creation                  Interview UI
        │                             │
        │                             │
        ▼                             ▼
   Job Service                   LiveKit
        │                             │
        └──────────────┬──────────────┘
                       │
                       ▼
                Interview Service
                       │
              ┌────────┴────────┐
              │                 │
              ▼                 ▼
         Scheduler          Interview Agent
                                │
                ┌───────────────┼───────────────┐
                │               │               │
                ▼               ▼               ▼
             LangGraph       LangChain         RAG
                │               │               │
                │               │               ▼
                │               │             Qdrant
                │               │
                │               ├── LLM
                │               ├── Tools
                │               └── Structured Output
                │
                ▼
          Interview State
                │
        ┌───────┼────────┐
        ▼       ▼        ▼
      STT      TTS     Vision
        │       │        │
        ▼       ▼        ▼
     Speech   Speech   Proctoring








INTERVIEW AGENT


	 InterviewSupervisor
        │
        ▼
 ┌───────────────────────┐
 │  What should happen?  │
 └───────────┬───────────┘
             │
     ┌───────┼────────┐
     │       │        │
     ▼       ▼        ▼
 INTRO    QUESTION  FOLLOWUP
     │       │        │
     └───────┼────────┘
             ▼
       EVALUATE ANSWER
             │
       ┌─────┴─────┐
       ▼           ▼
    GOOD         WEAK
       │           │
       ▼           ▼
 NEXT QUESTION  FOLLOW-UP


PROCTORING ARCHITECTURE

                 Proctoring Service
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
   Browser Events    Vision         Audio
        │              │              │
        ▼              ▼              ▼
   Tab changes      Face count     Background noise
   Focus changes    Face presence  Multiple voices
   Fullscreen       Head pose
                    Gaze estimate



CareerHub
│
├── Existing HR / Student / Auth system
│
└── AI Interview
     │
     ├── Phase 1 — Interview Domain
     │
     ├── Phase 2 — LLM Question Generation
     │
     ├── Phase 3 — Structured Answer Evaluation
     │
     ├── Phase 4 — RAG
     │
     ├── Phase 5 — LangChain
     │
     ├── Phase 6 — LangGraph Interview Engine
     │
     ├── Phase 7 — Agentic Interviewer
     │
     ├── Phase 8 — Realtime Voice
     │
     ├── Phase 9 — Proctoring
     │
     └── Phase 10 — Final HR Evaluation	



whole working

	 HR shortlists student
        │
        ▼
Interview created
        │
        ├── HR chooses date/time
        │
        └── OR automatic scheduling
        │
        ▼
Student joins
        │
        ▼
Pre-interview checks
        │
        ├── Camera
        ├── Microphone
        ├── Speaker
        ├── Network
        └── Environment
        │
        ▼
AI Interviewer joins
        │
        ▼
Introduction
        │
        ▼
Self introduction
        │
        ▼
Interview starts
        │
        ▼
Question
        │
        ▼
Student answers
        │
        ▼
AI evaluates answer
        │
        ├───────────────┐
        │               │
     Weak/unclear     Good
        │               │
        ▼               ▼
 Follow-up          Next question
        │
        └───────────────┐
                        ▼
                  More questions
                        │
                        ▼
                 Time limit reached
                        │
                        ▼
                     Closing
                        │
                        ▼
                 Full evaluation
                        │
                        ▼
                  HR Interview Report
                        │
             ┌──────────┼──────────┐
             ▼          ▼          ▼
           Hire      Next Round   Reject
             │
             └── AI recommendation
                 HR makes final decision				