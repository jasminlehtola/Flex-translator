# GPT model used for translations
GPT_MODEL = "gpt-4o"

# Prompt given to ChatGPT at the beginning of each translation session
INITIAL_PROMPT = (
    "You are a translator. Localize and translate the materials to English. "
    "Keep the meaning of the exercise in translation, but it does not need to be a literal translation. "
    "If there are Finnish names, change them to names used in England. Keep every actor the same."
)

# Prompt used when conversation history or previous corrections are included
CONVERSATION_HISTORY_PROMPT = (
    "I have made some changes to last translation. "
    "Please take a look at the conversation history and use these changes in upcoming translations. "
    "The changes are in this format: ('Chunk [n]:' 'original word' → 'new word'). "
    "Here are the changes I made: "
)

# Instructions header for user-specific translation prompts
USER_PROMPT_INSTRUCTIONS = (
    "Here are instructions for translating this chunk: "
)

# Instructions header for enforcing word replacements via dictionary
DICTIONARY_INSTRUCTIONS = (
    "Here are words that I want you to use over these:"
)
