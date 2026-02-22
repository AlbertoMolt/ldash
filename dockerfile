FROM python:3.11-alpine
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN apk add --no-cache --virtual .build-deps gcc musl-dev linux-headers \
    && pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt \
    && apk del .build-deps

# Copy application code
COPY . .

# Environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=6780

# Create data directory
RUN mkdir -p /app/data && \
    if [ -f /app/database.csv ]; then cp /app/database.csv /app/data/database.csv; fi

VOLUME ["/app/data"]
EXPOSE 6780

CMD ["python", "app.py"]