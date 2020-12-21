FROM nginx
 
COPY ./web /var/www/html
RUN mkdir /var/www/html/ssl
COPY ssl /var/www/html/ssl


COPY default.conf /etc/nginx/conf.d
#COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80 443
