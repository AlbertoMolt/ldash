FROM python:3.11-alpine

LABEL maintainer="AlbertoMoltrasio"
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

RUN mkdir -p /app/data && \
    if [ -f /app/database.csv ]; then cp /app/database.csv /app/data/database.csv; fi

VOLUME ["/app/data"]

EXPOSE 6780

CMD ["python", "app.py"]