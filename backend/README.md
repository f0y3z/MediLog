# make sure pyhton is install 





``` python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
```

# terminal 1

``` sudo systemctl start redis-server
    celery -A config worker --loglevel=info
```
# terminal 2
``` python3 manage.py runserver

```