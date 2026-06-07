FROM python:3.12.4

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN mkdir -p /ssl

# Download DigiCert root certificate for Azure MySQL
# Try multiple sources to ensure we get the full certificate
RUN curl -f -o /ssl/DigiCertGlobalRootG2.crt.pem \
    https://dl.cacerts.digicert.com/DigiCertGlobalRootG2.crt.pem || \
    curl -f -o /ssl/DigiCertGlobalRootG2.crt.pem \
    https://www.digicert.com/CACerts/DigiCertGlobalRootG2.crt.pem || \
    curl -f -o /ssl/DigiCertGlobalRootG2.crt.pem \
    https://cacerts.digicert.com/DigiCertGlobalRootG2.crt.pem

# Verify certificate was downloaded and has content
RUN ls -lh /ssl/DigiCertGlobalRootG2.crt.pem && \
    wc -l /ssl/DigiCertGlobalRootG2.crt.pem && \
    head -c 100 /ssl/DigiCertGlobalRootG2.crt.pem && \
    echo "✓ SSL certificate downloaded and verified"

# Copy requirements first
COPY requirements.txt requirements.txt

# Install dependencies and SSH server
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir gunicorn

# Copy the whole Django project
COPY ./jit /app

EXPOSE 8000