import Anthropic from '@anthropic-ai/sdk';

// Anthropic 클라이언트는 서버(Route Handler)에서만 사용합니다.
// API 키는 절대 클라이언트에 노출되지 않습니다.
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// 사용 모델. 문서 기본값은 Sonnet 계열이며, 현재 최신은 claude-sonnet-5 입니다.
// 환경변수 ANTHROPIC_MODEL 로 손쉽게 교체할 수 있습니다.
export const SERMON_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5';
