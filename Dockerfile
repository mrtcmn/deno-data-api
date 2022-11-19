FROM denoland/deno:latest
EXPOSE 8080
WORKDIR /app
USER deno
COPY . .
RUN deno cache index.ts
RUN mkdir -p /var/tmp/log
CMD ["run", "-A","--unstable", "index.ts"]
