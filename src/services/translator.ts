import type { TranslationResult } from '../types';
import type { AIConfig } from '../stores/useSettingsStore';

export async function translateProject(
  readme: string,
  description: string,
  repoName: string,
  aiConfig: AIConfig
): Promise<TranslationResult> {
  const truncatedReadme = readme.slice(0, 8000);

  const prompt = `你是一个技术文档翻译和分析专家。请根据以下 GitHub 项目信息，用中文输出 JSON 格式的项目深度介绍。要求内容丰富、专业、直白易懂。

项目名称: ${repoName}
项目描述: ${description || '无'}
README 内容:
${truncatedReadme}

请输出以下 JSON 格式（不要包含 markdown 代码块标记）:
{
  "overview": "项目简介，用 2-3 句话概括这个项目是什么、做什么用的、面向什么人群",
  "highlights": "核心亮点与特性，用换行分隔列出 3-5 个最突出的功能或特点，每条以 • 开头",
  "target": "项目目标与适用场景，说明这个项目要解决什么问题，适合在什么场景下使用",
  "usage": "快速上手，用简洁的步骤说明如何开始使用（命令行示例用反引号包裹）",
  "techStack": "技术架构，说明项目使用的核心技术栈、框架、设计模式等",
  "installation": "安装与部署，列出完整的安装步骤和环境要求"
}

要求：
- 内容要充实具体，不要泛泛而谈
- highlights 字段每条用 • 开头，换行分隔
- 如果 README 中信息不足，根据项目描述和代码特征合理推断
- 技术架构部分要具体到框架和工具名称`;

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

  const res = await fetch(`${API_BASE}/api/ai`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      apiUrl: aiConfig.apiUrl,
      apiKey: aiConfig.apiKey,
      model: aiConfig.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`翻译请求失败 (${res.status}): ${text.slice(0, 100)}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('AI 返回内容为空');
  }

  try {
    return JSON.parse(content);
  } catch {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('翻译结果解析失败');
  }
}
