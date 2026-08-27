import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { ChatOllama } from "@langchain/ollama";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";
import { env } from "@infrastructure/config/env.validator";
import { Logger, LogCategory } from '../../logger/logger';

export type LLMProviderType = "OLLAMA" | "GEMINI" | "GROQ" | "OPENAI";

export interface ISingleLLMConfig {
  provider: LLMProviderType;
  model: string;
  baseUrl?: string;
  temperature: number;
  maxTokens: number;
  timeoutMs: number;
}

export class LLMProviderFactory {
  /**
   * Deterministic Question Provider Precedence:
   * 1. env.AI_QUESTION_PROVIDER (explicit override: GROQ | GEMINI | OPENAI | OLLAMA)
   * 2. env.USE_LOCAL_LLM === true -> OLLAMA
   * 3. env.AI_PROVIDER (legacy compatibility)
   * 4. env.AI_LLM_PROVIDER (legacy compatibility)
   * 5. Fallback default: OLLAMA
   */
  public static getQuestionConfig(): ISingleLLMConfig {
    let provider: LLMProviderType;

    if (env.AI_QUESTION_PROVIDER) {
      provider = env.AI_QUESTION_PROVIDER;
    } else if (env.USE_LOCAL_LLM) {
      provider = "OLLAMA";
    } else if (env.AI_PROVIDER) {
      provider = env.AI_PROVIDER;
    } else if (env.AI_LLM_PROVIDER) {
      provider = env.AI_LLM_PROVIDER;
    } else {
      throw new Error(
        "[LLMProviderFactory] No LLM provider explicitly configured for Question LLM. Set AI_QUESTION_PROVIDER, AI_PROVIDER, or USE_LOCAL_LLM=true in environment."
      );
    }

    let defaultModel = "llama3.2:3b";
    if (provider === "GROQ") defaultModel = "qwen/qwen3.8-27b";
    else if (provider === "GEMINI") defaultModel = "gemini-2.5-flash";
    else if (provider === "OPENAI") defaultModel = "gpt-4o-mini";

    const model = env.AI_QUESTION_MODEL || defaultModel;

    return {
      provider,
      model,
      baseUrl: env.AI_QUESTION_BASE_URL || env.OLLAMA_BASE_URL,
      temperature: env.AI_QUESTION_TEMPERATURE,
      maxTokens: env.AI_QUESTION_MAX_TOKENS,
      timeoutMs: env.AI_QUESTION_TIMEOUT_MS,
    };
  }

  /**
   * Deterministic Evaluation Provider Precedence:
   * 1. env.AI_EVALUATION_PROVIDER (explicit override: OLLAMA | GROQ | GEMINI | OPENAI)
   * 2. env.USE_LOCAL_LLM === true -> OLLAMA
   * 3. env.AI_PROVIDER (legacy compatibility)
   * 4. env.AI_LLM_PROVIDER (legacy compatibility)
   * 5. If none configured -> Fail fast with explicit Error
   */
  public static getEvaluationConfig(): ISingleLLMConfig {
    let provider: LLMProviderType;

    if (env.AI_EVALUATION_PROVIDER) {
      provider = env.AI_EVALUATION_PROVIDER;
    } else if (env.USE_LOCAL_LLM) {
      provider = "OLLAMA";
    } else if (env.AI_PROVIDER) {
      provider = env.AI_PROVIDER;
    } else if (env.AI_LLM_PROVIDER) {
      provider = env.AI_LLM_PROVIDER;
    } else {
      throw new Error(
        "[LLMProviderFactory] No LLM provider explicitly configured for Evaluation LLM. Set AI_EVALUATION_PROVIDER, AI_PROVIDER, or USE_LOCAL_LLM=true in environment."
      );
    }

    let defaultModel = "llama3.2:3b";
    if (provider === "GROQ") defaultModel = "qwen/qwen3.8-27b";
    else if (provider === "GEMINI") defaultModel = "gemini-2.5-flash";
    else if (provider === "OPENAI") defaultModel = "gpt-4o-mini";

    const model = env.AI_EVALUATION_MODEL || defaultModel;

    return {
      provider,
      model,
      baseUrl: env.AI_EVALUATION_BASE_URL || env.OLLAMA_BASE_URL,
      temperature: env.AI_EVALUATION_TEMPERATURE,
      
      maxTokens: env.AI_EVALUATION_MAX_TOKENS,
      timeoutMs: env.AI_EVALUATION_TIMEOUT_MS,
    };
  }

