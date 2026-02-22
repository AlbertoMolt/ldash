FROM python:3.11-slim
WORKDIR /app

COPY requirements.txt .

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        gcc \
        g++ \
        make \
        python3-dev \
        libffi-dev \
        libevent-dev \
    && pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt \
    && apt-get purge -y --auto-remove \
        gcc \
        g++ \
        make \
        python3-dev \
        libffi-dev \
        libevent-dev \
    && rm -rf /var/lib/apt/lists/*

COPY . .

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=6780

RUN mkdir -p /app/data && \
    if [ -f /app/database.csv ]; then cp /app/database.csv /app/data/database.csv; fi

VOLUME ["/app/data"]
EXPOSE 6780

CMD ["python", "app.py"]