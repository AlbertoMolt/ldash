FROM python:3.11-alpine

LABEL manteiner="AlbertoMoltrasio"
LABEL description="A lightweight dashboard"

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=6780

COPY requirements.txt .

RUN apk add --no-cache --virtual .build-deps gcc musl-dev linux-headers \
    && pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt \
    && apk del .build-deps

COPY . .

EXPOSE ${PORT}

CMD ["sh", "-c", "python /app/generate_config.py && python app.py"]