  public static getFullEvaluationConfig(): ISingleLLMConfig {
    let provider: LLMProviderType;

    if (env.AI_FULL_EVALUATION_PROVIDER) {
      provider = env.AI_FULL_EVALUATION_PROVIDER;
    } else {
      provider = "GROQ";
    }

    let defaultModel = "qwen/qwen3.8-27b";
    if (provider === "OLLAMA") defaultModel = "llama3.2:3b";
    else if (provider === "GEMINI") defaultModel = "gemini-2.5-flash";
    else if (provider === "OPENAI") defaultModel = "gpt-4o-mini";

    const model = env.AI_FULL_EVALUATION_MODEL || defaultModel;

    return {
      provider,
      model,
      baseUrl: env.AI_FULL_EVALUATION_BASE_URL || env.OLLAMA_BASE_URL,
      temperature: env.AI_FULL_EVALUATION_TEMPERATURE,
      maxTokens: env.AI_FULL_EVALUATION_MAX_TOKENS,
      timeoutMs: env.AI_FULL_EVALUATION_TIMEOUT_MS,
    };
  }

  public static createQuestionLLM(): BaseChatModel {
    const config = this.getQuestionConfig();
    const evalConfig = this.getEvaluationConfig();

    if (config.provider === "OLLAMA" && evalConfig.provider === "OLLAMA") {
      Logger.warn(LogCategory.SYSTEM_INFO, 
        "[LLMProviderFactory] WARNING: Realtime question LLM and background evaluation LLM share Ollama inference resources; realtime latency may be affected."
      );
    }

    Logger.info(LogCategory.SYSTEM_INFO, `[LLMProviderFactory] Initialized Question LLM -> Provider: ${config.provider}, Model: ${config.model}, Temp: ${config.temperature}, MaxTokens: ${config.maxTokens}, Timeout: ${config.timeoutMs}ms`);

    if (config.provider === "OLLAMA") {
      return new ChatOllama({
        model: config.model,
        baseUrl: config.baseUrl || "http://127.0.0.1:11434",
        temperature: config.temperature,
        numPredict: config.maxTokens,
        keepAlive: "30m",
        maxRetries: 1,
        streaming: true,
      });
    }

    if (config.provider === "GROQ") {
      if (!env.GROQ_API_KEY) {
        throw new Error("[LLMProviderFactory] Missing GROQ_API_KEY in environment for Question LLM.");
      }
      return new ChatOpenAI({
        model: config.model,
        apiKey: env.GROQ_API_KEY,
        configuration: {
          baseURL: "https://api.groq.com/openai/v1",
        },
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        maxRetries: 1,
        streaming: true,
      });
    }

    if (config.provider === "OPENAI") {
      if (!env.OPENAI_API_KEY) {
        throw new Error("[LLMProviderFactory] Missing OPENAI_API_KEY in environment for Question LLM.");
      }
      return new ChatOpenAI({
        model: config.model,
        apiKey: env.OPENAI_API_KEY,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        maxRetries: 1,
        streaming: true,
      });
    }

    if (config.provider === "GEMINI") {
      if (!env.GEMINI_API_KEY) {
        throw new Error("[LLMProviderFactory] Missing GEMINI_API_KEY in environment for Question LLM.");
      }
      return new ChatGoogleGenerativeAI({
        model: config.model,
        apiKey: env.GEMINI_API_KEY,
        temperature: config.temperature,
        maxOutputTokens: config.maxTokens,
        maxRetries: 1,
        streaming: true,
      });
    }

    return new ChatOllama({
      model: config.model,
      baseUrl: config.baseUrl || "http://127.0.0.1:11434",
      temperature: config.temperature,
      numPredict: config.maxTokens,
      keepAlive: "30m",
      maxRetries: 1,
      streaming: true,
    });
  }

