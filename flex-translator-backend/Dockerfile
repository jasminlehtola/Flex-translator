FROM python:3.12-slim 

WORKDIR flex_translator

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt 

COPY . . 

EXPOSE 5000

ENV FLASK_ENV=production

CMD ["gunicorn", "run:app", "--bind", "0.0.0.0:5000" ]

