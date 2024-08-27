FROM postgres:12

ENV POSTGRES_USER=cybor \
    POSTGRES_PASSWORD=123456 \
    POSTGRES_DB=cybor

COPY schema.sql /docker-entrypoint-initdb.d/
RUN chmod 644 /docker-entrypoint-initdb.d/schema.sql


ENV TZ=Asia/Shanghai
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone