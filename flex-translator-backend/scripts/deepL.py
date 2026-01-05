import requests
import time

DEEPL_API_KEY = "2a8f4976-d2fd-25fa-63aa-5bc396b7b06c"  # 🔥 Replace with a new key ASAP
FILE_PATH = "C:/Users/jajohl/Downloads/utu.pdf"
TARGET_LANG = "EN"  # Change as needed (e.g., DE, FR, ES)
SOURCE_LANG = "FI"

# 1. Upload the document
upload_url = "https://api.deepl.com/v2/document"
headers = {
    "Authorization": f"DeepL-Auth-Key {DEEPL_API_KEY}"
}
files = {
    "file": open(FILE_PATH, "rb")
}
data = {
    "target_lang": TARGET_LANG,
    "source_lang": SOURCE_LANG,
    "output_format": "docx"
}

print("Uploading document...")
response = requests.post(upload_url, headers=headers, files=files, data=data)
files["file"].close()

if response.status_code != 200:
    print("Upload failed:", response.text)
    exit(1)

doc_info = response.json()
document_id = doc_info["document_id"]
document_key = doc_info["document_key"]
print(f"Upload successful.\nDocument ID: {document_id}\nDocument Key: {document_key}")

# 2. Poll for translation status
status_url = f"https://api.deepl.com/v2/document/{document_id}"
status_data = {
    "document_key": document_key
}

print("Waiting for translation to complete...")
while True:
    status_response = requests.post(status_url, headers=headers, data=status_data)
    status_json = status_response.json()
    status = status_json.get("status")
    print(f"Status: {status}")
    if status == "done":
        break
    elif status == "error":
        print("Translation error:", status_json)
        exit(1)
    time.sleep(5)  # Wait before polling again

# 3. Download the translated document
download_url = f"https://api.deepl.com/v2/document/{document_id}/result"
download_data = {
    "document_key": document_key
}
output_file = "translated.pdf"

print("Downloading translated file...")
download_response = requests.post(download_url, headers=headers, data=download_data)

if download_response.status_code != 200:
    print("Download failed:", download_response.text)
    exit(1)

with open(output_file, "wb") as f:
    f.write(download_response.content)

print(f"Translation complete. File saved as {output_file}.")