  public static createEvaluationLLM(): BaseChatModel {
    const config = this.getEvaluationConfig();
    Logger.info(LogCategory.SYSTEM_INFO, `[LLMProviderFactory] Initialized Evaluation LLM -> Provider: ${config.provider}, Model: ${config.model}, Temp: ${config.temperature}, MaxTokens: ${config.maxTokens}, Timeout: ${config.timeoutMs}ms`);

    if (config.provider === "OLLAMA") {
      return new ChatOllama({
        model: config.model,
        baseUrl: config.baseUrl || "http://127.0.0.1:11434",
        temperature: config.temperature,
        numPredict: config.maxTokens,
        keepAlive: "30m",
        maxRetries: 1,
        streaming: false,
      });
    }

    if (config.provider === "GROQ") {
      if (!env.GROQ_API_KEY) {
        throw new Error("[LLMProviderFactory] Missing GROQ_API_KEY in environment for Evaluation LLM.");
      }
      return new ChatOpenAI({
        model: config.model,
        apiKey: env.GROQ_API_KEY,
        configuration: {
          baseURL: "https://api.groq.com/openai/v1",
        },
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        maxRetries: 1,
        streaming: false,
      });
    }

    if (config.provider === "OPENAI") {
      if (!env.OPENAI_API_KEY) {
        throw new Error("[LLMProviderFactory] Missing OPENAI_API_KEY in environment for Evaluation LLM.");
      }
      return new ChatOpenAI({
        model: config.model,
        apiKey: env.OPENAI_API_KEY,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        maxRetries: 1,
        streaming: false,
      });
    }

    return new ChatGoogleGenerativeAI({
      model: config.model,
      apiKey: env.GEMINI_API_KEY,
      temperature: config.temperature,
      maxOutputTokens: config.maxTokens,
      maxRetries: 1,
      streaming: false,
    });
  }

  public static createFullEvaluationLLM(): BaseChatModel {
    const config = this.getFullEvaluationConfig();
    const fullMaxTokens = Math.max(config.maxTokens, 4000);
    Logger.info(LogCategory.SYSTEM_INFO, `[LLMProviderFactory] Initialized Full Evaluation LLM -> Provider: ${config.provider}, Model: ${config.model}, Temp: ${config.temperature}, MaxTokens: ${fullMaxTokens}`);

    if (config.provider === "OLLAMA") {
      return new ChatOllama({
        model: config.model,
        baseUrl: config.baseUrl || "http://127.0.0.1:11434",
        temperature: config.temperature,
        numPredict: fullMaxTokens,
        keepAlive: "30m",
        maxRetries: 1,
        streaming: false,
      });
    }

    if (config.provider === "GROQ") {
      if (!env.GROQ_API_KEY) {
        throw new Error("[LLMProviderFactory] Missing GROQ_API_KEY in environment for Evaluation LLM.");
      }
      return new ChatOpenAI({
        model: config.model,
        apiKey: env.GROQ_API_KEY,
        configuration: {
          baseURL: "https://api.groq.com/openai/v1",
        },
        temperature: config.temperature,
        maxTokens: fullMaxTokens,
        maxRetries: 1,
        streaming: false,
      });
    }

    if (config.provider === "OPENAI") {
      if (!env.OPENAI_API_KEY) {
        throw new Error("[LLMProviderFactory] Missing OPENAI_API_KEY in environment for Evaluation LLM.");
      }
      return new ChatOpenAI({
        model: config.model,
        apiKey: env.OPENAI_API_KEY,
        temperature: config.temperature,
        maxTokens: fullMaxTokens,
        maxRetries: 1,
        streaming: false,
      });
    }

    if (!env.GEMINI_API_KEY) {
      throw new Error("[LLMProviderFactory] Missing GEMINI_API_KEY in environment for Evaluation LLM.");
    }

    return new ChatGoogleGenerativeAI({
      model: config.model,
      apiKey: env.GEMINI_API_KEY,
      temperature: config.temperature,
      maxOutputTokens: fullMaxTokens,
      maxRetries: 1,
      streaming: false,
    });
  }
}
