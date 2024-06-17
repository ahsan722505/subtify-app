from faster_whisper import WhisperModel
import json
import sys

model_size = "small"
model = WhisperModel(model_size, device="cpu", compute_type="int8")
input_data = json.loads(sys.stdin.read())
segments, info = model.transcribe(input_data["filePath"], beam_size=5,language="en")
output = []
for segment in segments:
    output.append({"start": segment.start, "end": segment.end, "text": segment.text})
print(json.dumps(output))
