#!/usr/bin/env bash

openssl genrsa -out var/rootCA.key 2048
openssl req -x509 -new -nodes -key var/rootCA.key -sha256 -days 1826 -subj "/C=FR/ST=France/L=Paris/O=GXApplications/OU=Asterism/CN=GXApplications" -out var/rootCA.pem
openssl pkcs12 -inkey var/rootCA.key -in var/rootCA.pem -export -out var/rootCA.p12 -password pass:
openssl genrsa -out var/asterism.key 2048
openssl req -new -key var/asterism.key -subj "/C=FR/ST=France/L=Paris/O=GXApplications/OU=Asterism/CN=$HOST/emailAddress=gxapplications@gmail.com" -out var/asterism.csr
openssl x509 -req -in var/asterism.csr -CA var/rootCA.pem -CAkey var/rootCA.key -CAcreateserial -out var/asterism.pem -days 1825 -sha256 -extfile <(printf "subjectAltName=IP:$HOST")
openssl pkcs12 -inkey var/asterism.key -in var/asterism.pem -export -out var/asterism.p12 -password pass:
