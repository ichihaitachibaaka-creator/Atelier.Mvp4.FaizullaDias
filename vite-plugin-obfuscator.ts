import type { Plugin, RenderedChunk } from 'vite';
import JavaScriptObfuscator from 'javascript-obfuscator';

const obfuscatorOptions = {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.75,
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.4,
  stringArray: true,
  stringArrayEncoding: ['base64'],
  stringArrayThreshold: 0.75,
  stringArrayWrappersCount: 2,
  stringArrayWrappersType: 'function',
  identifierNamesGenerator: 'hexadecimal',
  renameGlobals: false,
  selfDefending: true,
  disableConsoleOutput: true,
  transformObjectKeys: true,
  unicodeEscapeSequence: false,
};

export function obfuscatorPlugin(): Plugin {
  let isProduction = false;

  return {
    name: 'obfuscator',
    enforce: 'post',

    configResolved(config) {
      isProduction = config.command === 'build';
    },

    renderChunk(_code: string, chunk: RenderedChunk) {
      if (!isProduction) return null;
      if (chunk.type !== 'chunk') return null;

      try {
        const obfuscated = JavaScriptObfuscator.obfuscate(_code, {
          ...obfuscatorOptions,
          target: 'browser',
        }).getObfuscatedCode();

        return { code: obfuscated, map: null };
      } catch {
        return null;
      }
    },
  };
}
