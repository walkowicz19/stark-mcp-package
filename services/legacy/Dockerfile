FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy and install shared requirements
COPY shared/requirements.txt /app/shared/requirements.txt
RUN pip install --no-cache-dir -r shared/requirements.txt

# Copy shared code
COPY shared /app/shared

# Copy service code
COPY legacy /app/legacy

# Set Python path to include /app so shared module can be imported
ENV PYTHONPATH=/app

WORKDIR /app/legacy

# Expose port
EXPOSE 8007

# Run service
CMD ["python", "main.py"]
