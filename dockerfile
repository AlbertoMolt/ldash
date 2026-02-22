FROM python:3.11-slim
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=6780

RUN mkdir -p /app/data && \
    if [ -f /app/database.csv ]; then cp /app/database.csv /app/data/database.csv; fi

VOLUME ["/app/data"]
EXPOSE 6780

CMD ["python", "app.py"]