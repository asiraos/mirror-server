#!/bin/bash


API_KEY="your-api-key-here"
SERVER_URL="http://92.4.71.202:6060"

if [ $# -ne 2 ]; then
    echo "Usage: $0 <folder_path> <filename>"
    echo "Example: $0 documents myfile.zip"
    echo "Example: $0 . myfile.zip (for root)"
    exit 1
fi

FOLDER="$1"
FILENAME="$2"

if [ ! -f "$FILENAME" ]; then
    echo "Error: File '$FILENAME' not found"
    exit 1
fi

if [ "$FOLDER" = "." ]; then
    URL="$SERVER_URL/api/upload"
else
    URL="$SERVER_URL/api/upload/$FOLDER/"
fi

echo "Uploading $FILENAME to $FOLDER..."
curl --max-time 0 --http1.1 --tcp-nodelay --keepalive-time 60 -v -X POST -F "file=@$FILENAME" -H "Authorization: Bearer $API_KEY" "$URL"
echo ""
