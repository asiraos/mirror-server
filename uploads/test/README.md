# FlameOS Mirror

## Upload API

Upload files via POST request:

```bash
# Upload to root
curl -X POST -F "file=@yourfile.zip" http://localhost:3000/api/upload

# Upload to folder
curl -X POST -F "file=@yourfile.zip" http://localhost:3000/api/upload/myfolder/
```

## Download

Access files via web interface at `http://localhost:3000` or direct download:
```
http://localhost:3000/download/filename.zip
http://localhost:3000/download/folder/filename.zip
```

## Start Server

```bash
npm start
```
