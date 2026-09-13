# Concentrate AI model directory

Metadata fetched: **2026-09-13T23:38:55.699Z** from [the public catalog](https://api.concentrate.ai/v1/models).

**185 catalog IDs; 184 eligible chat models; 1 excluded.** All eligible metadata is bundled for offline fallback. Live discovery takes precedence.

**Reading this directory:** upstream capability flags are not feature certification. Unknown is not no, and a successful basic response does not prove tools, vision or reasoning. Pricing is reviewed separately during setup.

Basic-response evidence: **2026-09-13 resume-06**. [Historical outcomes](COMPATIBILITY.md), [feature evidence](FEATURE-TESTING.md), [release proofs](RELEASE-GATES.md), [machine-readable directory](models.json).

The fallback may be stale. Catalog visibility does not imply account entitlement. `redact-v1` is a redaction utility, not a runnable chat model.

## ai21

| Model ID | Input limit | Output limit | Image* | Reasoning* | JSON schema* | Basic response |
| --- | ---: | ---: | --- | --- | --- | --- |
| `jamba-1-5-large` | 256000 | 4096 | no | no | no | passed |
| `jamba-1-5-mini` | 256000 | 4096 | no | no | no | passed |

## alibaba

| Model ID | Input limit | Output limit | Image* | Reasoning* | JSON schema* | Basic response |
| --- | ---: | ---: | --- | --- | --- | --- |
| `qwen-flash` | 1000000 | 32000 | no | yes | yes | passed |
| `qwen-plus` | 1000000 | 32000 | no | yes | yes | passed |
| `qwen3-14b` | 40960 | 32768 | no | yes | yes | passed |
| `qwen3-235b-a22b-instruct` | 262144 | 32768 | no | no | yes | passed |
| `qwen3-30b` | 131072 | 16384 | no | yes | yes | passed |
| `qwen3-32b` | 40960 | 32768 | no | yes | yes | passed |
| `qwen3-coder-30b-a3b` | 256000 | 65536 | no | no | yes | inconclusive |
| `qwen3-coder-480b-a35b` | 262144 | 32768 | no | no | yes | passed |
| `qwen3-coder-flash` | 1000000 | 64000 | no | no | no | passed |
| `qwen3-coder-next` | 262144 | 65536 | no | no | yes | passed |
| `qwen3-coder-plus` | 1000000 | 64000 | no | no | no | passed |
| `qwen3-max` | 262144 | 64000 | no | no | no | passed |
| `qwen3-max-thinking` | 256000 | 32768 | no | no | no | passed |
| `qwen3-next-80b-a3b` | 262144 | 32768 | no | no | yes | passed |
| `qwen3-vl-235b-a22b` | 262144 | 32768 | yes | no | yes | passed |
| `qwen3-vl-30b-a3b` | 262144 | 32768 | yes | no | yes | inconclusive |
| `qwen3-vl-flash` | 256000 | 32000 | yes | yes | yes | passed |
| `qwen3-vl-plus` | 256000 | 32000 | yes | yes | yes | passed |
| `qwen3.5-122b-a10b` | 262144 | 65536 | yes | yes | yes | passed |
| `qwen3.5-27b` | 262144 | 32768 | yes | yes | yes | passed |
| `qwen3.5-35b-a3b` | 262144 | 65536 | yes | yes | yes | passed |
| `qwen3.5-397b-a17b` | 262144 | 65536 | yes | yes | yes | passed |
| `qwen3.5-9b` | 262144 | 32768 | yes | yes | yes | passed |
| `qwen3.5-flash` | 1000000 | 64000 | yes | yes | no | passed |
| `qwen3.5-plus` | 1000000 | 64000 | yes | yes | no | inconclusive |
| `qwen3.6-27b` | 262144 | 32768 | yes | yes | yes | passed |
| `qwen3.6-35b` | 262144 | 65536 | yes | yes | yes | passed |
| `qwen3.6-flash` | 1000000 | 64000 | yes | yes | no | passed |
| `qwen3.6-plus` | 1000000 | 64000 | yes | yes | no | passed |
| `qwen3.7-flash` | 1000000 | 128000 | yes | yes | no | passed |
| `qwen3.7-max` | 1000000 | 65536 | no | yes | no | passed |
| `qwen3.7-plus` | 1000000 | 64000 | yes | yes | no | passed |
| `qwen3.8-27b` | 262144 | 32768 | yes | yes | yes | passed |
| `qwen3.8-max` | 1000000 | 128000 | yes | yes | yes | passed |
| `qwq-32b` | 24000 | 16384 | no | yes | no | passed |

## amazon

| Model ID | Input limit | Output limit | Image* | Reasoning* | JSON schema* | Basic response |
| --- | ---: | ---: | --- | --- | --- | --- |
| `nova-2-lite` | 256000 | 5000 | yes | yes | no | passed |
| `nova-lite` | 300000 | 5000 | yes | no | no | passed |
| `nova-micro` | 128000 | 5000 | no | no | no | passed |
| `nova-premier` | 1000000 | 20000 | yes | yes | no | passed |
| `nova-pro` | 300000 | 5000 | yes | no | no | passed |

## anthropic

| Model ID | Input limit | Output limit | Image* | Reasoning* | JSON schema* | Basic response |
| --- | ---: | ---: | --- | --- | --- | --- |
| `claude-fable-5` | 1000000 | 128000 | yes | yes | yes | passed |
| `claude-fable-5-1` | 1000000 | 128000 | yes | yes | yes | passed |
| `claude-haiku-4-5` | 200000 | 64000 | yes | yes | yes | passed |
| `claude-opus-4-1` | 200000 | 32000 | yes | yes | no | passed |
| `claude-opus-4-5` | 200000 | 64000 | yes | yes | yes | passed |
| `claude-opus-4-6` | 200000 | 128000 | yes | yes | yes | passed |
| `claude-opus-4-7` | 1000000 | 128000 | yes | yes | yes | passed |
| `claude-opus-4-8` | 1000000 | 128000 | yes | yes | yes | passed |
| `claude-opus-5` | 1000000 | 128000 | yes | yes | yes | passed |
| `claude-sonnet-4` | 200000 | 64000 | yes | yes | no | passed |
| `claude-sonnet-4-5` | 200000 | 64000 | yes | yes | yes | passed |
| `claude-sonnet-4-6` | 200000 | 64000 | yes | yes | yes | passed |
| `claude-sonnet-5` | 1000000 | 128000 | yes | yes | yes | passed |

## cohere

| Model ID | Input limit | Output limit | Image* | Reasoning* | JSON schema* | Basic response |
| --- | ---: | ---: | --- | --- | --- | --- |
| `command-a` | 256000 | 8192 | no | no | yes | passed |
| `command-a-vision` | 128000 | 8000 | yes | no | yes | passed |

## concentrate

| Model ID | Input limit | Output limit | Image* | Reasoning* | JSON schema* | Basic response |
| --- | ---: | ---: | --- | --- | --- | --- |
| `redact-v1` (excluded) | 256000 | 256000 | no | unknown | no | skipped |

## deepseek

| Model ID | Input limit | Output limit | Image* | Reasoning* | JSON schema* | Basic response |
| --- | ---: | ---: | --- | --- | --- | --- |
| `deepseek-r1` | 128000 | 32768 | no | yes | no | passed |
| `deepseek-r1-0528` | 163840 | 32768 | no | yes | yes | passed |
| `deepseek-r1-distill-32b` | 80000 | 80000 | no | yes | yes | passed |
| `deepseek-v3-0324` | 163840 | 32768 | no | no | yes | passed |
| `deepseek-v3-1` | 163840 | 32768 | no | yes | yes | passed |
| `deepseek-v3-2` | 163840 | 65536 | no | yes | yes | passed |
| `deepseek-v4-1-flash` | 1048576 | 393216 | yes | yes | yes | passed |
| `deepseek-v4-flash-0423` | 1048576 | 393216 | no | yes | yes | passed |
| `deepseek-v4-flash-0731` | 1048576 | 393216 | no | yes | yes | passed |
| `deepseek-v4-flash-vision-exp` | 1048576 | 393216 | yes | yes | yes | passed |
| `deepseek-v4-pro` | 1048576 | 1048576 | no | yes | yes | passed |
| `deepseek-v4-pro-0813` | 1048576 | 384000 | no | yes | yes | passed |

## google

| Model ID | Input limit | Output limit | Image* | Reasoning* | JSON schema* | Basic response |
| --- | ---: | ---: | --- | --- | --- | --- |
| `gemini-2.5-flash` | 1000000 | 65536 | yes | yes | yes | inconclusive |
| `gemini-2.5-flash-lite` | 1048576 | 65536 | yes | yes | yes | inconclusive |
| `gemini-2.5-pro` | 1000000 | 65536 | yes | yes | yes | inconclusive |
| `gemini-3-flash-preview` | 1000000 | 65536 | yes | yes | yes | inconclusive |
| `gemini-3.1-flash-lite-preview` | 1048576 | 65536 | yes | yes | yes | inconclusive |
| `gemini-3.1-pro-preview` | 1000000 | 65536 | yes | yes | yes | inconclusive |
| `gemini-3.5-flash` | 1048576 | 65536 | yes | yes | yes | inconclusive |
| `gemini-3.5-flash-lite` | 1048576 | 65536 | yes | yes | yes | inconclusive |
| `gemini-3.6-flash` | 1048576 | 65536 | yes | yes | yes | inconclusive |
| `gemini-3.7-flash` | 1048576 | 65536 | yes | yes | yes | inconclusive |
| `gemini-3.8-flash` | 1048576 | 65536 | yes | yes | yes | inconclusive |
| `gemma-3-12b` | 131072 | 32768 | yes | no | yes | inconclusive |
| `gemma-3-27b` | 131072 | 32768 | yes | no | yes | inconclusive |
| `gemma-3-4b` | 131072 | 32768 | yes | no | yes | inconclusive |
| `gemma-4-26b` | 262144 | 256000 | yes | yes | yes | inconclusive |
| `gemma-4-31b` | 262144 | 262141 | yes | yes | yes | inconclusive |
| `gemma-4-e4b` | 131072 | 32768 | no | yes | no | inconclusive |

## ibm

| Model ID | Input limit | Output limit | Image* | Reasoning* | JSON schema* | Basic response |
| --- | ---: | ---: | --- | --- | --- | --- |
| `ibm-granite-micro` | 131000 | 4096 | no | no | yes | passed |

## meta

| Model ID | Input limit | Output limit | Image* | Reasoning* | JSON schema* | Basic response |
| --- | ---: | ---: | --- | --- | --- | --- |
| `llama-3-70b-instruct` | 8000 | 2048 | no | no | no | passed |
| `llama-3-8b-instruct` | 8000 | 2048 | no | no | no | passed |
| `llama-3.1-70b-instruct` | 131072 | 32768 | no | no | yes | passed |
| `llama-3.1-8b-instruct` | 131072 | 32768 | no | no | no | passed |
| `llama-3.2-1b-instruct` | 60000 | 2048 | no | no | no | passed |
| `llama-3.2-3b-instruct` | 80000 | 80000 | no | no | yes | passed |
| `llama-3.3-70b-instruct` | 131072 | 120000 | no | no | yes | passed |
| `llama-4-maverick` | 1048576 | 32768 | yes | no | yes | passed |
| `llama-4-scout` | 327680 | 131072 | yes | no | yes | passed |
| `muse-glimmer-30b` | 131072 | 131072 | yes | yes | no | passed |
| `muse-spark-1.1` | 1048576 | 131072 | yes | yes | yes | passed |
| `muse-spark-1.2` | 1048576 | 131072 | yes | yes | yes | passed |
| `muse-spark-1.2-contributor` | 1048576 | 131072 | yes | yes | yes | passed |
| `muse-spark-1.3` | 1048576 | 131072 | yes | yes | yes | passed |
| `muse-spark-1.3-contributor` | 1048576 | 131072 | yes | yes | yes | passed |

## minimax

| Model ID | Input limit | Output limit | Image* | Reasoning* | JSON schema* | Basic response |
| --- | ---: | ---: | --- | --- | --- | --- |
| `minimax-m2` | 204800 | 131072 | no | yes | yes | passed |
| `minimax-m2-1` | 204800 | 131072 | no | yes | no | passed |
| `minimax-m2-1-highspeed` | 204800 | 8192 | no | yes | no | passed |
| `minimax-m2-5` | 204800 | 131072 | no | yes | no | passed |
| `minimax-m2-5-highspeed` | 204800 | 131072 | no | yes | no | passed |
| `minimax-m2-7` | 204800 | 131072 | no | yes | no | passed |
| `minimax-m2-7-highspeed` | 204800 | 131072 | no | yes | no | passed |
| `minimax-m3` | 1000000 | 512000 | yes | yes | yes | passed |

## mistral

| Model ID | Input limit | Output limit | Image* | Reasoning* | JSON schema* | Basic response |
| --- | ---: | ---: | --- | --- | --- | --- |
| `codestral` | 128000 | 32000 | no | no | yes | passed |
| `devstral-2` | 256000 | 32000 | no | no | yes | inconclusive |
| `magistral-small-1.2` | 128000 | 40000 | no | yes | yes | passed |
| `ministral-3-14b` | 256000 | 32000 | yes | no | yes | passed |
| `ministral-3-3b` | 256000 | 32000 | yes | no | yes | passed |
| `ministral-3-8b` | 256000 | 32000 | yes | no | yes | passed |
| `mistral-large-3` | 256000 | 32000 | yes | no | yes | passed |
| `mistral-medium-3` | 128000 | 32000 | yes | no | yes | passed |
| `mistral-medium-3.1` | 128000 | 32000 | yes | no | yes | passed |
| `mistral-nemo` | 131072 | 32768 | no | no | yes | passed |
| `mistral-small-3.1` | 128000 | 8192 | no | no | yes | passed |
| `mistral-small-3.2` | 128000 | 32768 | yes | no | yes | passed |

## moonshot

| Model ID | Input limit | Output limit | Image* | Reasoning* | JSON schema* | Basic response |
| --- | ---: | ---: | --- | --- | --- | --- |
| `kimi-k2-5` | 262144 | 262144 | yes | yes | yes | passed |
| `kimi-k2-6` | 262144 | 262144 | yes | yes | yes | passed |
| `kimi-k2-7-code` | 262144 | 262144 | yes | yes | yes | passed |
| `kimi-k2-thinking` | 262144 | 98304 | no | yes | yes | passed |
| `kimi-k3` | 1048576 | 1048576 | yes | yes | yes | passed |

## nvidia

| Model ID | Input limit | Output limit | Image* | Reasoning* | JSON schema* | Basic response |
| --- | ---: | ---: | --- | --- | --- | --- |
| `nemotron-3-120b` | 262144 | 262144 | no | yes | yes | passed |
| `nemotron-3-nano-30b` | 262144 | 262144 | no | yes | yes | passed |
| `nemotron-3-nano-omni` | 262144 | 262144 | yes | yes | yes | passed |
| `nemotron-3-ultra-nvfp4` | 262144 | 262144 | no | yes | yes | passed |
| `nemotron-lightning-3.5-30b` | 262144 | 32768 | no | yes | yes | passed |

## openai

| Model ID | Input limit | Output limit | Image* | Reasoning* | JSON schema* | Basic response |
| --- | ---: | ---: | --- | --- | --- | --- |
| `gpt-4.1` | 1047576 | 32768 | yes | no | yes | inconclusive |
| `gpt-4.1-mini` | 1047576 | 32768 | yes | no | yes | inconclusive |
| `gpt-4o` | 128000 | 16384 | yes | no | yes | inconclusive |
| `gpt-4o-mini` | 128000 | 16384 | yes | no | yes | inconclusive |
| `gpt-5` | 400000 | 128000 | yes | yes | yes | passed |
| `gpt-5-mini` | 400000 | 128000 | yes | yes | yes | passed |
| `gpt-5-nano` | 400000 | 128000 | yes | yes | yes | error |
| `gpt-5.1` | 400000 | 128000 | yes | yes | yes | passed |
| `gpt-5.2` | 400000 | 128000 | yes | yes | yes | passed |
| `gpt-5.3-codex` | 400000 | 128000 | yes | yes | yes | passed |
| `gpt-5.4` | 1050000 | 128000 | yes | yes | yes | passed |
| `gpt-5.4-mini` | 128000 | 128000 | yes | yes | yes | passed |
| `gpt-5.4-nano` | 128000 | 128000 | yes | yes | yes | passed |
| `gpt-5.4-pro` | 1050000 | 128000 | yes | yes | yes | passed |
| `gpt-5.5` | 1050000 | 128000 | yes | yes | yes | passed |
| `gpt-5.6-luna` | 1050000 | 128000 | yes | yes | yes | passed |
| `gpt-5.6-sol` | 1050000 | 128000 | yes | yes | yes | passed |
| `gpt-5.6-terra` | 1050000 | 128000 | yes | yes | yes | passed |
| `gpt-6-astra` | 1050000 | 128000 | yes | yes | yes | passed |
| `gpt-oss-120b` | 131072 | 131072 | no | yes | yes | skipped |
| `gpt-oss-20b` | 131072 | 128000 | no | yes | yes | skipped |
| `gpt-oss-safeguard-120b` | 128000 | 128000 | no | no | yes | inconclusive |
| `gpt-oss-safeguard-20b` | 128000 | 128000 | no | no | yes | inconclusive |
| `o1` | 200000 | 100000 | yes | yes | yes | error |
| `o3` | 200000 | 100000 | yes | yes | yes | error |
| `o3-mini` | 200000 | 100000 | no | yes | yes | error |
| `o4-mini` | 200000 | 100000 | yes | yes | yes | error |

## stepfunai

| Model ID | Input limit | Output limit | Image* | Reasoning* | JSON schema* | Basic response |
| --- | ---: | ---: | --- | --- | --- | --- |
| `step-3-7-flash` | 262144 | 256000 | yes | yes | yes | passed |

## tencent

| Model ID | Input limit | Output limit | Image* | Reasoning* | JSON schema* | Basic response |
| --- | ---: | ---: | --- | --- | --- | --- |
| `hy3` | 262144 | 262144 | no | yes | yes | passed |

## writer

| Model ID | Input limit | Output limit | Image* | Reasoning* | JSON schema* | Basic response |
| --- | ---: | ---: | --- | --- | --- | --- |
| `palmyra-x4` | 128000 | 8192 | no | no | no | passed |
| `palmyra-x5` | 128000 | 8192 | no | no | no | passed |

## xai

| Model ID | Input limit | Output limit | Image* | Reasoning* | JSON schema* | Basic response |
| --- | ---: | ---: | --- | --- | --- | --- |
| `grok-3-mini` | 131072 | 131072 | no | yes | yes | pending |
| `grok-4.20-0309-reasoning` | 2000000 | 131072 | yes | yes | yes | inconclusive |
| `grok-4.20-multi-agent-0309` | 2000000 | 131072 | yes | yes | yes | inconclusive |
| `grok-4.20-non-reasoning` | 2000000 | 131072 | yes | no | yes | pending |
| `grok-4.3` | 1000000 | 1000000 | yes | yes | yes | inconclusive |
| `grok-4.5` | 500000 | 500000 | yes | yes | yes | inconclusive |
| `grok-4.6` | 500000 | 500000 | yes | yes | yes | inconclusive |
| `grok-build-0.1` | 256000 | 256000 | yes | no | yes | inconclusive |

## xiaomi

| Model ID | Input limit | Output limit | Image* | Reasoning* | JSON schema* | Basic response |
| --- | ---: | ---: | --- | --- | --- | --- |
| `mimo-v2.5` | 1048576 | 131072 | yes | yes | yes | passed |
| `mimo-v2.5-pro` | 1048576 | 131072 | no | yes | yes | passed |

## zai

| Model ID | Input limit | Output limit | Image* | Reasoning* | JSON schema* | Basic response |
| --- | ---: | ---: | --- | --- | --- | --- |
| `glm-4.5` | 128000 | 96000 | no | yes | no | inconclusive |
| `glm-4.5v` | 131072 | 16384 | yes | yes | no | passed |
| `glm-4.6` | 202752 | 128000 | no | yes | yes | passed |
| `glm-4.6v` | 131072 | 32768 | yes | yes | no | passed |
| `glm-4.7` | 202752 | 128000 | no | yes | yes | passed |
| `glm-4.7-flash` | 202752 | 131072 | no | yes | yes | passed |
| `glm-5` | 202800 | 131072 | no | yes | yes | passed |
| `glm-5.1` | 204800 | 202752 | no | yes | yes | passed |
| `glm-5.2` | 1048576 | 256000 | no | yes | yes | passed |
| `glm-5.3` | 1048576 | 131072 | no | yes | yes | passed |
| `glm-5.3-flash` | 1048576 | 131072 | yes | yes | yes | passed |

*Asterisked capabilities are upstream metadata, not an installed-host certification. Tool support is unknown when the aggregate catalog does not declare it.*

## Per-model feature supplements

These supplements retain their own exact source, timestamps and classification. Earlier failures are not erased.

See the linked historical feature and release reports above for existing representative proofs. This generated directory does not promote basic-response passes into feature passes.

