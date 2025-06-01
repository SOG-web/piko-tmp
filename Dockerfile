FROM ghcr.io/andydunstall/piko:latest
COPY config/piko.yaml /etc/piko.yaml
CMD ["server", "--config.path=/etc/piko.yaml"]
