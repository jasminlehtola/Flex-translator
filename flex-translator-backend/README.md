# Flex Translator

This is the backend of Flex Translator, a web app for translating documents using AI tools ChatGPT and DeepL. The user can upload a file, apply custom prompts and dictionaries, and edit the translations manually before finalizing.

- Python 3.11+
- Flask (with Flask-Smorest for routes)
- SQLAlchemy + MySQL
- JWT Auth (access + refresh tokens)
- OAuth2 via Authlib
- OpenAI & DeepL APIs

# Deployment with Docker

1. Clone the repository `git clone https://gitlab.utu.fi/tech/soft/tools/edu-ai-tools/flex-translator/flex-translator-backend.git`
2. Create `.env` -file to the root of the project
3. In the env file:

Create the environment variables

```
# Database
DB_USER =<user>
DB_PASSWORD =<your_password>
DB_HOST =localhost
DB_NAME =translation_db

# OpenAI & DeepL
OPENAI_API_KEY=<YOUR_API_KEY>
DEEPL_API_KEY=<YOUR_API_KEY>

# GitLab OAuth
GITLAB_CLIENT_ID=<YOUR_ID>
GITLAB_CLIENT_SECRET=<YOUR_SECRET>

# JWT keys
SECRET_TOKEN_KEY=<your_jwt_access_secret>
SECRET_REFRESH_KEY=<your_jwt_refresh_secret>
```

4. Run the script `run install.sh`.
   The script builds and starts the Docker containers immediately.

If you later want to start the containers (without building again), use command: `docker compose up`

If you want to rebuild the app with new code changes, and keep the current database:

```
# 1. Stop the containers
docker compose down

# 2. Build the project again
docker compose build
# If you run into issues, you can try "docker compose build --no-cache"
# This will build slower, but ensure it's done without using data from the previous builds.

# 3. Run the app
docker compose up
```

# Installation instructions for development

1. Clone the repository `git clone https://gitlab.utu.fi/tech/soft/tools/edu-ai-tools/flex-translator/flex-translator-backend.git` -->
   `cd flex-translator-backend`
2. Create virtual environment: `python -m venv venv`. Activate it:
   `source venv/bin/activate`
   On Windows: `venv\Scripts\activate`
3. Install dependencies: `pip install -r requirements.txt`
4. Create `.env` file to the root
5. In the env file:

Create the environment variables as shown above.

6. Download MySQL server and some visualization tool (e.g. DBVisualizer or MySQLWorkbench).
7. Create server and update the credentials.
   - Additional note: The dump is added, but make sure it is up-to-date with latest changes before using it.

**Start backend**

`flask run --debug`
App is now running at http://localhost:5000
